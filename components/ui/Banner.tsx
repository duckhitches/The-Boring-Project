"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import gsap from "gsap"

interface BannerProps {
  show?: boolean;
  message?: string;
  onClose?: () => void;
  autoHide?: boolean;
  duration?: number;
}

export default function Banner({ 
  show = false, 
  message = "✨ Action completed successfully!", 
  onClose,
  autoHide = true,
  duration = 5000 
}: BannerProps) {
  const [showBanner, setShowBanner] = useState(show)
  const [bannerMessage, setBannerMessage] = useState(message)

  const triggerBanner = () => {
    setBannerMessage("✨ Action completed successfully!")
    setShowBanner(true)
  }

  useEffect(() => {
    setShowBanner(show)
    setBannerMessage(message)
  }, [show, message])

  useEffect(() => {
    if (showBanner) {
      // Animate with GSAP when banner appears
      gsap.fromTo(
        ".banner",
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
      )

      // Auto hide after specified duration
      if (autoHide) {
        const timer = setTimeout(() => {
          gsap.to(".banner", {
            y: -100,
            opacity: 0,
            duration: 0.6,
            ease: "power3.in",
            onComplete: () => {
              setShowBanner(false)
              onClose?.()
            },
          })
        }, duration)

        return () => clearTimeout(timer)
      }
    }
  }, [showBanner, autoHide, duration, onClose])

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          key="banner"
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.5 }}
          className="banner fixed top-6 left-1/2 transform -translate-x-1/2 z-[60] bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg"
        >
          {bannerMessage}
        </motion.div>
      )}
    </AnimatePresence>
  )
}