/**
 * Copyright (c) 2025 Eshan Vijay Shettennavar
 * 
 * This file is licensed under the MIT License.
 * See LICENSE for full license terms.
 */

"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { CloseIcon, ArrowRightIcon } from "./IconComponents";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'update' | 'feature' | 'announcement' | 'bugfix';
  isNew?: boolean;
}

interface NewsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const newsItems: NewsItem[] = [
  {
    id: '8',
    title: 'Shareable Cards of Your Projects',
    content:
      'Shareable cards of your projects are now available for all users. Just click the share button and copy the link to share your project with the world.',
    date: '2026-02-10',
    type: 'feature',
    isNew: true,
  },
  {
    id: '7',
    title: 'AI Career Roadmap (Pro)',
    content:
      'New AI-powered Career Roadmap that analyzes your projects and generates a personalized growth plan with a downloadable roadmap card. This feature is currently available only for paid users.',
    date: '2026-02-04',
    type: 'feature',
    isNew: true,
  },
  {
    id: '1',
    title: 'AI Image Generator Status',
    content:
      'Generate images with AI using Gemini API and NextJS is not available (Billing Tier Restriction). Just upload a prompt and let the AI generate images for you.',
    date: '2025-11-07',
    type: 'feature',
    isNew: true,
  },
  {
    id: '2',
    title: 'Global Search Protocol',
    content: 'Global search across projects and notes is now live! Find anything instantly.',
    date: '2025-10-24',
    type: 'feature',
    isNew: true
  },
  {
    id: '3',
    title: 'Mobile Interface Update',
    content: 'Completely redesigned mobile navigation with better UX and animations.',
    date: '2025-10-22',
    type: 'update',
    isNew: true
  },
  {
    id: '4',
    title: 'Auto-save Protocol',
    content: 'Notes now auto-save every minute with visual countdown indicator.',
    date: '2025-10-20',
    type: 'feature',
    isNew: false
  },
  {
    id: '5',
    title: 'Theme Engine v2',
    content: 'Added Light, Dark, and Image themes with real-time switching Coming Soon.',
    date: '2025-10-25',
    type: 'update',
    isNew: false
  },
  {
    id: '6',
    title: 'Supabase Matrix Active',
    content: 'Full authentication and database integration is now working perfectly.',
    date: '2025-10-18',
    type: 'announcement',
    isNew: false
  }
];

const getTypeStyles = (type: NewsItem['type']) => {
  switch (type) {
    case 'feature': return 'bg-green-600 text-black';
    case 'update': return 'bg-blue-600 text-black';
    case 'announcement': return 'bg-purple-600 text-black';
    case 'bugfix': return 'bg-red-600 text-black';
    default: return 'bg-white text-black';
  }
};

const getTypeLabel = (type: NewsItem['type']) => {
  return type.toUpperCase();
};

export const NewsDropdown: React.FC<NewsDropdownProps> = ({ isOpen, onClose }) => {
  const newItemsCount = newsItems.filter(item => item.isNew).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-40"
            onClick={onClose}
          />

          {/* Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 1 }}
            transition={{ duration: 0.1, ease: "linear" }}
            className="fixed inset-x-4 top-[5.5rem] mx-auto max-w-[400px] bg-neutral-900 border border-white/20 z-50 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 bg-neutral-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <h3 className="text-xs font-boldonse uppercase text-white tracking-widest">
                   System Log
                 </h3>
                 <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                    // Updates
                 </span>
              </div>
              
              <div className="flex items-center space-x-4">
                {newItemsCount > 0 && (
                   <div className="flex items-center gap-1.5 animate-pulse">
                      <div className="w-1.5 h-1.5 bg-red-500"></div>
                      <span className="text-[10px] font-mono text-red-500 uppercase tracking-widest">
                         {newItemsCount} NEW
                      </span>
                   </div>
                )}
                <button
                  onClick={onClose}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* News Items */}
            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar bg-neutral-950">
              {newsItems.map((item, index) => (
                <div
                  key={item.id}
                  className="group p-6 border-b border-white/10 hover:bg-white/5 transition-colors relative"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-widest ${getTypeStyles(item.type)}`}>
                        {getTypeLabel(item.type)}
                      </span>
                      {item.isNew && (
                        <span className="text-[8px] font-mono text-red-500 uppercase tracking-widest border border-red-500/30 px-1">
                           New Entry
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider tabular-nums">
                      {item.date}
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-boldonse text-white uppercase tracking-wide mb-2 group-hover:text-white/90 transition-colors">
                     {item.title}
                  </h4>
                  <p className="text-xs font-mono text-white/50 leading-relaxed uppercase tracking-wide max-w-[95%]">
                     {item.content}
                  </p>
                  
                  <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <ArrowRightIcon className="w-4 h-4 text-white/20" />
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-white/10 bg-neutral-900 flex justify-between items-center">
               <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">
                  End of Log
               </span>
              <a 
                 href="https://linkedin.com/in/eshan-shettennavar"
                 target="_blank"
                 rel="noopener noreferrer" 
                 className="flex items-center gap-2 text-[10px] font-mono text-white/40 hover:text-white uppercase tracking-widest transition-colors"
                >
                 <span>Follow</span>
                 <ArrowRightIcon className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
