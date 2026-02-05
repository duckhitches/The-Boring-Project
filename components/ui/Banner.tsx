/**
 * Copyright (c) 2025 Eshan Vijay Shettennavar
 * 
 * This file is licensed under the MIT License.
 * See LICENSE for full license terms.
 */

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../../lib/utils"
import { X } from "lucide-react"

interface BannerProps {
  show?: boolean;
  message?: string;
  onClose?: () => void;
  autoHide?: boolean;
  duration?: number;
  type?: 'success' | 'error' | 'info';
  className?: string;
}

export default function Banner({ 
  show = false, 
  message = "Action completed successfully!", 
  onClose,
  autoHide = true,
  duration = 5000,
  type = 'success',
  className
}: BannerProps) {
  const [showBanner, setShowBanner] = useState(show)

  useEffect(() => {
    setShowBanner(show)
  }, [show])

  useEffect(() => {
    if (showBanner && autoHide) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [showBanner, autoHide, duration])

  const handleClose = () => {
    setShowBanner(false)
    onClose?.()
  }

  const typeStyles = {
    success: "bg-black text-white border-white/20",
    error: "bg-red-600 text-white border-red-400/50",
    info: "bg-white text-black border-black/20"
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          key="banner"
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ 
            duration: 0.2,
            ease: [0.19, 1, 0.22, 1] // Sharp exponential ease-out
          }}
          className={cn(
            "fixed z-[100] font-mono uppercase tracking-[0.2em] text-xs",
            // Responsiveness: Full width on mobile top, floating on desktop top-right
            "top-0 left-0 w-full sm:top-6 sm:left-auto sm:right-6 sm:w-auto sm:max-w-md",
            "border-b sm:border",
            typeStyles[type],
            "shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]",
            className
          )}
        >
          <div className="flex items-center justify-between p-4 gap-4">
            <span className="flex-1">
              {type === 'success' && <span className="mr-2">✓</span>}
              {type === 'error' && <span className="mr-2">!</span>}
              {message}
            </span>
            <button 
              onClick={handleClose}
              className="hover:opacity-50 transition-opacity p-1"
              aria-label="Close banner"
            >
              <X size={16} />
            </button>
          </div>
          
          {/* Animated progress bar for autoHide */}
          {autoHide && (
            <motion.div 
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: duration / 1000, ease: "linear" }}
              className={cn(
                "h-0.5 w-full origin-left bg-current opacity-30"
              )}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}