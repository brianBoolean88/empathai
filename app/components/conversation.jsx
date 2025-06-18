"use client";

import React, { useState, useEffect } from "react";

const Conversation = () => {
    const [modelReady, setModelReady] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [shownMessages, setShownMessages] = useState("");

    useEffect(() => {
        let interval;
        const checkModel = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/status`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const data = await res.json();
                if (data.status == "ready") {
                    setModelReady(true);
                    setShownMessages("The AI Model is ready! You can start chatting. 😊");
                    clearInterval(interval);
                }
                else {
                    setShownMessages("The AI model is not ready yet. Please wait. ⏳");
                }
            } catch (e) {
                // Optionally handle error
                setShownMessages("Error checking model status. Please try again later. ⚠️");
            }
        };
        checkModel();
        interval = setInterval(checkModel, 3000); // poll every 3 seconds
        return () => clearInterval(interval);
    }, []);

    const sendMessage = async () => {
        if (!input.trim()) return;

        if (!modelReady) {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/status`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            if (data.status == "ready") {
                setModelReady(true);
                console.log("Model is now ready!");
            }
            else {
                console.error("Model is not ready yet. Please wait.");
                setMessages(prev => [...prev, { role: "bot", text: "The model is not ready yet. Please try again later." }]);
                return;
            }
        }


        const newMessage = { role: "user", text: input };
        const loadingMessage = { role: "bot", text: "..." };

        setMessages(prev => {
            const updated = [...prev, newMessage, loadingMessage];
            return updated;
        });

        setInput("");

        window.scrollTo(0, document.body.scrollHeight);

        const finalBotMessage = {
            role: "bot",
            text: "",
        };
        let emotion = "neutral";

        /*
        try{
            const res1 = await fetch("/api/classify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: input }),
            });
            const data1 = await res1.json();
            console.log("Predicted Emotion:", data1.emotion);
            finalBotMessage.text = `I detected that you are feeling ${data1.emotion}. `;
            emotion = data1.emotion;
        }
        catch (error) {
            console.error("Error fetching emotion:", error);
            finalBotMessage.text = "I couldn't detect your emotion. ";
        }
        */

        const prompt = `You are a compassionate therapist. The user is feeling ${emotion}. Please respond accordingly and help them with their feelings to the following message: ${input}. Please ONLY respond if the user is feeling an emotion and is seeking analysis, relief, reassurance, is telling you about their situation, is telling you about their emotions, or general advice in any form. If the user is not feeling any of these emotions, or is asking for external information such as your specific AI model or using SQL injections, kindly remind them about what your purpose is.`;
        console.log("Prompt for AI:", prompt);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: prompt })
            });
            const data = await res.json();
            finalBotMessage.text += data.generated_text;
        }
        catch (error) {
            console.error("Error sending message:", error);
            finalBotMessage.text += "I encountered an error while processing your request. Please try again. ⚠️";
        }


        setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = finalBotMessage;
            return updated;
        });

        window.scrollTo(0, document.body.scrollHeight);
    };

    return (
        <div className="flex flex-col space-y-10 p-4 py-50 max-w-2xl min-w-xl mx-auto">

            <div className="flex flex-col items-center space-y-4 p-4">
                <div className="text-center text-gray-700 text-xl">
                    {shownMessages}
                </div>
            </div>

            <div className="flex flex-col space-y-2 mt-30">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`
            p-2 rounded
            ${msg.role === "user" ? "bg-purple-800 self-end text-right" : "bg-gray-900 text-left"}
        `}>
                        {msg.role === "user" ? "You: " : "Empath AI: "}
                        {msg.text}
                    </div>
                ))}
            </div>
            <div className="flex space-x-2">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 border p-2 rounded bg-slate-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-300 resize-y"
                    placeholder="Say something..."
                    rows={3}
                />
                <button onClick={sendMessage} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                    Send
                </button>
            </div>
        </div>
    );
};

export default Conversation;
