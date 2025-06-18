export async function POST(req) {
  console.log("Received request to /api/respond");
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
      return new Response(JSON.stringify({ reply: "Please talk to me again!" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const emotionData = await emotionRes.json();
    const emotion = emotionData[0]?.label || "neutral";

    console.log("Detected emotion:", emotion);
    if (!emotion) {
      console.error("No emotion detected");
    }

    const prompt = `The user feels ${emotion}. Respond empathetically to this message: "${text}"`;
    console.log("Sending prompt to Hugging Face Emotion Responder:", prompt);

    const responseRes = await fetch("https://api-inference.huggingface.co/models/HelpingAI/HelpingAI2-9B", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!responseRes.ok) {
      console.error("Response generation failed:", responseRes.statusText);
      return new Response(JSON.stringify({ reply: "Please talk to me again!" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const rawText = await responseRes.text();
    console.log("Raw response:", rawText);

    const responseData = await responseRes.json();
    const reply = responseData[0]?.generated_text || "I'm here for you.";
    console.log("Response from Hugging Face Emotion Responder:", reply);

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("API Error:", err);
    return new Response(JSON.stringify({ reply: "Please talk to me again!" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
