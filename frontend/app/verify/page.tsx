"use client"

import { Navbar } from "@/components/navbar"
import { motion } from "framer-motion"
import { useState } from "react"
import { ArrowRight, Check, X } from "lucide-react"
import { keccak256, toBytes } from "viem"
import { createRovet } from "@/lib/sdk"
import toast from "react-hot-toast"

const ease = [0.22, 1, 0.36, 1] as const

interface VerifyResult {
  isValid: boolean
  modelName?: string
  timestamp?: string
  attestationId?: string
}

export default function VerifyPage() {
  const [modelId, setModelId] = useState("")
  const [inputData, setInputData] = useState("")
  const [outputData, setOutputData] = useState("")
  const [verificationResult, setVerificationResult] = useState<VerifyResult | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  const handleVerify = async () => {
    if (!modelId) {
      toast.error("Please enter a Model ID")
      return
    }

    setIsVerifying(true)
    setVerificationResult(null)

    try {
      const sdk = createRovet({ chain: "baseSepolia" })

      // If user provided raw input/output strings, hash them
      const inputHash = inputData.startsWith("0x") 
        ? inputData as `0x${string}` 
        : keccak256(toBytes(inputData || ""))
      const outputHash = outputData.startsWith("0x") 
        ? outputData as `0x${string}` 
        : keccak256(toBytes(outputData || ""))

      const result = await sdk.verifyAttestation(
        modelId as `0x${string}`,
        inputHash,
        outputHash
      )

      if (result.isValid) {
        // Try to get model details
        const model = await sdk.getModel(modelId as `0x${string}`)
        
        setVerificationResult({
          isValid: true,
          modelName: model?.name || "Unknown Model",
          timestamp: new Date().toISOString().replace("T", " ").split(".")[0] + " UTC",
          attestationId: result.attestationId || undefined,
        })
        toast.success("Prediction verified on-chain!")
      } else {
        setVerificationResult({
          isValid: false,
        })
        toast.error("Attestation not found on-chain")
      }
    } catch (error) {
      console.error("Verification failed:", error)
      // Fall back to showing a "not found" result for RPC errors 
      setVerificationResult({
        isValid: false,
      })
      toast.error("Verification failed — check your inputs and try again")
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="min-h-screen dot-grid-bg">
      <Navbar />
      <main className="w-full px-4 sm:px-6 py-8 sm:py-12 lg:px-12">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease }}
          className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8"
        >
          <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
            {"// SECTION: VERIFY_PREDICTION"}
          </span>
          <div className="flex-1 border-t border-border" />
          <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
            007
          </span>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="mb-8 sm:mb-12"
        >
          <h1 className="font-pixel text-2xl sm:text-3xl lg:text-5xl tracking-tight text-foreground mb-3 sm:mb-4">
            VERIFY PREDICTION
          </h1>
          <p className="text-xs lg:text-sm text-muted-foreground max-w-lg font-mono">
            Verify if a prediction was attested by a registered AI model on-chain using cryptographic proofs.
          </p>
        </motion.div>

        {/* Verification form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease }}
          className="max-w-2xl"
        >
          <div className="border-2 border-foreground">
            {/* Form header */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b-2 border-foreground bg-foreground text-background">
              <span className="text-[10px] tracking-[0.2em] uppercase font-mono">
                VERIFICATION_QUERY
              </span>
              <span className="text-[10px] tracking-[0.2em] uppercase font-mono opacity-50">
                EIP-712
              </span>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {/* Model ID */}
              <div className="space-y-2">
                <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono block">
                  MODEL_ID (bytes32) *
                </label>
                <input
                  type="text"
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 bg-transparent border-2 border-foreground text-sm font-mono focus:outline-none focus:border-[#ea580c] transition-colors min-w-0"
                />
              </div>

              {/* Input Data */}
              <div className="space-y-2">
                <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono block">
                  INPUT_DATA (raw text or bytes32 hash)
                </label>
                <input
                  type="text"
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  placeholder="Raw input text or 0x... hash"
                  className="w-full px-4 py-3 bg-transparent border-2 border-foreground text-sm font-mono focus:outline-none focus:border-[#ea580c] transition-colors min-w-0"
                />
              </div>

              {/* Output Data */}
              <div className="space-y-2">
                <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono block">
                  OUTPUT_DATA (raw text or bytes32 hash)
                </label>
                <input
                  type="text"
                  value={outputData}
                  onChange={(e) => setOutputData(e.target.value)}
                  placeholder="Raw output text or 0x... hash"
                  className="w-full px-4 py-3 bg-transparent border-2 border-foreground text-sm font-mono focus:outline-none focus:border-[#ea580c] transition-colors min-w-0"
                />
              </div>

              {/* Verify button */}
              <motion.button
                onClick={handleVerify}
                disabled={!modelId || isVerifying}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-0 bg-foreground text-background text-xs font-mono tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center w-10 h-10 bg-[#ea580c]">
                  {isVerifying ? (
                    <span className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  ) : (
                    <ArrowRight size={16} strokeWidth={2} className="text-background" />
                  )}
                </span>
                <span className="flex-1 py-2.5 text-center">
                  {isVerifying ? "VERIFYING..." : "VERIFY ON-CHAIN"}
                </span>
              </motion.button>
            </div>

            {/* Result */}
            {verificationResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease }}
                className={`border-t-2 p-4 sm:p-5 ${
                  verificationResult.isValid 
                    ? "border-green-500 bg-green-500/10" 
                    : "border-red-500 bg-red-500/10"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  {verificationResult.isValid ? (
                    <>
                      <Check size={20} className="text-green-500" />
                      <span className="text-sm font-mono font-bold text-green-500">VERIFIED ON-CHAIN</span>
                    </>
                  ) : (
                    <>
                      <X size={20} className="text-red-500" />
                      <span className="text-sm font-mono font-bold text-red-500">NOT FOUND ON-CHAIN</span>
                    </>
                  )}
                </div>

                {verificationResult.isValid && (
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground flex-shrink-0">MODEL:</span>
                      <span className="font-semibold break-all">{verificationResult.modelName}</span>
                    </div>
                    {verificationResult.attestationId && (
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground flex-shrink-0">ATTESTATION:</span>
                        <span className="break-all">{verificationResult.attestationId}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">TIMESTAMP:</span>
                      <span>{verificationResult.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">STATUS:</span>
                      <span className="text-green-500">CRYPTOGRAPHICALLY VERIFIED</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Info box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease }}
          className="max-w-2xl mt-8"
        >
          <div className="border border-foreground/30 p-4">
            <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-2">
              HOW IT WORKS
            </span>
            <ol className="text-xs font-mono text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Enter the model ID, input data, and output data</li>
              <li>We query the blockchain for matching attestations</li>
              <li>The contract verifies the cryptographic signature</li>
              <li>If valid, we display which model made the prediction</li>
            </ol>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
