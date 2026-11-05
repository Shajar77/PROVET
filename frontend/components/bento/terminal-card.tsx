"use client"

import { useEffect, useState } from "react"
import { Play, Pause, RotateCcw, Check, ShieldCheck } from "lucide-react"

const PIPELINE_STEPS = [
  {
    step: "01",
    tag: "MODEL_COMMIT",
    title: "Model Architecture Registration",
    details: "Model weights hashed to 32-byte digest & anchored on-chain",
    code: "keccak256(weights) -> 0x8f2d4e8b91c0e3a5...",
    contract: "ModelRegistry.sol",
    status: "CONFIRMED",
  },
  {
    step: "02",
    tag: "INFERENCE_RUN",
    title: "Off-Chain Neural Execution",
    details: "Input prompt processed by model; inputs and outputs hashed into cryptographic digests",
    code: "inputHash: 0x4e2a... | outputHash: 0x9b1c...",
    contract: "Model Inference Node",
    status: "COMPUTED",
  },
  {
    step: "03",
    tag: "EIP712_SIGN",
    title: "EIP-712 Cryptographic Signature",
    details: "Model owner's wallet signs structured typed receipt with 2-hour replay protection",
    code: "signTypedData({ modelId, inputHash, outputHash, deadline })",
    contract: "ECDSA secp256k1",
    status: "SIGNED",
  },
  {
    step: "04",
    tag: "ONCHAIN_ANCHOR",
    title: "Attestation Record on Base L2",
    details: "AttestationRegistry verifies signature and stores permanent immutable receipt",
    code: "AttestationRegistry.attest(...) -> Tx: 0x3337...",
    contract: "AttestationRegistry.sol",
    status: "RECORDED",
  },
  {
    step: "05",
    tag: "PUBLIC_AUDIT",
    title: "Trustless 0-Gas Public Audit",
    details: "Anyone worldwide can verify if an output genuinely came from that model version",
    code: "verifyAttestation(modelId, inHash, outHash) === VALID ✓",
    contract: "Public Read RPC / Subgraph",
    status: "VERIFIED",
  },
]

export function TerminalCard() {
  const [activeStep, setActiveStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % PIPELINE_STEPS.length)
    }, 2800)
    return () => clearInterval(interval)
  }, [isPlaying])

  const current = PIPELINE_STEPS[activeStep]

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between border-b-2 border-foreground px-4 py-2.5 bg-foreground text-background">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 bg-[#ea580c]" />
          <span className="text-[10px] tracking-widest uppercase font-mono font-bold">
            PROVENANCE_PIPELINE.SYS
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 hover:text-[#ea580c] transition-colors cursor-pointer"
            title={isPlaying ? "Pause auto-cycle" : "Play auto-cycle"}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
          </button>
          <button
            onClick={() => setActiveStep(0)}
            className="p-1 hover:text-[#ea580c] transition-colors cursor-pointer"
            title="Reset to step 1"
          >
            <RotateCcw size={12} />
          </button>
          <span className="text-[10px] font-mono text-[#ea580c] uppercase ml-1">
            STEP 0{activeStep + 1} / 05
          </span>
        </div>
      </div>

      {/* Main Terminal View */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
        {/* Step Progress Indicators */}
        <div className="grid grid-cols-5 gap-1.5 mb-4">
          {PIPELINE_STEPS.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => {
                setActiveStep(idx)
                setIsPlaying(false)
              }}
              className={`h-2 border transition-all cursor-pointer ${
                idx === activeStep
                  ? "bg-[#ea580c] border-[#ea580c]"
                  : idx < activeStep
                  ? "bg-foreground border-foreground"
                  : "border-foreground/30 bg-transparent hover:border-foreground"
              }`}
              title={`Step ${s.step}: ${s.tag}`}
            />
          ))}
        </div>

        {/* Active Stage Highlight Box */}
        <div className="border border-foreground/30 p-4 bg-foreground/5 space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#ea580c] font-bold">
              PHASE {current.step} {"//"} {current.tag}
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase px-2 py-0.5 bg-foreground text-background font-bold">
              <Check size={10} className="text-green-400" />
              {current.status}
            </span>
          </div>

          <h3 className="text-sm font-mono font-bold text-foreground">
            {current.title}
          </h3>

          <p className="text-xs font-mono text-muted-foreground leading-relaxed">
            {current.details}
          </p>

          <div className="pt-2 border-t border-foreground/15">
            <div className="text-[10px] font-mono text-muted-foreground mb-1 uppercase tracking-wider">
              Cryptographic Execution Log:
            </div>
            <code className="text-[11px] font-mono text-[#ea580c] block break-all bg-background border border-foreground/20 p-2">
              &gt; {current.code}
            </code>
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-1 border-t border-foreground/10">
          <span className="flex items-center gap-1">
            <ShieldCheck size={12} className="text-[#ea580c]" />
            Target: {current.contract}
          </span>
          <span className="text-foreground font-semibold">
            Base Sepolia L2
          </span>
        </div>
      </div>
    </div>
  )
}
