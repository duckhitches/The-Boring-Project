/**
 * Copyright (c) 2025 Eshan Vijay Shettennavar
 * 
 * This file is licensed under the MIT License.
 * See LICENSE for full license terms.
 */

"use client"
import { useState, useEffect } from "react"

interface SpinningStatProps {
  finalValue: number
  label: string
  suffix?: string
}

export function SpinningStat({ finalValue, label, suffix = "" }: SpinningStatProps) {
  const [currentValue, setCurrentValue] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
          animateValue()
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById(`stat-${label}`)
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [isVisible])

  const animateValue = () => {
    const duration = 2000 // 2 seconds
    const startTime = Date.now()
    const startValue = 0

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const current = Math.floor(startValue + (finalValue - startValue) * easeOutQuart)
      
      setCurrentValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }

  return (
    <div id={`stat-${label}`} className="text-center">
      <div className="text-2xl md:text-3xl font-bold text-white mb-2">
        {currentValue.toLocaleString()}{suffix}
      </div>
      <div className="text-sm md:text-base text-gray-400">{label}</div>
    </div>
  )
}