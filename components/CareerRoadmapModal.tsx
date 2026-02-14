/**
 * Copyright (c) 2025 Eshan Vijay Shettennavar
 * 
 * This file is licensed under the Business Source License 1.1.
 * See LICENSE-PROPRIETARY.md for full license terms.
 * 
 * Commercial use of this codebase as a SaaS product without explicit permission is prohibited.
 */

"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import type { Project } from '../types';
import { CloseIcon, DownloadIcon } from './IconComponents';
import { LoaderOne } from './ui/loader';
import { generateCareerRoadmap } from '../services/geminiService';

interface CareerRoadmapModalProps {
  projects: Project[];
  onClose: () => void;
}

interface RoadmapData {
  currentLevel: string;
  strengths: string[];
  gaps: string[];
  recommendedProjects: {
    title: string;
    description: string;
    techStack: string[];
    difficulty: string;
    reason: string;
  }[];
  achievementRoadmap: {
    milestone: string;
    status: string;
    description: string;
  }[];
  error?: string;
}

export const CareerRoadmapModal: React.FC<CareerRoadmapModalProps> = ({ projects, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [data, setData] = useState<RoadmapData | null>(null);

  useEffect(() => {
    const fetchRoadmap = async () => {
      if (projects.length === 0) {
        setData({
            currentLevel: "Aspiring Developer",
            strengths: [],
            gaps: ["No projects found"],
            recommendedProjects: [],
            achievementRoadmap: [],
            error: "Add some projects to get a roadmap!"
        });
        setLoading(false);
        return;
      }

      try {
        const roadmapStr = await generateCareerRoadmap(projects);
        try {
          const parsed = JSON.parse(roadmapStr);
          setData(parsed);
        } catch (e) {
          console.error("Failed to parse roadmap JSON", e);
          setData({ 
              currentLevel: "Unknown", 
              strengths: [], 
              gaps: [], 
              recommendedProjects: [], 
              achievementRoadmap: [],
              error: `Failed to parse roadmap JSON: ${e instanceof Error ? e.message : String(e)}`
          });
        }
      } catch (e) {
        console.error("Failed to generate roadmap", e);
        setData({ 
            currentLevel: "Unknown", 
            strengths: [], 
            gaps: [], 
            recommendedProjects: [], 
            achievementRoadmap: [],
            error: `Failed to generate roadmap: ${e instanceof Error ? e.message : String(e)}`
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [projects]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsGeneratingImage(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        style: { transform: 'scale(1)' }
      });
      
      const link = document.createElement('a');
      link.download = `career-roadmap-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
      alert('Failed to generate image.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-3 sm:p-4 pt-16 sm:pt-20 overflow-y-auto">
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#050505] border border-white/10 w-full max-w-6xl flex flex-col shadow-2xl relative max-h-[90vh] sm:max-h-[85vh] overflow-hidden mt-4 sm:mt-8 rounded-lg"
        >
             {/* Header */}
             <div className="flex justify-between items-center p-4 sm:p-5 md:p-6 border-b border-white/10 bg-[#0d0d0d] shrink-0">
                <h2 className="text-base sm:text-lg md:text-xl font-bold font-boldonse text-white tracking-tight flex items-center gap-2 sm:gap-3">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shrink-0" aria-hidden />
                    AI CAREER ROADMAP
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-white/5 transition-colors group rounded" aria-label="Close">
                    <CloseIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white/40 group-hover:text-white transition-colors" />
                </button>
            </div>

            <div className="flex-grow overflow-y-auto bg-[#050505] p-3 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden min-h-0">
                {loading ? (
                    <div className="flex flex-col items-center justify-center min-h-[280px] sm:h-96 gap-4">
                        <LoaderOne />
                        <p className="text-white/50 font-mono text-xs sm:text-sm animate-pulse">ANALYZING PORTFOLIO DATA...</p>
                    </div>
                ) : data?.error ? (
                    <div className="text-center py-10 sm:py-16 px-4">
                        <p className="text-red-400 font-mono text-sm sm:text-base leading-relaxed max-w-xl mx-auto break-words">
                            {data.error}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 sm:gap-6 items-center w-full">
                        
                        {/* Downloadable Area - responsive scale */}
                         <div className="relative overflow-x-auto overflow-y-hidden bg-[#050505] w-[1000px] max-w-[1000px] flex-shrink-0 shadow-2xl scale-[0.26] min-[380px]:scale-[0.32] sm:scale-[0.42] md:scale-[0.52] lg:scale-[0.65] xl:scale-[0.8] origin-top transform-gpu border border-white/10 self-center my-2 sm:my-4">
                            <div ref={cardRef} className="w-[1000px] min-h-[600px] bg-[#000000] relative overflow-hidden flex flex-col font-mono text-white p-6 sm:p-8 lg:p-12">
                                {/* Background Grid */}
                                <div className="absolute inset-0 z-0 opacity-20">
                                     <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] bg-[size:20px_20px] opacity-20"></div>
                                </div>
                                
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-12">
                                        <div>
                                            <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">Current Status</div>
                                            <h1 className="text-5xl font-black font-boldonse text-white">{data?.currentLevel.toUpperCase()}</h1>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Analysis Date</div>
                                            <div className="text-xl font-mono text-white/80">{new Date().toLocaleDateString()}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 mb-8 sm:mb-12">
                                        <div>
                                            <h3 className="text-base sm:text-lg font-bold text-white border-b border-white/10 pb-2 mb-3 sm:mb-4 flex items-center justify-between">
                                                <span>STRENGTHS</span>
                                                <span className="text-green-500 text-xs">DETECTED</span>
                                            </h3>
                                            <ul className="space-y-1.5 sm:space-y-2">
                                                {data?.strengths.map((s, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-white/70 text-sm leading-relaxed">
                                                        <span className="text-green-500 mt-0.5 shrink-0">✔</span>
                                                        <span>{s}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="text-base sm:text-lg font-bold text-white border-b border-white/10 pb-2 mb-3 sm:mb-4 flex items-center justify-between">
                                                <span>AREAS FOR GROWTH</span>
                                                <span className="text-yellow-500 text-xs">OPPORTUNITIES</span>
                                            </h3>
                                            <ul className="space-y-1.5 sm:space-y-2">
                                                {data?.gaps.map((s, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-white/70 text-sm leading-relaxed">
                                                        <span className="text-yellow-500 mt-0.5 shrink-0">⚠</span>
                                                        <span>{s}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2 mb-6">ACHIEVEMENT ROADMAP</h3>
                                    <div className="space-y-6">
                                        {data?.achievementRoadmap.map((item, i) => (
                                            <div key={i} className="flex gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-4 h-4 rounded-full border-2 ${item.status === 'Completed' ? 'bg-green-500 border-green-500' : item.status === 'In Progress' ? 'bg-indigo-500 border-indigo-500' : 'border-white/20 bg-black'}`}></div>
                                                    {i !== data.achievementRoadmap.length - 1 && <div className="w-[1px] h-full bg-white/10 my-1"></div>}
                                                </div>
                                                <div className="pb-4">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-white font-bold">{item.milestone}</span>
                                                        <span className={`text-[10px] uppercase px-2 py-0.5 rounded border ${item.status === 'Completed' ? 'border-green-500/30 text-green-400 bg-green-500/10' : item.status === 'In Progress' ? 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10' : 'border-white/10 text-white/30'}`}>
                                                            {item.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-white/50">{item.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                     <div className="mt-12 pt-8 border-t border-white/10 flex justify-between items-center text-white/30 text-xs uppercase tracking-widest">
                                        <span>AI CAREER ANALYZER</span>
                                        <span>THE BORING PROJECT</span>
                                     </div>
                                </div>
                            </div>
                         </div>
                        
                         {/* Controls - below card, no overlap */}
                        <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 max-w-4xl px-2 sm:px-4 pb-6 sm:pb-8">
                             <p className="text-white/50 font-mono text-[11px] sm:text-xs leading-relaxed text-center sm:text-left max-w-md">
                                Download this roadmap to track your progress. Share on social media to highlight your growth.
                             </p>
                            <button 
                                onClick={handleDownload} 
                                disabled={isGeneratingImage}
                                className="flex items-center gap-2 sm:gap-3 px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-white text-black font-mono font-bold text-xs sm:text-sm uppercase tracking-widest hover:bg-white/90 transition-colors disabled:opacity-50 shadow-[0_0_30px_rgba(255,255,255,0.1)] whitespace-nowrap rounded"
                            >
                                {isGeneratingImage ? <LoaderOne /> : <DownloadIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                                {isGeneratingImage ? 'GENERATING...' : 'DOWNLOAD ROADMAP'}
                            </button>
                        </div>

                    </div>
                )}
            </div>
        </motion.div>
    </div>
  );
};
