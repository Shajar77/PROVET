"use client"

import { motion } from "framer-motion"

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        {/* Animated logo */}
        <motion.svg
          width="48"
          height="48"
          viewBox="0 0 72 72"
          className="shrink-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="36" cy="36" r="34" fill="none" stroke="#ea580c" strokeWidth="2" strokeDasharray="8 4" />
          <line x1="36" y1="18" x2="36" y2="54" stroke="hsl(var(--foreground))" strokeWidth="3" />
          <line x1="18" y1="36" x2="54" y2="36" stroke="hsl(var(--foreground))" strokeWidth="3" />
          <line x1="24" y1="24" x2="48" y2="48" stroke="hsl(var(--foreground))" strokeWidth="2" />
          <line x1="48" y1="24" x2="24" y2="48" stroke="hsl(var(--foreground))" strokeWidth="2" />
        </motion.svg>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
            LOADING
          </span>
          <motion.span
            className="inline-block h-2 w-2 bg-[#ea580c]"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </div>
  )
}
