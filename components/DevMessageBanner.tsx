/**
 * Copyright (c) 2025 Eshan Vijay Shettennavar
 *
 * This file is licensed under the MIT License.
 * See LICENSE for full license terms.
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const STORAGE_KEY = "dev-message-banner-dismissed";

export default function DevMessageBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem(STORAGE_KEY, "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-[2px]"
            onClick={handleClose}
            aria-hidden="true"
          />
          {/* Centered popup box */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.1, ease: "linear" }}
            className="fixed left-2 right-2 top-20 z-[201] sm:left-1/2 sm:right-auto sm:-translate-x-1/2 w-auto sm:w-[calc(100%-2rem)] max-w-md mx-auto sm:mx-0"
            role="dialog"
            aria-labelledby="dev-message-title"
            aria-modal="true"
          >
            <div
              className="border border-white/20 bg-neutral-900 shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-3 py-2 sm:px-5 sm:py-3 border-b border-white/10 bg-neutral-900 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <h2
                    id="dev-message-title"
                    className="text-xs font-mono font-bold uppercase text-white tracking-widest"
                  >
                    Dev Message
                  </h2>
                  <span className="hidden sm:inline text-[10px] font-mono text-white/40 uppercase tracking-wider">
                    // Notice
                  </span>
                </div>
                <button
                  onClick={handleClose}
                  className="text-white/40 hover:text-white transition-colors"
                  aria-label="Close message"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="px-3 py-3 sm:px-5 sm:py-4 bg-neutral-950">
                <div className="flex items-center gap-1.5 mb-2 sm:mb-3">
                  <div className="w-1.5 h-1.5 bg-yellow-500 animate-pulse"></div>
                  <span className="text-[8px] font-mono text-yellow-500 uppercase tracking-widest">
                    Backend Paused
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] font-mono text-white/60 leading-relaxed">
                  The backend is paused due to non-activity on Supabase. To
                  activate it, put in a request to my name at{" "}
                  <a
                    href="mailto:duckhitches@outlook.com"
                    className="font-mono text-green-500 hover:text-green-400 transition-colors underline decoration-green-500/30 underline-offset-2"
                  >
                    duckhitches@outlook.com
                  </a>{" "}
                  and I&apos;ll activate it, or else visit my{" "}
                  <a
                    href="https://portfolio-eshan-2z6t.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-green-500 hover:text-green-400 transition-colors underline decoration-green-500/30 underline-offset-2"
                  >
                    portfolio
                  </a>
                  .
                </p>
              </div>

              {/* Footer */}
              <div className="px-3 py-2 sm:px-5 sm:py-2.5 border-t border-white/10 bg-neutral-900 flex justify-end">
                <button
                  onClick={handleClose}
                  className="text-[10px] font-mono text-white/40 hover:text-white uppercase tracking-widest transition-colors"
                >
                  Dismiss ✕
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
