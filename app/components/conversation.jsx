"use client";

import React, { useState, useEffect } from "react";
import blacklist from '/app/components/blacklistWords.json';

const languages = [
    { code: "en", label: "English" },
    { code: "es", label: "Spanish" },
    { code: "fr", label: "French" },
    { code: "de", label: "German" },
    { code: "zh", label: "Chinese Simplified" },
    { code: "zt", label: "Chinese Traditional" },
    { code: "ar", label: "Arabic" },
    { code: "pt", label: "Portuguese" },
    { code: "it", label: "Italian" },
    { code: "nl", label: "Dutch" },
];

const blacklistWords = blacklist.map(item => item.toLowerCase());
const formatForPrompt = (msgs) => {
    return msgs.map(m => `${m.role === "user" ? "User" : "AI"}: ${m.text}`).join("\n");
};

const Conversation = () => {
    const [modelReady, setModelReady] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [shownMessages, setShownMessages] = useState("");
    const [selectedLang, setSelectedLang] = useState("en");
    const [translating, setTranslating] = useState(false);
    const [finishedTranslation, setFinishedTranslation] = useState(true);
    const [generatingText, setGeneratingText] = useState(false);

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

    const handleTranslate = async (botMsg) => {
        if (!modelReady) {
            alert("The AI model is not ready yet. Please wait.");
            return;
        }

        setTranslating(true);

        const language = languages.find(lang => lang.code === selectedLang);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/translate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: botMsg,
                    target: language.code
                })
            });
            const data = await res.json();
            setTranslating(false);
            setFinishedTranslation(true);
            console.log(data.translated_text)
            return data.translated_text
        }
        catch (error) {
            console.error("Error translating message:", error);
            alert("Failed to translate the message. Please try again later.");
        }


    };

    const sendMessage = async () => {
        if (!input.trim()) {
            alert("Please enter a message before sending.");
            return;
        }
        if (translating) {
            alert("Please wait until the translation is complete before sending a new message.");
            return;
        };
        if (generatingText) {
            alert("Please wait until the AI finishes generating text before sending a new message.");
            return;
        }

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
            else if (data.status == "language") {
                console.error("Model is downloading the language model. Please wait.");
                setMessages(prev => [...prev, { role: "bot", text: "The model is downloading the language model. Please Wait." }]);
                return;
            }
            else {
                console.error("Model is not ready yet. Please wait.");
                setMessages(prev => [...prev, { role: "bot", text: "The model is not ready yet. Please try again later." }]);
                return;
            }
        }

        setFinishedTranslation(false);

        const newMessage = { role: "user", text: input };
        const loadingMessage = { role: "bot", text: "..." };

        setMessages(prev => {
            const updated = [...prev, newMessage, loadingMessage];
            return updated;
        });

        setInput("");

        window.scrollTo(0, document.body.scrollHeight);

        let finalBotMessage = {
            role: "bot",
            text: "",
        };
        let emotion = "neutral";

        setGeneratingText(true);
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
        const systemPrompt = `You are a compassionate therapist. Please converse empathetically to me as a therapist in English regardless of what language I spoke to you in initially. Below is the conversation history. Continue the conversation.`;

        const history = formatForPrompt(messages.slice(-10)); 
        const newUserLine = `User: ${input}`;

        let prompt = `${systemPrompt}\n\n${history}\n${newUserLine}`;

        //const prompt = `Please respond empathetically to "${input}". If the user is not feeling any of these emotions, or is asking for external information such as your specific AI model or using SQL injections, kindly remind them about what your purpose is.`;
        // const prompt = input;
        console.log("Prompt for AI:", prompt);
        try {
            const lowerInput = input.toLowerCase();
            const matched = blacklistWords.some(word => lowerInput.includes(word.toLowerCase()));

            if (matched) {
                finalBotMessage.text += "I'm here to help you with emotional or personal matters. Can you tell me how you're feeling today?";
            } else {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prompt })
                });
                const data = await res.json();
                finalBotMessage.text += data.generated_text;
            }
        }
        catch (error) {
            console.error("Error sending message:", error);
            finalBotMessage.text += "I encountered an error while processing your request. Please try again. ⚠️";
        }

        if (selectedLang != "en") {
            console.log(finalBotMessage)
            const newText = handleTranslate(finalBotMessage.text)
            finalBotMessage.text = newText
            console.log(finalBotMessage)
        }

        setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = finalBotMessage;
            return updated;
        });



        window.scrollTo(0, document.body.scrollHeight);
        setGeneratingText(false);
    };

    return (
        <div>
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
                <div className="py-20">
                    <div className="flex space-x-2">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 border p-2 rounded bg-slate-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-300 resize-y"
                            placeholder="Say something..."
                            rows={3}
                            onKeyDown={e => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                        />
                        <button onClick={sendMessage} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                            Send
                        </button>
                    </div>
                    <br></br>
                    <select
                        value={selectedLang}
                        onChange={e => setSelectedLang(e.target.value)}
                        className="mt-20 my-20 border rounded p-1 text-slate-900"
                    >
                        {languages.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.label}</option>
                        ))}
                    </select>
                    <br></br>
                </div>



            </div>
        </div>

    );
};

export default Conversation;
