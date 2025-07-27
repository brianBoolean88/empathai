export async function POST(req) {
    const { text } = await req.json();
    const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;

    if (!HF_TOKEN) {
        console.error("Missing Hugging Face API token!");
        return new Response(JSON.stringify({ response: "Server misconfigured" }), {
            status: 500,
        });
    }

    const response = await fetch("https://api-inference.huggingface.co/models/google/flan-t5-small", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
    });

    console.log("Hugging Face status:", response.status);

    if (!response.ok) {
        return new Response(JSON.stringify({ response: "I encountered an error while processing your request. Please try again. ⚠️" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }

    const data = await response.json();
    const reply = data?.generated_text || "Hmm, I’m not sure how to respond to that.";

    return new Response(JSON.stringify({ response: reply }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}
