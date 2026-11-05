"use client"

import { HeartPulse, Coins, Bot, Scale, ShieldCheck } from "lucide-react"

const SECTORS = [
  {
    icon: HeartPulse,
    name: "HEALTHCARE & RADIOLOGY",
    problem: "Diagnostic fraud & malpractice disputes",
    solution: "Tamper-proof proof of clinical model version & prompt",
  },
  {
    icon: Coins,
    name: "AUTONOMOUS DEFI & TRADING",
    problem: "Rogue model swapping & fake signal exploitation",
    solution: "Smart contracts require valid EIP-712 proof to execute",
  },
  {
    icon: Bot,
    name: "AUTONOMOUS AI AGENTS",
    problem: "Prompt injections & spoofed agent actions",
    solution: "Every downstream tool invocation is signed on-chain",
  },
  {
    icon: Scale,
    name: "EU AI ACT COMPLIANCE",
    problem: "Penalties for unaudited high-risk AI decisions",
    solution: "Immutable, timestamped public registry for regulators",
  },
]

export function StatusCard() {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-foreground px-4 py-2.5 bg-foreground text-background">
        <div className="flex items-center gap-2">
          <ShieldCheck size={12} className="text-[#ea580c]" />
          <span className="text-[10px] tracking-widest uppercase font-mono font-bold">
            ACCOUNTABILITY_SECTORS
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#ea580c] uppercase">
          MISSION-CRITICAL AI
        </span>
      </div>

      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between space-y-2">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest block">
          Why Verifiability Matters in Production:
        </span>

        <div className="space-y-2">
          {SECTORS.map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.name}
                className="border border-foreground/15 p-2 bg-foreground/5 hover:border-foreground/40 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={12} className="text-[#ea580c] flex-shrink-0" />
                  <span className="text-[11px] font-mono font-bold text-foreground">
                    {s.name}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] font-mono">
                  <div className="text-muted-foreground">
                    <span className="text-red-500 font-semibold">Risk: </span>
                    {s.problem}
                  </div>
                  <div className="text-foreground">
                    <span className="text-green-500 font-semibold">Fix: </span>
                    {s.solution}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="pt-2 border-t border-foreground/15 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
          <span>Non-repudiable Cryptographic Auditing</span>
          <span className="text-[#ea580c] font-semibold">Zero Trust AI</span>
        </div>
      </div>
    </div>
  )
}
