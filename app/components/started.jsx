import React from "react";

const Started = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-100 bg-white px-6 py-12 text-center">
            <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">How do I get started?</h2>
            <p className="text-lg text-gray-700 max-w-2xl mb-8">
                To start using Empath AI, simply click the button below to begin a conversation. 
                The AI will listen to your messages and respond with empathy and understanding.
                No setup required, just type your message and let the AI assist you.
            </p>
            <a
                className="bg-purple-600 text-white px-6 py-3 rounded-2xl text-lg hover:bg-purple-700 hover:scale-110 transition-transform duration-1000 ease-in-out shadow-lg"
                href="/conversation"
            >
                Chat with Empath AI
            </a>
        </div>
    );
}


export default Started;