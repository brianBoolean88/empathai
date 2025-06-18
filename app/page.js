import Image from "next/image";
import Features from "/app/components/features.jsx";
import Footer from "/app/components/footer.jsx";
import Conversation from "/app/components/conversation.jsx";

export default function Home() {
  return (
    <div className="">
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-100 via-blue-100 to-white px-6 py-12 text-center">
        <Image src="/logo.jpg" alt="Empath AI Logo" width={96} height={96} className="mb-6 rounded-xl" />
        <h1 className="text-5xl font-bold text-gray-800 mb-4">Empath AI</h1>
        <p className="text-xl text-gray-700 max-w-xl mb-8">
          Empath AI delivers compassionate and understanding conversations powered by a finely tuned AI model. Built to listen, understand, and respond with empathy.
        </p>
        <a
          className="bg-purple-600 text-white px-6 py-3 rounded-2xl text-lg hover:bg-purple-700 hover:scale-110 transition-transform duration-1000 ease-in-out shadow-lg"
          href="#conversation"
        >
          Get Started
        </a>
      </div>
      <Features />

      <section id="conversation" className="bg-gradient-to-b from-white via-purple-100 to-blue-100">
        <Conversation />
      </section>
      
      <Footer />
    </div>
  );
}
