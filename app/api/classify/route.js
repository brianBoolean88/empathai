export async function POST(req) {
  console.log("Received request to /api/classify");
  const body = await req.json();
  const { text } = body;
  const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;

  try {
    console.log("Sending text to Hugging Face Emotion Classifier:", text);
    const emotionRes = await fetch("https://api-inference.huggingface.co/models/bhadresh-savani/distilbert-base-uncased-emotion", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    });

    if (!emotionRes.ok) {
      console.error("Emotion classification failed:", emotionRes.statusText);
      return new Response(JSON.stringify({ reply: "Emotion Detection Error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const emotionData = await emotionRes.json();
    const emotion = emotionData[0]?.label || "neutral";

    console.log("Detected emotion:", emotion);

    return new Response(JSON.stringify({ emotion }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("API Error:", err);
    return new Response(JSON.stringify({ reply: "Emotion Detection Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
