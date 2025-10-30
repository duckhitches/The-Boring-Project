"use client";

import Image from "next/image";
import Link from "next/link";

export default function ProjectPreviewGrid() {
  const projects = [
    {
      title: "Next.js Portfolio",
      desc: "A sleek portfolio site built with animations and SSR magic.",
      img: "/bg-2.png",
      link: "#",
    },
    {
      title: "AI Interview Bot",
      desc: "Your personal AI interviewer using ElevenLabs and OpenAI.",
      img: "/bg-2.png",
      link: "#",
    },
    {
      title: "MangoMart",
      desc: "E-commerce platform for farm-fresh mangoes 🍋",
      img: "/bg-2.png",
      link: "#",
    },
  ];

  return (
    <section className="py-20 bg-black">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        Featured Projects By The Dev
      </h2>

      <div className="grid gap-10 px-6 md:px-12 lg:px-24 md:grid-cols-2 lg:grid-cols-2">
        {projects.map((proj, i) => (
          <Link
            key={i}
            href={proj.link}
            className="group block bg-white shadow-lg rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300"
          >
            <div className="relative w-full h-52">
              <Image
                src={proj.img}
                alt={proj.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-lg mb-2">{proj.title}</h3>
              <p className="text-gray-600 text-sm">{proj.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
