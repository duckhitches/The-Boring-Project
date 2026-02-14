/**
 * Copyright (c) 2025 Eshan Vijay Shettennavar
 * 
 * This file is licensed under the MIT License.
 * See LICENSE for full license terms.
 */

"use client";

import React, { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import type { Project } from '../types';
import { GithubIcon, ExternalLinkIcon, MailIcon, TrashIcon, PencilIcon, ShareIcon, DownloadIcon, CheckIcon } from './IconComponents';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectCardProps {
  project: Project;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onShare?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = React.memo(({ project, onEdit, onDelete, onShare }) => {
  const [shareText, setShareText] = useState('Share');
  const [isHovered, setIsHovered] = useState(false);

  const handleShareClick = useCallback(async () => {
    const shareUrl = `${window.location.origin}/projects/${project.id}`;
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      setShareText('Failed!');
      setTimeout(() => setShareText('Share'), 2000);
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareText('Copied!');
      setTimeout(() => setShareText('Share'), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setShareText('Failed!');
      setTimeout(() => setShareText('Share'), 2000);
    }
  }, [project.id]);

  const codeElement = useMemo(() => {
    if (!project.codeSnippet || !project.codeLanguage) {
      return null;
    }
    const lang = project.codeLanguage;
    const grammar = Prism.languages[lang];
    const className = `language-${project.codeLanguage}`;

    if (grammar) {
        const html = Prism.highlight(project.codeSnippet, grammar, lang);
        return (
            <code
                className={className}
                dangerouslySetInnerHTML={{ __html: html }}
            />
        );
    }
    return <code className={className}>{project.codeSnippet}</code>;
  }, [project.codeSnippet, project.codeLanguage]);


  return (
    <motion.div 
      className="bg-black border border-white/10 overflow-hidden flex flex-col group relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, borderColor: "rgba(99, 102, 241, 0.5)" }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
        {/* "Useless" aesthetic glowing border effect */}
        <AnimatePresence>
            {isHovered && (
                <motion.div 
                    layoutId="card-glow"
                    className="absolute inset-0 pointer-events-none z-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.15) 0%, transparent 70%)'
                    }}
                />
            )}
        </AnimatePresence>

      <div className="relative h-56 w-full z-10 border-b border-white/10 group-hover:border-indigo-500/30 transition-colors">
        {project.backgroundImage ? (
           <Image 
             src={project.backgroundImage} 
             alt={`${project.projectName}`} 
             className="object-cover transition-transform duration-700 group-hover:scale-105" 
             fill 
             sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
           />
        ) : (
            <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                 <span className="font-boldonse text-4xl text-white/5 opacity-50 group-hover:opacity-100 transition-opacity select-none">{project.projectName.substring(0,2).toUpperCase()}</span>
            </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300"></div>
        
        <div className="absolute bottom-4 left-4 right-4 z-20">
          <motion.h2 
            className="text-3xl font-bold font-boldonse text-white leading-tight tracking-tight mb-1"
            layout
          >
              {project.projectName}
          </motion.h2>
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
                 <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest">{project.timeline}</span>
                 {project.userInfo && (
                    <span className="text-[10px] font-mono text-white/40 mt-1 uppercase tracking-wider">
                    DEV: {project.userInfo.firstName ? `${project.userInfo.firstName} ${project.userInfo.lastName}` : 'ANON'}
                    </span>
                 )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6 flex-grow flex flex-col z-10 bg-black">
         {project.tags && project.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {project.tags.slice(0, 4).map(tag => (
              <span key={tag} className="border border-white/10 bg-white/5 text-white/70 text-[10px] font-mono px-2 py-1 uppercase tracking-wider">
                {tag}
              </span>
            ))}
            {project.tags.length > 4 && (
                <span className="text-[10px] font-mono text-white/30 self-center">+{project.tags.length - 4}</span>
            )}
          </div>
        )}
        
        <p className="text-white/60 text-sm font-mono mb-6 flex-grow leading-relaxed line-clamp-3">
          {project.description}
        </p>
        
        {project.codeSnippet && (
           <div className="mb-6 relative group/code">
            <div className="absolute -top-3 right-0 bg-indigo-600 text-[10px] font-mono text-white px-2 py-0.5 uppercase tracking-widest opacity-0 group-hover/code:opacity-100 transition-opacity">
                {project.codeLanguage}
            </div>
            <div className="bg-[#0d0d0d] border border-white/10 p-4 font-mono text-xs text-indigo-200/80 overflow-hidden relative">
                 {/* "Scanline" effect */}
                 <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_2px,3px_100%] opacity-20"></div>
                <pre className={`!m-0 !p-0 !bg-transparent line-clamp-4 leading-relaxed`}>
                    {codeElement}
                </pre>
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0d0d0d] to-transparent"></div>
            </div>
          </div>
        )}

      </div>
       <div className="px-6 pb-6 mt-auto flex justify-between items-center z-10 bg-black pt-4 border-t border-white/5">
          <div className="flex items-center gap-4">
             {project.githubLink && (
              <motion.a whileHover={{ scale: 1.1, color: "#fff" }} whileTap={{ scale: 0.9 }} href={project.githubLink} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
                <GithubIcon className="w-5 h-5" />
              </motion.a>
            )}
            {project.liveLink && (
              <motion.a whileHover={{ scale: 1.1, color: "#fff" }} whileTap={{ scale: 0.9 }} href={project.liveLink} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
                <ExternalLinkIcon className="w-5 h-5" />
              </motion.a>
            )}
            <motion.a whileHover={{ scale: 1.1, color: "#fff" }} whileTap={{ scale: 0.9 }} href={`mailto:${project.contactEmail}`} className="text-white/40 hover:text-white transition-colors">
              <MailIcon className="w-5 h-5" />
            </motion.a>
            {onEdit && (
                <motion.button whileHover={{ scale: 1.1, color: "#fbbf24" }} whileTap={{ scale: 0.9 }} onClick={() => onEdit(project.id)} className="text-white/40 hover:text-yellow-400 transition-colors">
                    <PencilIcon className="w-5 h-5"/>
                </motion.button>
            )}
            {onDelete && (
                <motion.button whileHover={{ scale: 1.1, color: "#f87171" }} whileTap={{ scale: 0.9 }} onClick={() => onDelete(project.id)} className="text-white/40 hover:text-red-400 transition-colors">
                    <TrashIcon className="w-5 h-5"/>
                </motion.button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <motion.button 
                whileHover={{ scale: shareText === 'Copied!' ? 1 : 1.05 }}
                whileTap={{ scale: shareText === 'Copied!' ? 1 : 0.95 }}
                onClick={handleShareClick}
                disabled={shareText === 'Copied!'}
                className={`flex items-center gap-2 px-3 py-2 text-[10px] font-mono uppercase tracking-widest bg-transparent text-white/40 border border-white/10 hover:border-white hover:text-white transition-all disabled:bg-green-500 disabled:border-green-500 disabled:text-black disabled:cursor-not-allowed`}
            >
                {shareText === 'Copied!' && <CheckIcon className="w-3.5 h-3.5 shrink-0" />}
                {shareText}
            </motion.button>
            {onShare && (
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onShare}
                    className="p-2 border border-white/10 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                    title="Generate Social Card"
                >
                    <DownloadIcon className="w-4 h-4" />
                </motion.button>
            )}
          </div>
        </div>
    </motion.div>
  );
});