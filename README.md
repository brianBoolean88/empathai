# 🤖 Empath AI

Empath AI delivers compassionate and understanding conversations powered by a finely tuned AI model. Built to listen, understand, and respond with empathy.

## ✨ Features

### 🧠 AI-Powered Insights
Empath AI uses fine-tuned models built on top of Hugging Face’s state-of-the-art architectures, ensuring high performance and scalability for dynamic, real-world conversations.

### ⚡ Real-Time Data Processing
Efficiently handles live data streams with low latency. Real-time processing enables dynamic interactions and smooth conversation flows.

### 🌍 Multi-Language Support
Supports **9 languages** with automatic translation, enabling users across the globe to connect with empathy and understanding.

### 🔐 Secure & Anonymous
User privacy is a top priority. All interactions are completely anonymous and never stored. Conversations are end-to-end protected.

## 🧩 Models Used

Empath AI leverages three Hugging Face models:

- 🧪 **Emotion Predictor**: [distilbert-base-uncased-emotion](https://huggingface.co/bhadresh-savani/distilbert-base-uncased-emotion)  
  Used to detect the emotional state of the user before generating responses.

- 🔧 **Base Language Model**: [Mistral-7B-Instruct-v0.1](https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.1)  
  Served as the foundation for fine-tuning with empathetic data.

- 💖 **Fine-Tuned Empathy Model**: [Mistral-7B-Instruct-Empathy](https://huggingface.co/briantruefalse/Mistral-7B-Instruct-Empathy)  
  A custom fine-tuned version trained on emotional and supportive conversations from Reddit, emotional corpora, and therapy-style datasets.

## 🚀 Tech Stack

- **Backend**: [FastAPI](https://fastapi.tiangolo.com/)  
- **Language**: Python  
- **Model Inference**: Hugging Face Transformers  
- **Deployment**: Easily deployable with scalable backends (e.g., VLLM, NVIDIA RTX setups)

## 📦 Installation
### There are two parts to set up: the front-end and back-end.
- #### Front end
  1. You could simply clone this repository to your local folder, and then download nextjs.
  2. Run 'npm build' and then 'npm start' for a finalized build or 'npm run dev' for localized testing
- #### Back end
  1. Download all python packages inside of requirements.txt
  2. This project utilizes PyTorch version 2.5.1+cu121, CUDA version 12.1, and Python 3.11.8. You could upgrade these packages, although there likely will be version mismatch errors.
  3. Utilize flash attention 2. I specifically downloaded the version from the following [URL](https://huggingface.co/lldacing/flash-attention-windows-wheel/resolve/main/flash_attn-2.7.0.post2%2Bcu124torch2.5.1cxx11abiFALSE-cp311-cp311-win_amd64.whl)
      - If you are on windows, please find rotary.py and modeling_flash_attention_utils.py, and then delete any imports of Triton.
      - Replace the line ```from flash_attn.layers.rotary import apply_rotary_emb``` with ```apply_rotary_emb = None```
      - Replace the line ```def apply_rotary(*args, **kwargs): raise NotImplementedError("Triton not available on Windows")``` with ```apply_rotary = None```
      - These could appear anywhere within these two files. The key idea here is to not import triton as that package was built natively for Linux.
      - You could also choose to download WSL2 to build a python environment to simulate linux in your windows machine to run this project with flash attention 2.
  4. Create a .env file
  5. Go to HuggingFace and get a HUGGINGFACE_API_KEY. Then, paste the key in the .env file with the line ```HUGGINGFACE_API_KEY = keyID```
  6. Then, find your host link of which will your python backend will be running, then create a new line in .env: ``` NEXT_PUBLIC_API_URL = http://HOST:PORT```
  7. Run the python backend file: uvicorn app:app --host *[YOUR CHOICE OF HOST HERE]* --reload --port *[YOUR CHOICE OF PORT HERE]*

Finally, you could enjoy your AI therapy bot. This bot will utilize your GPU for token generations and therefore will have speeds relative to your computer specs. The speed has already been optimized by 4x with token generation practices.