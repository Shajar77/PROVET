"use client"

import { useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { ArrowRight, RotateCcw } from "lucide-react"
import { motion } from "framer-motion"

const ease = [0.22, 1, 0.36, 1] as const

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Page error:", error)
  }, [error])

  return (
    <div className="min-h-screen dot-grid-bg">
      <Navbar />
      <main className="w-full px-4 sm:px-6 lg:px-12 flex flex-col items-center justify-center min-h-[70vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="flex flex-col items-center text-center max-w-lg"
        >
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-4">
            {"// ERROR: COMPONENT_FAILURE"}
          </span>

          <h1 className="font-pixel text-4xl sm:text-6xl tracking-tight text-foreground mb-2 select-none">
            OOPS.
          </h1>

          <div className="flex items-center gap-3 mb-6">
            <span className="h-1.5 w-1.5 bg-red-500 rounded-full" />
            <span className="text-xs font-mono tracking-[0.15em] uppercase text-muted-foreground">
              RENDER_ERROR
            </span>
          </div>

          {/* Error box */}
          <div className="border-2 border-foreground w-full mb-8">
            <div className="flex items-center justify-between px-4 py-2 bg-foreground text-background border-b-2 border-foreground">
              <span className="text-[10px] tracking-widest uppercase">error.log</span>
              <span className="h-1.5 w-1.5 bg-red-400" />
            </div>
            <div className="p-4 text-left">
              <p className="text-xs font-mono text-muted-foreground">{"> Something went wrong rendering this page"}</p>
              <p className="text-xs font-mono text-red-500 mt-1 break-all">
                {"> " + (error.message || "Unknown error")}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              onClick={reset}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group flex items-center gap-0 bg-foreground text-background text-xs font-mono tracking-wider uppercase cursor-pointer"
            >
              <span className="flex items-center justify-center w-10 h-10 bg-[#ea580c]">
                <RotateCcw size={16} strokeWidth={2} className="text-background" />
              </span>
              <span className="px-5 py-2.5">Try Again</span>
            </motion.button>

            <a
              href="/"
              className="group flex items-center gap-0 border-2 border-foreground/20 text-foreground text-xs font-mono tracking-wider uppercase cursor-pointer hover:border-foreground/40 transition-colors"
            >
              <span className="flex items-center justify-center w-10 h-10 border-r-2 border-foreground/20">
                <ArrowRight size={16} strokeWidth={2} />
              </span>
              <span className="px-5 py-2.5">Go Home</span>
            </a>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
