from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
import torch
import asyncio

import nltk
nltk.download('punkt_tab')

from nltk.tokenize import sent_tokenize

import threading

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

    tokenizer = AutoTokenizer.from_pretrained("mistralai/Mistral-7B-Instruct-v0.1")
    model = AutoModelForCausalLM.from_pretrained(
        "mistralai/Mistral-7B-Instruct-v0.1",
        torch_dtype=torch.float16,
        device_map="auto",
        quantization_config=bnb_config
    )
    model.eval()
    model_ready = True
    print("✅ Model loaded and ready")

threading.Thread(target=load_model).start()

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    prompt: str

@app.get("/status")
async def check_status():
    return {"status": "ready" if model_ready else "loading"}

@app.post("/generate")
async def generate_text(request: GenerateRequest):
    if not model_ready:
        return {"generated_text": "Model is still loading, please try again."}

    if not request.prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")
    
    prompt = f"[INST] {request.prompt} [/INST]"
    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=4096).to(model.device)

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
