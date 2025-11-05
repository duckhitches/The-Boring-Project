"use client";

import Image from "next/image";
import Link from "next/link";

export default function ProjectPreviewGrid() {
  const projects = [
    {
      title: "AI Interview Bot",
      desc: "Your personal AI interviewer using ElevenLabs and OpenAI API.",
      img: "/images/projects/ai-interview.png",
      link: "https://project-ea.vercel.app/",
    },
    {
      title: "Children's Rights Awareness Website",
      desc: "A website for children's rights awareness using NextJS, Supabase and Marketjs. It's a responsive and interactive child friendly UI and contains informative content including Videos, Quizzes, and Games.",
      img: "/images/projects/childrens-rights.png",
      link: "https://childrensrights-eshanvs-nu.vercel.app/",
    },
    {
      title: "Personal Portfolio",
      desc: "My personal portfolio website built with NextJS, TailwindCSS and Framer Motion.",
      img: "/images/projects/personal-portfolio.png",
      link: "https://portfolio-eshan-2z6t.vercel.app/",
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
            className="group block bg-white/10 backdrop-blur-sm shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
          >
            <div className="relative w-full h-56 md:h-64 bg-black">
              <Image
                src={proj.img}
                alt={proj.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain group-hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-lg mb-2">{proj.title}</h3>
              <p className="text-white/80 text-sm">{proj.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
