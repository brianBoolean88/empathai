from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# Initialize FastAPI app
app = FastAPI()

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    text: str

MODEL_NAME = "tiiuae/falcon-rw-1b"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)

@app.post("/api/respond")
async def respond(message: Message):
    try:
        prompt = f"You are an empathetic assistant. Respond to this: {message.text}"
        inputs = tokenizer(prompt, return_tensors="pt").to(device)
        
        output = model.generate(
            **inputs,
            max_new_tokens=100,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            pad_token_id=tokenizer.eos_token_id
        )
        
        response_text = tokenizer.decode(output[0], skip_special_tokens=True).replace(prompt, "").strip()

        return { "response": response_text }

    except Exception as e:
        print("Error:", e)
        return { "response": "Sorry, something went wrong processing your message." }
