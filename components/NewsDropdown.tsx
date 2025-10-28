"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { CloseIcon } from "./IconComponents";

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
    id: '1',
    title: 'New Search Functionality',
    content: 'Global search across projects and notes is now live! Find anything instantly.',
    date: '2024-01-15',
    type: 'feature',
    isNew: true
  },
  {
    id: '2',
    title: 'Mobile Sidebar Redesign',
    content: 'Completely redesigned mobile navigation with better UX and animations.',
    date: '2024-01-14',
    type: 'update',
    isNew: true
  },
  {
    id: '3',
    title: 'Auto-save Notes Feature',
    content: 'Notes now auto-save every minute with visual countdown indicator.',
    date: '2024-01-13',
    type: 'feature',
    isNew: false
  },
  {
    id: '4',
    title: 'Theme Engine Update',
    content: 'Added Light, Dark, and Image themes with real-time switching.',
    date: '2024-01-12',
    type: 'update',
    isNew: false
  },
  {
    id: '5',
    title: 'Supabase Integration Complete',
    content: 'Full authentication and database integration is now working perfectly.',
    date: '2024-01-11',
    type: 'announcement',
    isNew: false
  }
];

const getTypeColor = (type: NewsItem['type']) => {
  switch (type) {
    case 'feature': return 'text-green-400 bg-green-400/10';
    case 'update': return 'text-blue-400 bg-blue-400/10';
    case 'announcement': return 'text-purple-400 bg-purple-400/10';
    case 'bugfix': return 'text-orange-400 bg-orange-400/10';
    default: return 'text-gray-400 bg-gray-400/10';
  }
};

const getTypeLabel = (type: NewsItem['type']) => {
  switch (type) {
    case 'feature': return 'Feature';
    case 'update': return 'Update';
    case 'announcement': return 'Announcement';
    case 'bugfix': return 'Bug Fix';
    default: return 'News';
  }
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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-12 w-96 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-neutral-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Updates from Developer-Eshan</h3>
                <div className="flex items-center space-x-2">
                  {newItemsCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {newItemsCount} new
                    </span>
                  )}
                  <button
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* News Items */}
            <div className="max-h-96 overflow-y-auto">
              {newsItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-neutral-800/50 transition-colors border-b border-neutral-800/50 last:border-b-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(item.type)}`}>
                        {getTypeLabel(item.type)}
                      </span>
                      {item.isNew && (
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      )}
                    </div>
                    <span className="text-xs text-neutral-500">{item.date}</span>
                  </div>
                  
                  <h4 className="text-sm font-medium text-white mb-1">{item.title}</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">{item.content}</p>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-neutral-800">
              <p className="text-xs text-neutral-400">Follow me on <a href="https://linkedin.com/in/eshan-shettennavar" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 transition-colors">
              <Image src="./images/linkedin.svg" alt="LinkedIn" width={16} height={16} /> for more updates</a></p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
