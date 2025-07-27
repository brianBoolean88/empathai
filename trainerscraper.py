from datasets import load_dataset
import json

dataset = load_dataset("fadodr/mental_health_therapy", split="train")
output_file = "therapy_data_scraped.jsonl"


with open(output_file, "w", encoding="utf-8") as f:
    for example in dataset:
        #print(example)
        inst = example.get("instruction", "").strip()
        prompt = example.get("input", "").strip()
        response = example.get("output", "").strip()
        
        if prompt and response:
            formatted_text = f'<s>[INST] {inst} {" "} {prompt} [/INST] {response}</s>'
            json_line = {"text": formatted_text}
            f.write(json.dumps(json_line, ensure_ascii=False) + "\n")
            #print(f"Saved {formatted_text} to the dataset.")

print(f"Saved {len(dataset)} entries to {output_file}")
