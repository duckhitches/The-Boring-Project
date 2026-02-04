/**
 * Copyright (c) 2025 Eshan Vijay Shettennavar
 * 
 * This file is licensed under the MIT License.
 * See LICENSE for full license terms.
 */

"use client";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: React.ReactNode;
}

type ButtonState = "idle" | "loading" | "success";

export const Button = ({ className, children, ...props }: ButtonProps) => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (buttonState !== "idle") return;
    
    setButtonState("loading");
    
    try {
      await props.onClick?.(event);
      setButtonState("success");
      
      // Reset to idle after showing success for 2 seconds
      setTimeout(() => {
        setButtonState("idle");
      }, 2000);
    } catch (error) {
      setButtonState("idle");
    }
  };

  const {
    onClick,
    onDrag,
    onDragStart,
    onDragEnd,
    onAnimationStart,
    onAnimationEnd,
    ...buttonProps
  } = props;

  return (
    <motion.button
      layout
      layoutId="button"
      className={cn(
        "flex min-w-[120px] cursor-pointer items-center justify-center gap-2 rounded-full bg-pink-500 px-4 py-2 font-medium ring-offset-2 transition duration-200 hover:ring-2 hover:ring-pink-500 dark:ring-offset-black",
        className,
      )}
      {...buttonProps}
      onClick={handleClick}
      disabled={buttonState !== "idle"}
    >
      <motion.div layout className="flex items-center gap-2">
        <AnimatePresence mode="wait">
          {buttonState === "loading" && (
            <motion.div
              key="loader"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Loader />
            </motion.div>
          )}
          {buttonState === "success" && (
            <motion.div
              key="check"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CheckIcon />
            </motion.div>
          )}
        </AnimatePresence>
        <motion.span layout>{children}</motion.span>
      </motion.div>
    </motion.button>
  );
};

const Loader = () => {
  return (
    <motion.svg
      animate={{
        rotate: [0, 360],
      }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        ease: "linear",
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 3a9 9 0 1 0 9 9" />
    </motion.svg>
  );
};

const CheckIcon = () => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
      <path d="M9 12l2 2l4 -4" />
    </motion.svg>
  );
};
