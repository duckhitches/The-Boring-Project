"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function ProjectPreviewGrid() {
  const projects = [
    {
      title: "AI Interview Bot",
      desc: "Your personal AI interviewer using Gemini API and NextJS.",
      img: "/images/projects/ai-interview.png",
      link: "https://project-ea.vercel.app/",
    },
    {
      title: "Children's Rights Awareness",
      desc: "A website for children's rights awareness using NextJS, Supabase and Marketjs.",
      img: "/images/projects/childrens-rights.png",
      link: "https://childrensrights-eshanvs-nu.vercel.app/",
    },
    {
      title: "Personal Portfolio",
      desc: "My personal portfolio website built with NextJS, TailwindCSS and Framer Motion.",
      img: "/images/projects/personal-portfolio.jpg",
      link: "https://portfolio-eshan-2z6t.vercel.app/",
    },
  ];

  return (
    <section className="py-24 bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3">
              Portfolio Showcase
            </p>
            <h2 className="text-4xl md:text-5xl font-boldonse uppercase text-white tracking-widest">
              Featured <span className="text-white/40">Work</span>
            </h2>
          </div>
          <div className="w-16 h-px bg-white/20 md:hidden" />
          <p className="font-mono text-xs text-white/40 uppercase tracking-wider max-w-xs">
            Selected projects demonstrating full-stack development capabilities
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-0 md:grid-cols-3 border border-white/10">
          {projects.map((proj, i) => (
            <motion.a
              key={i}
              href={proj.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-[#0a0a0a] border-b md:border-b-0 md:border-r border-white/10 last:border-r-0 last:border-b-0 relative overflow-hidden"
              whileHover={{ backgroundColor: "#111111" }}
            >
              {/* Number Index */}
              <div className="absolute top-4 left-4 z-10">
                <span className="font-mono text-5xl font-bold text-white/5">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>

              {/* Image */}
              <div className="relative w-full h-56 bg-[#050505] border-b border-white/5 overflow-hidden">
                <Image
                  src={proj.img}
                  alt={proj.title}
                  fill
                  className="object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Corner accents */}
                <div className="absolute top-3 left-3 w-4 h-4 border-l border-t border-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-r border-b border-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-boldonse text-lg text-white mb-3 group-hover:text-white/90 transition-colors uppercase tracking-wide">
                  {proj.title}
                </h3>
                <p className="font-mono text-xs text-white/40 leading-relaxed line-clamp-2 mb-6">
                  {proj.desc}
                </p>

                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/20">
                    Project {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/30 group-hover:text-white transition-colors border-b border-transparent group-hover:border-white">
                    View →
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
