"use client";
import Conversation from "/app/components/conversation.jsx";
import { motion } from "framer-motion";
import Image from "next/image";
import Footer from "../components/footer";

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-100 via-blue-100 to-white px-6 py-12 text-center">
        <motion.div
          className="items-center justify-center flex flex-col"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src="/AI Therapist.png"
            alt="Empath AI Logo"
            width={150}
            height={150}
            className="mb-8 rounded-full shadow-lg"
          />
          <h1 className="text-4xl font-bold text-slate-900 mb-6">Empath AI</h1>
          <p className="text-lg text-gray-700 max-w-2xl mb-8">
            Empath AI is a friendly and empathetic AI designed to listen and respond to your messages with understanding and care.
            Start a conversation to experience the empathy of AI.
          </p>
          <Conversation />
          <a
            className="bg-indigo-500 text-white px-6 py-3 rounded-2xl text-lg hover:bg-indigo-300 hover:scale-110 transition-transform duration-1000 ease-in-out shadow-lg"
            href="/"
          >
            Return
          </a>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}
