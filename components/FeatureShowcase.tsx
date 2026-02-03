"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function FeatureShowcase() {
  const features = [
    {
      title: "Dashboard",
      subtitle: "Your Command Center",
      desc: "Everything you need to manage your projects and share them with the world. Track progress, organize work, and stay productive.",
      img: "/images/features/dashboard-new.png",
    },
    {
      title: "AI Companion",
      subtitle: "Echo Interface",
      desc: "Your personal AI companion who will accompany you on your coding journey. Voice-activated, always ready to help.",
      img: "/images/features/ai-companion-new.png",
    },
    {
      title: "Notes System",
      subtitle: "Capture Everything",
      desc: "Your personal notes to help you remember everything. Auto-save, organize, and never lose an idea.",
      img: "/images/features/notes-new.png",
    },
    {
      title: "Project Cards",
      subtitle: "Showcase Your Work",
      desc: "Beautiful project cards to share with the world. Professional, customizable, ready to impress.",
      img: "/images/features/card-new.png",
    },
    {
      title: "Card Features",
      subtitle: "AI-Powered Customization",
      desc: "Advanced card features packed with AI to help you customize and enhance your project presentations.",
      img: "/images/features/card-features-new.png",
    },
  ];

  return (
    <section id="features" className="w-full py-24 bg-black border-t border-white/10">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/40 mb-4">
            Why Choose Us
          </p>
          <h2 className="text-4xl md:text-6xl font-boldonse uppercase text-white tracking-widest mb-4">
            Features
          </h2>
          <div className="w-16 h-px bg-white/20 mx-auto" />
        </motion.div>
      </div>

      {/* Feature List */}
      <div className="flex flex-col gap-0 border-t border-white/10">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            className={`flex flex-col ${i % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"} border-b border-white/10`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            {/* Image */}
            <div className="relative w-full md:w-1/2 h-64 md:h-[450px] bg-[#0a0a0a] border-b md:border-b-0 border-white/5 overflow-hidden group">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-[length:30px_30px] opacity-10" />
              <Image
                src={feature.img}
                alt={feature.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-8 md:p-12 transition-transform duration-700 group-hover:scale-105"
              />
              {/* Corner accent */}
              <div className="absolute top-0 left-0 w-8 h-8 border-l border-t border-white/20" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-r border-b border-white/20" />
            </div>

            {/* Content */}
            <div className={`md:w-1/2 p-8 md:p-16 flex flex-col justify-center ${i % 2 === 1 ? "md:border-r" : "md:border-l"} border-white/5`}>
              {/* Index Number */}
              <span className="font-mono text-6xl md:text-8xl font-bold text-white/5 mb-4 leading-none">
                {String(i + 1).padStart(2, '0')}
              </span>
              
              {/* Subtitle */}
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 mb-2">
                {feature.subtitle}
              </p>
              
              {/* Title */}
              <h3 className="text-2xl md:text-3xl font-boldonse uppercase text-white tracking-widest mb-4">
                {feature.title}
              </h3>
              
              {/* Description */}
              <p className="font-mono text-sm text-white/50 leading-relaxed max-w-md">
                {feature.desc}
              </p>
              
              {/* Decorative line */}
              <div className="w-12 h-px bg-white/20 mt-8" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
