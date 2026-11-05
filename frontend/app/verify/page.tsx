"use client"

import { Navbar } from "@/components/navbar"
import { motion } from "framer-motion"
import { useState, useEffect, useCallback, Suspense } from "react"
import { ArrowRight, Check, X, ShieldCheck, Sparkles, ExternalLink } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { keccak256, toBytes, isHex, Hash } from "viem"
import { createRovet } from "@/lib/sdk"
import toast from "react-hot-toast"
import Link from "next/link"

const ease = [0.22, 1, 0.36, 1] as const

interface VerifyResult {
  isValid: boolean
  modelName?: string
  modelVersion?: string
  modelOwner?: string
  timestamp?: string
  attestationId?: string
}

function VerifyContent() {
  const searchParams = useSearchParams()
  const initialModelId = searchParams.get("modelId") || ""
  const initialInput = searchParams.get("input") || ""
  const initialOutput = searchParams.get("output") || ""

  const [modelId, setModelId] = useState(initialModelId)
  const [inputData, setInputData] = useState(initialInput)
  const [outputData, setOutputData] = useState(initialOutput)
  const [verificationResult, setVerificationResult] = useState<VerifyResult | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  // Live computed hashes
  const inputHash = inputData
    ? (inputData.startsWith("0x") && isHex(inputData) && inputData.length === 66
        ? (inputData as Hash)
        : keccak256(toBytes(inputData)))
    : ""

  const outputHash = outputData
    ? (outputData.startsWith("0x") && isHex(outputData) && outputData.length === 66
        ? (outputData as Hash)
        : keccak256(toBytes(outputData)))
    : ""

  const handleVerify = useCallback(async () => {
    if (!modelId.trim()) {
      toast.error("Please enter a Model ID")
      return
    }

    setIsVerifying(true)
    setVerificationResult(null)

    try {
      const sdk = createRovet({ chain: "baseSepolia" })

      const currentInputHash = inputData.startsWith("0x") && isHex(inputData) && inputData.length === 66
        ? (inputData as Hash)
        : keccak256(toBytes(inputData || ""))

      const currentOutputHash = outputData.startsWith("0x") && isHex(outputData) && outputData.length === 66
        ? (outputData as Hash)
        : keccak256(toBytes(outputData || ""))

      const result = await sdk.verifyAttestation(
        modelId as Hash,
        currentInputHash,
        currentOutputHash
      )

      if (result.isValid) {
        const model = await sdk.getModel(modelId as Hash)
        setVerificationResult({
          isValid: true,
          modelName: model?.name || "Verified Model",
          modelVersion: model?.currentVersion || "v1.0.0",
          modelOwner: model?.owner,
          timestamp: new Date().toISOString().replace("T", " ").split(".")[0] + " UTC",
          attestationId: result.attestationId || undefined,
        })
        toast.success("Prediction verified on Base Sepolia!")
      } else {
        setVerificationResult({
          isValid: false,
        })
        toast.error("No valid on-chain attestation found")
      }
    } catch (error) {
      console.error("Verification failed:", error)
      setVerificationResult({
        isValid: false,
      })
      toast.error("Verification check failed — verify inputs and network")
    } finally {
      setIsVerifying(false)
    }
  }, [modelId, inputData, outputData])

  // Auto-verify if parameters are provided in URL
  useEffect(() => {
    if (initialModelId && (initialInput || initialOutput)) {
      const timer = setTimeout(() => {
        handleVerify()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [initialModelId, initialInput, initialOutput, handleVerify])

  const handleLoadDemo = () => {
    setModelId("0x301651c55623e5b022b35e22d7c3935b3fafbc8f000000000000000000000001")
    setInputData("MRI scan chest_AP_view: patient #48921. Resolution: 2048x2048px.")
    setOutputData("FINDINGS: Normal heart size and pulmonary vascularity. No pneumothorax. CONFIDENCE: 99.4%")
    toast.success("Loaded demo inference data")
  }

  return (
    <div className="w-full px-4 sm:px-6 py-8 sm:py-12 lg:px-12 max-w-5xl mx-auto">
      {/* Section label */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease }}
        className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
          {"// PROTOCOL: INDEPENDENT_VERIFICATION"}
        </span>
        <div className="flex-1 border-t border-border" />
        <span className="text-[10px] tracking-[0.2em] uppercase text-[#ea580c] font-mono">
          STEP 03 / 03
        </span>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-pixel text-2xl sm:text-3xl lg:text-5xl tracking-tight text-foreground mb-3">
              VERIFY PREDICTION
            </h1>
            <p className="text-xs lg:text-sm text-muted-foreground max-w-xl font-mono">
              Cryptographically prove whether an inference output was genuinely produced by an accredited AI model on Base.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLoadDemo}
            className="self-start sm:self-auto flex items-center gap-2 px-3 py-2 border border-foreground/30 text-xs font-mono uppercase tracking-wider hover:border-[#ea580c] hover:text-[#ea580c] transition-colors cursor-pointer"
          >
            <Sparkles size={14} className="text-[#ea580c]" />
            Load Demo Sample
          </button>
        </div>
      </motion.div>

      {/* Verification Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease }}
        className="border-2 border-foreground bg-background mb-8"
      >
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b-2 border-foreground bg-foreground text-background">
          <span className="text-[10px] tracking-[0.2em] uppercase font-mono font-bold">
            ONCHAIN_AUDIT_INTERFACE
          </span>
          <span className="text-[10px] font-mono text-[#ea580c] uppercase">BASE SEPOLIA</span>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Model ID */}
          <div className="space-y-2">
            <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono block">
              MODEL_IDENTIFIER (BYTES32) *
            </label>
            <input
              type="text"
              value={modelId}
              onChange={(e) => setModelId(e.target.value.trim())}
              placeholder="0x... (e.g. 0x301651c55623e5b022b35e22d7c3935b3fafbc8f...)"
              className="w-full px-4 py-3 bg-transparent border-2 border-foreground text-xs font-mono focus:outline-none focus:border-[#ea580c] transition-colors"
            />
          </div>

          {/* Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
                INFERENCE_INPUT (PROMPT OR INPUT DATA) *
              </label>
              {inputHash && (
                <span className="text-[10px] font-mono text-muted-foreground truncate max-w-xs">
                  hash: {inputHash.slice(0, 16)}...
                </span>
              )}
            </div>
            <textarea
              rows={3}
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="Paste raw inference prompt, image hash, or input payload"
              className="w-full px-4 py-3 bg-transparent border-2 border-foreground text-xs font-mono focus:outline-none focus:border-[#ea580c] transition-colors resize-y"
            />
          </div>

          {/* Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
                INFERENCE_OUTPUT (PREDICTION PAYLOAD) *
              </label>
              {outputHash && (
                <span className="text-[10px] font-mono text-muted-foreground truncate max-w-xs">
                  hash: {outputHash.slice(0, 16)}...
                </span>
              )}
            </div>
            <textarea
              rows={3}
              value={outputData}
              onChange={(e) => setOutputData(e.target.value)}
              placeholder="Paste the output response, diagnosis, classification score, or decision"
              className="w-full px-4 py-3 bg-transparent border-2 border-foreground text-xs font-mono focus:outline-none focus:border-[#ea580c] transition-colors resize-y"
            />
          </div>

          {/* Action Button */}
          <motion.button
            onClick={handleVerify}
            disabled={!modelId || isVerifying}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full flex items-center justify-between bg-foreground text-background text-xs font-mono tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="flex items-center justify-center w-12 h-12 bg-[#ea580c] text-white">
              {isVerifying ? (
                <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ShieldCheck size={18} strokeWidth={2} />
              )}
            </span>
            <span className="flex-1 py-3 text-center font-bold">
              {isVerifying ? "QUERYING BASE ATTESTATION REGISTRY..." : "VERIFY CRYPTOGRAPHIC PROOF"}
            </span>
            <span className="w-12 h-12 border-l border-background/20 flex items-center justify-center">
              <ArrowRight size={16} />
            </span>
          </motion.button>
        </div>

        {/* Verification Result Display */}
        {verificationResult !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.4, ease }}
            className={`border-t-2 border-foreground p-6 ${
              verificationResult.isValid ? "bg-green-500/10" : "bg-red-500/10"
            }`}
          >
            {verificationResult.isValid ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-500 font-mono text-sm uppercase font-bold tracking-wider">
                  <Check size={18} strokeWidth={2.5} />
                  PREDICTION VERIFIED ON-CHAIN
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="border border-foreground/20 p-3 bg-background space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase block">Model Name</span>
                    <span className="font-bold text-sm">{verificationResult.modelName}</span>
                    <span className="text-muted-foreground block text-[11px]">{verificationResult.modelVersion}</span>
                  </div>

                  <div className="border border-foreground/20 p-3 bg-background space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase block">Attestation ID</span>
                    <span className="font-semibold break-all text-[11px]">{verificationResult.attestationId}</span>
                  </div>

                  {verificationResult.modelOwner && (
                    <div className="border border-foreground/20 p-3 bg-background space-y-1 md:col-span-2">
                      <span className="text-[10px] text-muted-foreground uppercase block">Owner Address</span>
                      <a
                        href={`https://sepolia.basescan.org/address/${verificationResult.modelOwner}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#ea580c] hover:underline flex items-center gap-1 font-semibold break-all"
                      >
                        {verificationResult.modelOwner}
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>

                <div className="text-[11px] font-mono text-muted-foreground">
                  Timestamp checked: {verificationResult.timestamp}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-red-500 font-mono text-sm uppercase font-bold tracking-wider">
                  <X size={18} strokeWidth={2.5} />
                  NO VALID ATTESTATION FOUND
                </div>
                <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                  The AttestationRegistry on Base Sepolia contains no record linking this Model ID to this exact input and output.
                  Ensure you entered the exact characters of the prompt and prediction, or that the model owner has issued an attestation.
                </p>
                <div className="pt-2">
                  <Link
                    href={`/attest?modelId=${modelId}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-xs font-mono uppercase tracking-wider hover:bg-[#ea580c] transition-colors"
                  >
                    Issue Attestation for this Model
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen dot-grid-bg">
      <Navbar />
      <main>
        <Suspense
          fallback={
            <div className="p-12 text-center font-mono text-xs text-muted-foreground">
              Loading Verification Portal...
            </div>
          }
        >
          <VerifyContent />
        </Suspense>
      </main>
    </div>
  )
}
