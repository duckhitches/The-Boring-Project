/**
 * Copyright (c) 2025 Eshan Vijay Shettennavar
 * 
 * This file is licensed under the Business Source License 1.1.
 * See LICENSE-PROPRIETARY.md for full license terms.
 * 
 * Commercial use of this codebase as a SaaS product without explicit permission is prohibited.
 */

"use client";

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import type { Project } from '../types';
import { CloseIcon, DownloadIcon, ShareIcon } from './IconComponents';
import { LoaderOne } from './ui/loader';

interface SocialCardModalProps {
  project: Project | null;
  onClose: () => void;
}

export const SocialCardModal: React.FC<SocialCardModalProps> = ({ project, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [theme, setTheme] = useState<'terminal' | 'minimal' | 'playful' | 'enterprise'>('terminal');

  if (!project) return null;

  const themes = {
    terminal: {
      bg: "bg-[#000000]",
      text: "text-white",
      fontHead: "font-boldonse",
      fontBody: "font-mono",
      accent: "text-indigo-500",
      border: "border-white/10",
      gridColor: "rgba(79, 70, 229, 0.2)",
      tagBg: "bg-white/5",
      tagBorder: "border-white/10",
      tagText: "text-indigo-300",
    },
    minimal: {
      bg: "bg-white",
      text: "text-neutral-900",
      fontHead: "font-sans",
      fontBody: "font-sans",
      accent: "text-neutral-900",
      border: "border-neutral-200",
      gridColor: "rgba(0, 0, 0, 0.05)",
      tagBg: "bg-neutral-100",
      tagBorder: "border-neutral-200",
      tagText: "text-neutral-600",
    },
    playful: {
      bg: "bg-[#FFFAF0]",
      text: "text-slate-800",
      fontHead: "font-serif",
      fontBody: "font-sans",
      accent: "text-pink-500",
      border: "border-pink-200",
      gridColor: "rgba(236, 72, 153, 0.1)",
      tagBg: "bg-pink-50",
      tagBorder: "border-pink-200",
      tagText: "text-pink-600",
    },
    enterprise: {
      bg: "bg-slate-900",
      text: "text-slate-100",
      fontHead: "font-sans",
      fontBody: "font-sans",
      accent: "text-blue-400",
      border: "border-slate-700",
      gridColor: "rgba(59, 130, 246, 0.1)",
      tagBg: "bg-slate-800",
      tagBorder: "border-slate-700",
      tagText: "text-blue-300",
      gradient: "from-slate-900 via-slate-800 to-slate-900"
    }
  };

  const currentTheme = themes[theme];

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        style: {
            transform: 'scale(1)',
        }
      });
      
      const link = document.createElement('a');
      link.download = `${project.projectName.replace(/\s+/g, '-').toLowerCase()}-social-card-${theme}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 pt-20 overflow-y-auto">
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#050505] border border-white/10 w-full max-w-6xl flex flex-col shadow-2xl relative mt-8"
        >
            <div className="flex flex-col md:flex-row justify-between items-center p-4 md:p-6 border-b border-white/10 bg-[#0d0d0d] gap-4">
                <div className="flex items-center justify-between w-full md:w-auto">
                    <h2 className="text-lg md:text-xl font-bold font-boldonse text-white tracking-tight flex items-center gap-2 md:gap-3">
                        <ShareIcon className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" />
                        <span className="hidden sm:inline">SHARE PROJECT SNAPSHOT</span>
                        <span className="sm:hidden">SHARE PROJECT</span>
                    </h2>
                     <button onClick={onClose} className="md:hidden p-2 hover:bg-white/5 transition-colors group rounded-lg">
                        <CloseIcon className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                    </button>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-end">
                    <div className="flex gap-1 md:gap-2 bg-[#050505] p-1 rounded-lg border border-white/10 overflow-x-auto max-w-full">
                        {(Object.keys(themes) as Array<keyof typeof themes>).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTheme(t)}
                                className={`px-2 md:px-3 py-1 text-[10px] md:text-xs uppercase font-mono rounded transition-colors whitespace-nowrap ${theme === t ? 'bg-indigo-500 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <button onClick={onClose} className="hidden md:block p-2 hover:bg-white/5 transition-colors group">
                    <CloseIcon className="w-6 h-6 text-white/40 group-hover:text-white transition-colors" />
                </button>
            </div>

            <div className="p-4 md:p-8 flex flex-col items-center gap-4 md:gap-8 bg-[#050505] overflow-hidden">
                
                <div className="relative overflow-hidden bg-[#050505] w-[1200px] h-[630px] flex-shrink-0 shadow-2xl scale-[0.22] xs:scale-[0.28] sm:scale-[0.4] md:scale-[0.5] lg:scale-[0.7] origin-top transform-gpu border border-white/10">
                    <div ref={cardRef} className={`w-[1200px] h-[630px] ${currentTheme.bg} relative overflow-hidden flex flex-col ${currentTheme.fontBody} ${currentTheme.text}`}>
                        
                        {/* Background Texture */}
                        <div className="absolute inset-0 z-0 opacity-30">
                             <div className="absolute inset-0 bg-[radial-gradient(currentColor_1px,transparent_1px)] bg-[size:20px_20px]" style={{ color: currentTheme.gridColor }}></div>
                             {theme === 'terminal' && (
                                <>
                                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
                                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
                                </>
                             )}
                        </div>

                        {/* Top Bar / System Status */}
                        <div className={`relative z-10 w-full h-12 border-b ${currentTheme.border} ${theme === 'playful' ? 'bg-white/50' : 'bg-black/5'} flex items-center justify-between px-8 text-xs uppercase tracking-widest opacity-50`}>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${theme === 'playful' ? 'bg-pink-500' : 'bg-green-500'} animate-pulse`}></div>
                                    <span>{theme === 'playful' ? 'Idea Ready' : 'System Online'}</span>
                                </div>
                                <span>|</span>
                                <span>Build: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span>Memory: OK</span>
                                <span>Latency: 12ms</span>
                            </div>
                        </div>

                         {/* Main Content Grid */}
                        <div className="relative z-10 flex-grow grid grid-cols-12 gap-0">
                            
                            {/* Left Panel: Project Data */}
                            <div className={`col-span-7 border-r ${currentTheme.border} p-12 flex flex-col justify-between backdrop-blur-sm`}>
                                <div>
                                    <div className={`mb-2 ${currentTheme.accent} text-xs font-bold uppercase tracking-[0.2em]`}>Project Manifest</div>
                                    <h1 className={`text-5xl md:text-6xl ${currentTheme.fontHead} font-bold tracking-tight leading-none mb-6 line-clamp-2 pr-4`}>
                                        {project.projectName.toUpperCase()}
                                    </h1>
                                    
                                    <div className="mb-8">
                                        <div className="text-[10px] opacity-40 uppercase tracking-widest mb-2 border-b pb-1 w-24" style={{ borderColor: currentTheme.gridColor }}>Description</div>
                                        <p className="text-xl opacity-80 leading-relaxed max-w-2xl">
                                            {project.description.split('\n')[0].replace(/\*\*/g, '')}
                                            {theme === 'terminal' && <span className="inline-block w-2.5 h-5 bg-indigo-500 ml-1 animate-pulse align-middle"></span>}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[10px] opacity-40 uppercase tracking-widest mb-3 border-b pb-1 w-24" style={{ borderColor: currentTheme.gridColor }}>Tech Stack</div>
                                    <div className="flex flex-wrap gap-2">
                                        {project.tags?.slice(0, 8).map(tag => (
                                            <span key={tag} className={`px-3 py-1.5 ${currentTheme.tagBg} border ${currentTheme.tagBorder} ${currentTheme.tagText} font-mono text-xs uppercase tracking-wider flex items-center gap-2 ${theme === 'playful' ? 'rounded-full' : ''}`}>
                                                <span className={`w-1 h-1 rounded-full ${theme === 'playful' ? 'bg-pink-500' : 'bg-current'}`}></span>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel: Code/Stats/Preview */}
                            <div className="col-span-5 flex flex-col">
                                {/* Project Image Preview */}
                                <div className={`flex-grow border-b ${currentTheme.border} relative overflow-hidden group bg-black/5`}>
                                     <div className={`absolute top-0 right-0 z-20 p-2 text-[10px] opacity-50 uppercase backdrop-blur-md border-b border-l ${currentTheme.border}`}>PREVIEW_RENDER.PNG</div>
                                     
                                     {project.backgroundImage ? (
                                         <div className="absolute inset-0">
                                            <img 
                                                src={project.backgroundImage} 
                                                alt="Project Preview" 
                                                className={`w-full h-full object-cover transition-all duration-700 ${theme === 'terminal' ? 'opacity-80 mix-blend-normal grayscale-[20%] contrast-110 group-hover:grayscale-0' : ''} ${theme === 'minimal' ? 'grayscale group-hover:grayscale-0' : ''}`}
                                            />
                                            {theme === 'terminal' && (
                                                <>
                                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_2px,3px_100%] opacity-20"></div>
                                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-40"></div>
                                                </>
                                            )}
                                         </div>
                                     ) : (
                                         <div className="w-full h-full flex flex-col items-center justify-center gap-2 opacity-30">
                                            <div className="w-16 h-16 border border-dashed border-current flex items-center justify-center">
                                                <span className="text-2xl">?</span>
                                            </div>
                                            <span className="text-[10px] uppercase tracking-widest">NO_IMAGE_DATA</span>
                                         </div>
                                     )}
                                </div>

                                {/* Stats Grid */}
                                <div className="h-1/3 grid grid-cols-2">
                                    <div className={`border-r ${currentTheme.border} ${theme === 'terminal' ? 'border-t border-white/10' : ''} p-6 flex flex-col justify-center`}>
                                        <span className="text-[10px] opacity-40 uppercase tracking-widest mb-1">Performance</span>
                                        <span className={`text-4xl ${currentTheme.fontHead} font-bold`}>98<span className="text-lg text-green-500">%</span></span>
                                    </div>
                                    <div className={`${theme === 'terminal' ? 'border-t border-white/10' : ''} p-6 flex flex-col justify-center`}>
                                       <span className="text-[10px] opacity-40 uppercase tracking-widest mb-1">Accessibility</span>
                                       <span className={`text-4xl ${currentTheme.fontHead} font-bold`}>100<span className="text-lg text-green-500">%</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                         {/* Footer */}
                        <div className={`w-full h-16 border-t ${currentTheme.border} ${theme === 'terminal' ? 'bg-[#0a0a0a]' : 'bg-transparent'} flex items-center justify-between px-8 text-xs uppercase tracking-widest opacity-40`}>
                             <div className="flex items-center gap-2">
                                <span className={currentTheme.accent}>➜</span>
                                <span>{project.liveLink ? new URL(project.liveLink).hostname : 'the-boring-project.vercel.app'}</span>
                             </div>
                             <div>
                                 GENERATED BY THE BORING PROJECT
                             </div>
                        </div>

                    </div>
                </div>

                 {/* Controls */}
                <div className="w-full flex justify-between items-center max-w-4xl mt-[-480px] xs:mt-[-440px] sm:mt-[-360px] md:mt-[-300px] lg:mt-[-180px] relative z-20 px-4">
                     <p className="text-white/40 font-mono text-xs uppercase hidden md:block">
                        * Preview scaled to fit screen. Downloaded image will be 1200x630px.
                     </p>
                    <button 
                        onClick={handleDownload} 
                        disabled={isGenerating}
                        className="flex items-center gap-3 px-8 py-4 bg-white text-black font-mono font-bold uppercase tracking-widest hover:bg-white/90 transition-colors disabled:opacity-50 ml-auto shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                    >
                        {isGenerating ? <LoaderOne /> : <DownloadIcon className="w-5 h-5" />}
                        {isGenerating ? 'GENERATING...' : 'DOWNLOAD PNG'}
                    </button>
                </div>
            </div>
        </motion.div>
    </div>
  );
};
