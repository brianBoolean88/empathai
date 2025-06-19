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