from transformers import AutoTokenizer, AutoModelForCausalLM, TrainingArguments, Trainer, DataCollatorForLanguageModeling, BitsAndBytesConfig
from peft import get_peft_model, LoraConfig, TaskType, PeftModel
from huggingface_hub import HfApi, create_repo
import torch
from datasets import load_dataset


def preprocess_function(examples):
    result = tokenizer(examples["text"], truncation=True, padding="max_length", max_length=512)
    result["labels"] = result["input_ids"].copy()
    return result


bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True,
    bnb_4bit_quant_type="nf4"
)

model_name = "mistralai/Mistral-7B-Instruct-v0.1"

tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    quantization_config=bnb_config,
    device_map="auto",
    torch_dtype=torch.float16,
)

peft_config = LoraConfig(
    r=8,
    lora_alpha=16,
    task_type=TaskType.CAUSAL_LM,
    lora_dropout=0.05,
    bias="none"
)

model = get_peft_model(model, peft_config)

training_args = TrainingArguments(
    per_device_train_batch_size=2,
    gradient_accumulation_steps=4,
    num_train_epochs=3,
    learning_rate=2e-4,
    fp16=True,
    output_dir="./mistral-therapist",
    save_total_limit=2,
    save_steps=100,
    logging_steps=10,
    report_to="none",
    remove_unused_columns=False
)

formatted_dataset = load_dataset("json", data_files="therapy_data.jsonl", split="train")

tokenized_dataset = formatted_dataset.map(preprocess_function, batched=True, remove_columns=["text"])

trainer = Trainer(
    model=model,
    train_dataset=tokenized_dataset,
    tokenizer=tokenizer,
    args=training_args,
    data_collator=DataCollatorForLanguageModeling(tokenizer, mlm=False),
)

#trainer.train()

model.save_pretrained("./mistral-therapist")
tokenizer.save_pretrained("./mistral-therapist")

#create_repo("briantruefalse/Mistral-7B-Instruct-Empathy", private=False)

model.push_to_hub("briantruefalse/Mistral-7B-Instruct-Empathy")
tokenizer.push_to_hub("briantruefalse/Mistral-7B-Instruct-Empathy")
