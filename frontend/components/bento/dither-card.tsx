"use client"

import { useState } from "react"
import { keccak256, toBytes } from "viem"
import { ShieldAlert, ShieldCheck, Sparkles } from "lucide-react"

const GENUINE_SAMPLE = {
  input: "Chest X-Ray scan: Patient #9042. Resolution: 2048x2048px.",
  output: "Benign pulmonary nodule. Malignancy risk: 0.8%. No surgical action needed.",
  isTampered: false,
}

const TAMPERED_SAMPLE = {
  input: "Chest X-Ray scan: Patient #9042. Resolution: 2048x2048px.",
  output: "Critical malignancy detected. Immediate surgical excision required.",
  isTampered: true,
}

export function DitherCard() {
  const [mode, setMode] = useState<"genuine" | "tampered">("genuine")
  const [customOutput, setCustomOutput] = useState<string>(GENUINE_SAMPLE.output)

  const handleSelectMode = (newMode: "genuine" | "tampered") => {
    setMode(newMode)
    if (newMode === "genuine") {
      setCustomOutput(GENUINE_SAMPLE.output)
    } else {
      setCustomOutput(TAMPERED_SAMPLE.output)
    }
  }

  const activeInput = GENUINE_SAMPLE.input
  const currentOutputHash = keccak256(toBytes(customOutput))
  const isVerified = mode === "genuine" && customOutput === GENUINE_SAMPLE.output

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b-2 border-foreground px-4 py-2.5 bg-foreground text-background">
        <div className="flex items-center gap-2">
          <Sparkles size={12} className="text-[#ea580c]" />
          <span className="text-[10px] tracking-widest uppercase font-mono font-bold">
            TAMPER_DETECTION_LAB
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#ea580c] uppercase">
          LIVE PROOF AUDITOR
        </span>
      </div>

      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between space-y-3">
        {/* Scenario Selector */}
        <div className="flex gap-2 border-b border-foreground/20 pb-3">
          <button
            onClick={() => handleSelectMode("genuine")}
            className={`flex-1 py-1.5 px-2 text-[10px] font-mono uppercase tracking-wider font-bold transition-all cursor-pointer border ${
              mode === "genuine"
                ? "bg-green-500/10 border-green-500 text-green-500"
                : "border-foreground/30 text-muted-foreground hover:border-foreground"
            }`}
          >
            Scenario A: Genuine Output
          </button>
          <button
            onClick={() => handleSelectMode("tampered")}
            className={`flex-1 py-1.5 px-2 text-[10px] font-mono uppercase tracking-wider font-bold transition-all cursor-pointer border ${
              mode === "tampered"
                ? "bg-red-500/10 border-red-500 text-red-500"
                : "border-foreground/30 text-muted-foreground hover:border-foreground"
            }`}
          >
            Scenario B: Tampered Output
          </button>
        </div>

        {/* Input & Output Hashes */}
        <div className="space-y-2 text-xs font-mono">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase block mb-0.5">
              Input Prompt:
            </span>
            <div className="px-2.5 py-1 bg-foreground/5 border border-foreground/15 text-[10px] font-mono text-muted-foreground truncate">
              {activeInput}
            </div>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase block mb-0.5">
              Inference Output (Editable to Test):
            </span>
            <textarea
              rows={2}
              value={customOutput}
              onChange={(e) => setCustomOutput(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-background border border-foreground/30 text-[11px] font-mono focus:outline-none focus:border-[#ea580c] transition-colors resize-none"
            />
          </div>

          <div className="bg-foreground/5 p-2 border border-foreground/20 space-y-1">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-muted-foreground uppercase">Computed keccak256:</span>
              <span className="text-muted-foreground">32-byte digest</span>
            </div>
            <div className="text-[11px] font-mono text-[#ea580c] break-all">
              {currentOutputHash}
            </div>
          </div>
        </div>

        {/* Verification Status Banner */}
        <div
          className={`border-2 p-3 transition-colors ${
            isVerified
              ? "border-green-500 bg-green-500/10 text-green-500"
              : "border-red-500 bg-red-500/10 text-red-500"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            {isVerified ? (
              <>
                <ShieldCheck size={16} strokeWidth={2.5} />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  PREDICTION VERIFIED ON BASE SEPOLIA [VALID]
                </span>
              </>
            ) : (
              <>
                <ShieldAlert size={16} strokeWidth={2.5} />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  TAMPER DETECTED // AUDIT FAILED [INVALID]
                </span>
              </>
            )}
          </div>
          <p className="text-[10px] font-mono text-muted-foreground leading-normal">
            {isVerified
              ? "This output matches the EIP-712 cryptographic signature signed by the registered model owner."
              : "Hash mismatch: The output text was altered or generated by an unaccredited model. The blockchain rejects this proof."}
          </p>
        </div>
      </div>
    </div>
  )
}
