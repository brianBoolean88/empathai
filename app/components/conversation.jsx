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
            text: "Sorry, I didn't understand that.",
        };
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/respond`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: input })
            });
            if (!res.ok) {
                finalBotMessage.text = "Sorry, I didn't understand that.";
            }
            const data = await res.json();
            finalBotMessage.text = data.response;
        }
        catch (error) {
            console.error("Error sending message:", error);
        }


        setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = finalBotMessage;
            return updated;
        });

        window.scrollTo(0, document.body.scrollHeight);
    };

    return (
        <div className="flex flex-col space-y-4 p-4 py-50 max-w-2xl mx-auto">
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
