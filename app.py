from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    text: str

model = AutoModelForCausalLM.from_pretrained("OEvortex/HelpingAI2-9B", trust_remote_code=True)
tokenizer = AutoTokenizer.from_pretrained("OEvortex/HelpingAI2-9B", trust_remote_code=True)
model.eval()

@app.post("/api/respond")
async def respond(message: Message):
    chat = [
        {"role": "system", "content": "You are HelpingAI, an emotional AI. Always answer in the HelpingAI style."},
        {"role": "user", "content": message.text}
    ]

    inputs = tokenizer.apply_chat_template(
        chat,
        add_generation_prompt=True,
        return_tensors="pt"
    ).to(model.device)

    with torch.no_grad():
        outputs = model.generate(
            inputs,
            max_new_tokens=256,
            do_sample=True,
            temperature=0.6,
            top_p=0.9,
            eos_token_id=tokenizer.eos_token_id
        )

    response = outputs[0][inputs.shape[-1]:]
    decoded = tokenizer.decode(response, skip_special_tokens=True)
    return {"reply": decoded}
