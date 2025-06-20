import threading
#from nltk.tokenize import sent_tokenize
#import nltk
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
import torch
import argostranslate.package
import argostranslate.translate

import asyncio
from contextlib import asynccontextmanager
from typing import List

global installedLanguages
installedLanguages = False

#nltk.download('punkt_tab')

model_id = "briantruefalse/Mistral-7B-Instruct-Empathy"
#model_id = "mistralai/Mistral-7B-Instruct-v0.1"
model_ready = False
tokenizer = None
model = None

def warm_up():
    dummy = tokenizer("[INST] Hello [/INST]", return_tensors="pt").to(model.device)
    with torch.inference_mode():
        model.generate(**dummy, max_new_tokens=2)

def load_model():
    global tokenizer, model, model_ready
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_use_double_quant=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.float16,
    )

    tokenizer = AutoTokenizer.from_pretrained(model_id, use_fast=True)
    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        torch_dtype=torch.float16,
        device_map="cuda",
        attn_implementation="flash_attention_2",
        quantization_config=bnb_config
    )
    model.eval()
    model = torch.compile(model, mode="max-autotune")
    warm_up()

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

@asynccontextmanager
async def lifespan(app: FastAPI):
    batch_worker_task = asyncio.create_task(batch_worker())
    
    yield

    batch_worker_task.cancel()
    try:
        await batch_worker_task
    except asyncio.CancelledError:
        pass

threading.Thread(target=load_model).start()
threading.Thread(target=load_translation_models).start()

app = FastAPI(lifespan = lifespan)

class GenerateRequest(BaseModel):
    prompt: str

request_queue = asyncio.Queue()
BATCH_SIZE = 8
BATCH_TIMEOUT = 0.01  # seconds

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


class RequestWrapper:
    def __init__(self, prompt):
        self.prompt = prompt
        self.future = asyncio.get_event_loop().create_future()

@app.post("/generate")
async def generate_text(request: GenerateRequest):
    wrapper = RequestWrapper(request.prompt)
    await request_queue.put(wrapper)
    result = await wrapper.future
    return {"generated_text": result}

async def batch_worker():
    while True:
        batch = []
        try:
            wrapper = await request_queue.get()
            batch.append(wrapper)

            #we keep appending batches till we hit the size
            try:
                while len(batch) < BATCH_SIZE:
                    wrapper = await asyncio.wait_for(request_queue.get(), timeout=BATCH_TIMEOUT)
                    batch.append(wrapper)
            except asyncio.TimeoutError:
                pass

            prompts = [f"[INST] {w.prompt} [/INST]" for w in batch]

            #return batch of prompts
            inputs = tokenizer(prompts, return_tensors="pt", padding=True, truncation=True, max_length=4096)

            #CPU staging in fixed areas
            inputs = {k: v.pin_memory() for k, v in inputs.items()}
            inputs = {k: v.to(model.device, non_blocking=True) for k, v in inputs.items()}

            with torch.inference_mode():
                outputs = model.generate(
                    **inputs,
                    max_new_tokens=80,
                    do_sample=False,
                    eos_token_id=tokenizer.eos_token_id,
                    use_cache=True,
                )

            #decode in a batch
            results = tokenizer.batch_decode(outputs, skip_special_tokens=True)
            clean_outputs = [text.split("[/INST]")[-1].strip() for text in results]

            for wrapper, output in zip(batch, clean_outputs):
                wrapper.future.set_result(output)

        except Exception as e:
            for wrapper in batch:
                if not wrapper.future.done():
                    wrapper.future.set_exception(e)