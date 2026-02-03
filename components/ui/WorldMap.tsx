"use client";
import WorldMap from "@/components/ui/world-map";
import { motion } from "motion/react";

export function WorldMapDemo() {
  return (
    <div className="w-full flex flex-col items-center justify-center bg-black relative">
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-[length:30px_30px] opacity-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto text-center flex flex-col items-center justify-center relative z-10 mb-8">
        {/* Subtitle */}
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 mb-4">
          Network Connectivity
        </p>
        
        {/* Main Title */}
        <h3 className="font-boldonse text-3xl md:text-5xl uppercase text-white tracking-widest mb-4">
          Remote{" "}
          <span className="text-white/40">
            {"Shareability".split("").map((letter, idx) => (
              <motion.span
                key={idx}
                className="inline-block"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.03 }}
              >
                {letter}
              </motion.span>
            ))}
          </span>
        </h3>
        
        {/* Description */}
        <p className="font-mono text-xs md:text-sm text-white/40 max-w-xl mx-auto uppercase tracking-wider leading-relaxed">
          Break free from dull portfolios. Create, customize, and share your
          projects from anywhere — straight from your digital workspace.
        </p>
        
        {/* Decorative line */}
        <div className="w-16 h-px bg-white/20 mt-8" />
      </div>
      
      {/* Map Container */}
      <div className="relative w-full border-t border-b border-white/10">
        {/* Corner accents */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l border-t border-white/20 z-10" />
        <div className="absolute top-4 right-4 w-8 h-8 border-r border-t border-white/20 z-10" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l border-b border-white/20 z-10" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r border-b border-white/20 z-10" />
        
        <WorldMap
          dots={[
            {
              start: {
                lat: 64.2008,
                lng: -149.4937,
              }, // Alaska (Fairbanks)
              end: {
                lat: 34.0522,
                lng: -118.2437,
              }, // Los Angeles
            },
            {
              start: { lat: 64.2008, lng: -149.4937 }, // Alaska (Fairbanks)
              end: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
            },
            {
              start: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
              end: { lat: 38.7223, lng: -9.1393 }, // Lisbon
            },
            {
              start: { lat: 51.5074, lng: -0.1278 }, // London
              end: { lat: 28.6139, lng: 77.209 }, // New Delhi
            },
            {
              start: { lat: 28.6139, lng: 77.209 }, // New Delhi
              end: { lat: 43.1332, lng: 131.9113 }, // Vladivostok
            },
            {
              start: { lat: 28.6139, lng: 77.209 }, // New Delhi
              end: { lat: -1.2921, lng: 36.8219 }, // Nairobi
            },
          ]}
        />
      </div>
      
      {/* Status indicator */}
      <div className="flex items-center gap-3 mt-8">
        <div className="w-2 h-2 bg-green-500 animate-pulse" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">
          All nodes operational
        </span>
      </div>
    </div>
  );
}
