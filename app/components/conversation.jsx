"use client";

import React, { useState } from "react";

const Conversation = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const sendMessage = async () => {
        if (!input.trim()) return;

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
        }*/

        const prompt = "The user is feeling " + emotion + ". Please respond empathetically and provide helpful advice to the following message: " + input;
        console.log("Prompt for AI:", prompt);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/respond`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: prompt })
            });
            const data = await res.json();
            finalBotMessage.text += data.response;
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
            <div className="flex flex-col space-y-2">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`
            p-2 rounded
            ${msg.role === "user" ? "bg-purple-800 self-end" : "bg-gray-900 self-start"}
        `}>
                        {msg.role === "user" ? "You: " : "Empath AI: "}
                        {msg.text}
                    </div>
                ))}
            </div>
            <div className="flex space-x-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 border p-2 rounded bg-slate-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-300"
                    placeholder="Say something..."
                />
                <button onClick={sendMessage} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                    Send
                </button>
            </div>
        </div>
    );
};

export default Conversation;
