"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function FeatureShowcase() {
  const features = [
    {
      title: "Dashboard, IK It's Boring",
      desc: "Everything you need to manage your projects and share them with the world.",
      img: "/images/features/dashboard.png",
    },
    {
      title: "AI Companion, She ain't Boring",
      desc: "Your personal AI Companion who will accompany you on your journey.",
      img: "/images/features/ai-companion.png",
    },
    {
      title: "Notes, They are Boring",
      desc: "Your personal notes to help you remember everything.",
      img: "/images/features/notes.png",
    },
    {
      title: "Cards, Seems Boring? Nahh",
      desc: "Your personal cards to share it with the world.",
      img: "/images/features/card.png",
    },
    {
      title: "Card Features, Ain't Boring at all",
      desc: "Your personal card features packed with AI to help you customize your experience.",
      img: "/images/features/card-features.png",
    },
  ];

  return (
    <section className="w-full py-24 bg-black">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-20 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
        Why Choose The Boring Project? 
      </h2>

      <div className="flex flex-col gap-20 px-6 md:px-16 lg:px-32">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            className={`flex flex-col md:flex-row items-center gap-10 ${
              i % 2 === 1 ? "md:flex-row-reverse" : ""
            }`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <div className="relative w-full md:w-1/2 h-64 md:h-96 overflow-hidden shadow-2xl bg-black">
              <Image
                src={feature.img}
                alt={feature.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
              />
            </div>

            <div className="md:w-1/2 space-y-4">
              <h3 className="text-2xl font-semibold text-white">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
