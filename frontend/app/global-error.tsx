"use client"

import { useEffect } from "react"
import { ArrowRight, RotateCcw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <html lang="en">
      <body className="bg-[#0f0f0f] text-[#F2F1EA] font-mono antialiased">
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <div className="flex flex-col items-center text-center max-w-lg">
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#F2F1EA]/40 mb-4">
              {"// SYSTEM: CRITICAL_ERROR"}
            </span>

            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-2 select-none" style={{ fontFamily: "monospace" }}>
              ERROR
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <span className="h-1.5 w-1.5 bg-red-500 rounded-full" />
              <span className="text-xs font-mono tracking-[0.15em] uppercase text-[#F2F1EA]/50">
                RUNTIME_EXCEPTION
              </span>
            </div>

            {/* Error details */}
            <div className="border-2 border-[#F2F1EA]/20 w-full mb-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-[#F2F1EA]/10 border-b-2 border-[#F2F1EA]/20">
                <span className="h-2 w-2 bg-red-400" />
                <span className="h-2 w-2 bg-[#F2F1EA]/30" />
                <span className="h-2 w-2 border border-[#F2F1EA]/20" />
                <span className="ml-auto text-[10px] tracking-widest uppercase text-[#F2F1EA]/50">crash.log</span>
              </div>
              <div className="p-4 text-left">
                <p className="text-xs font-mono text-[#F2F1EA]/40">{"> An unexpected error occurred"}</p>
                <p className="text-xs font-mono text-red-400 mt-1 break-all">
                  {"> " + (error.message || "Unknown error")}
                </p>
                {error.digest && (
                  <p className="text-xs font-mono text-[#F2F1EA]/30 mt-1">
                    {"> Digest: " + error.digest}
                  </p>
                )}
              </div>
            </div>

            <p className="text-xs font-mono text-[#F2F1EA]/50 leading-relaxed mb-8">
              Something went wrong. Try reloading the page or returning to the homepage.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={reset}
                className="group flex items-center gap-0 bg-[#F2F1EA] text-[#0f0f0f] text-xs font-mono tracking-wider uppercase cursor-pointer"
              >
                <span className="flex items-center justify-center w-10 h-10 bg-[#ea580c]">
                  <RotateCcw size={16} strokeWidth={2} className="text-[#F2F1EA]" />
                </span>
                <span className="px-5 py-2.5">Try Again</span>
              </button>

              <a
                href="/"
                className="group flex items-center gap-0 border-2 border-[#F2F1EA]/20 text-[#F2F1EA] text-xs font-mono tracking-wider uppercase cursor-pointer hover:border-[#F2F1EA]/40 transition-colors"
              >
                <span className="flex items-center justify-center w-10 h-10 border-r-2 border-[#F2F1EA]/20">
                  <ArrowRight size={16} strokeWidth={2} />
                </span>
                <span className="px-5 py-2.5">Go Home</span>
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
