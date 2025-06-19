import threading
from nltk.tokenize import sent_tokenize
import nltk
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
import torch
import argostranslate.package
import argostranslate.translate

global installedLanguages
installedLanguages = False

nltk.download('punkt_tab')

model_id = "briantruefalse/Mistral-7B-Instruct-Empathy"
#model_id = "mistralai/Mistral-7B-Instruct-v0.1"
model_ready = False
tokenizer = None
model = None


def remove_incomplete_last_sentence(text):
    sentences = sent_tokenize(text)
    if not text.strip().endswith(('.', '!', '?')) and sentences:
        sentences = sentences[:-1]
    return ' '.join(sentences)


def load_model():
    global tokenizer, model, model_ready
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_use_double_quant=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.float16,
    )

    tokenizer = AutoTokenizer.from_pretrained(model_id)
    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        torch_dtype=torch.float16,
        device_map="cuda",
        quantization_config=bnb_config
    )
    model.eval()
    model_ready = True
    print("✅ Model loaded and ready")

def load_translation_models():
    global installedLanguages
    lang_codes = [
        "es", "fr", "de", "zh", "zt", "ar",
        "pt", "it", "nl"
    ]

    for target_lang in lang_codes:
        try:
            package_path = "public/langModels/translate-en_" + target_lang + ".argosmodel"

            with open(package_path, "rb") as f:
                argostranslate.package.install_from_path(package_path)
            print(f"Installed en → {target_lang}")
        except Exception as e:
            print(f"Failed for en → {target_lang}: {e}")

    installedLanguages = True


threading.Thread(target=load_model).start()
threading.Thread(target=load_translation_models).start()

app = FastAPI()


@app.get("/status")
async def check_status():
    global installedLanguages, model_ready
    if installedLanguages == False:
        return {"status": "language"}
    return {"status": "ready" if model_ready else "loading"}

installed_languages = argostranslate.translate.get_installed_languages()


def get_translation_function(target_code: str):
    from_lang = next(
        (lang for lang in installed_languages if lang.code == "en"), None)
    to_lang = next(
        (lang for lang in installed_languages if lang.code == target_code), None)
    if not from_lang or not to_lang:
        return None
    return from_lang.get_translation(to_lang)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TranslateRequest(BaseModel):
    text: str
    target: str


class GenerateRequest(BaseModel):
    prompt: str


@app.post("/translate")
async def translate_text(req: TranslateRequest):
    if not req.text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    if req.target == req.text:
        return {"translated_text": req.text}
    translation_fn = get_translation_function(req.target)
    if not translation_fn:
        raise HTTPException(
            status_code=400, detail=f"Translation to '{req.target}' not available or not installed.")

    print(req)
    translated = translation_fn.translate(req.text)
    print(translated)
    return {"translated_text": translated}


@app.post("/generate")
async def generate_text(request: GenerateRequest):
    if not model_ready:
        return {"generated_text": "Model is still loading, please try again."}

    if not request.prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")

    prompt = f"[INST] {request.prompt} [/INST]"
    inputs = tokenizer(prompt, return_tensors="pt",
                       truncation=True, max_length=4096).to(model.device)

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=80,
            do_sample=False,
            temperature=0.8,
            top_p=0.95,
            eos_token_id=tokenizer.eos_token_id
        )

    generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    output = generated_text.split("[/INST]")[-1].strip()
    final_output = remove_incomplete_last_sentence(output)
    return {"generated_text": final_output}
