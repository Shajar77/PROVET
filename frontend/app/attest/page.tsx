"use client"

import { Navbar } from "@/components/navbar"
import { motion } from "framer-motion"
import { useState, useEffect, Suspense } from "react"
import { ArrowRight, Check, ExternalLink, Sparkles, ShieldCheck } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useAccount } from "wagmi"
import { keccak256, toBytes, isHex, Hash } from "viem"
import { createRovet } from "@/lib/sdk"
import { useTransaction } from "@/hooks/use-transaction"
import { useWeb3Context } from "@/app/web3-context"
import toast from "react-hot-toast"
import Link from "next/link"

const ease = [0.22, 1, 0.36, 1] as const

function AttestContent() {
  const searchParams = useSearchParams()
  const initialModelId = searchParams.get("modelId") || ""

  const { enableWeb3 } = useWeb3Context()
  const { isConnected, address } = useAccount()

  const [modelId, setModelId] = useState(initialModelId)
  const [inputData, setInputData] = useState("")
  const [outputData, setOutputData] = useState("")
  const [metadataURI, setMetadataURI] = useState("ipfs://")
  const [userModels, setUserModels] = useState<Array<{ id: string; name: string; version: string }>>([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [createdAttestation, setCreatedAttestation] = useState<{
    id: string
    txHash: string
    modelId: string
    inputHash: string
    outputHash: string
  } | null>(null)

  // Computed hashes
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

  // Fetch models owned by user if connected
  useEffect(() => {
    async function loadOwnerModels() {
      if (!isConnected || !address) return
      setLoadingModels(true)
      try {
        const sdk = createRovet({ chain: "baseSepolia" })
        const modelIds = await sdk.getOwnerModels(address as `0x${string}`)
        const modelsData = await Promise.all(
          modelIds.map(async (id) => {
            const m = await sdk.getModel(id)
            return {
              id,
              name: m?.name || "Unnamed Model",
              version: m?.currentVersion || "v1.0.0",
            }
          })
        )
        setUserModels(modelsData)
        if (modelsData.length > 0 && !modelId) {
          setModelId(modelsData[0].id)
        }
      } catch (err) {
        console.warn("Could not load owner models:", err)
      } finally {
        setLoadingModels(false)
      }
    }

    if (isConnected) {
      loadOwnerModels()
    }
  }, [isConnected, address, modelId])

  const { isLoading, execute } = useTransaction({
    successMessage: "Attestation recorded permanently on Base Sepolia!",
    errorMessage: "Failed to create attestation",
    onSuccess: (hash) => {
      setCreatedAttestation({
        id: hash,
        txHash: hash,
        modelId,
        inputHash,
        outputHash,
      })
    },
  })

  const handleLoadSample = () => {
    setInputData("MRI scan chest_AP_view: patient #48921. Resolution: 2048x2048px.")
    setOutputData("FINDINGS: Normal heart size and pulmonary vascularity. No pneumothorax. CONFIDENCE: 99.4%")
    setMetadataURI("ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi")
    if (!modelId) {
      setModelId("0x301651c55623e5b022b35e22d7c3935b3fafbc8f000000000000000000000001")
    }
    toast.success("Loaded sample medical inference data")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modelId || !inputData || !outputData) {
      toast.error("Please fill in model ID, input, and output")
      return
    }

    if (!isConnected) {
      enableWeb3()
      toast.error("Please connect your wallet first")
      return
    }

    const sdk = createRovet({ chain: "baseSepolia" })

    await execute(async () => {
      // 1. Generate EIP-712 typed signature from wallet
      const sigData = await sdk.generateAttestationSignature(
        modelId as Hash,
        inputHash as Hash,
        outputHash as Hash,
        120 // valid for 2 hours
      )

      // 2. Submit on-chain attestation transaction
      const result = await sdk.createAttestation({
        modelId: modelId as Hash,
        inputHash: inputHash as Hash,
        outputHash: outputHash as Hash,
        metadataURI: metadataURI || "ipfs://",
        deadline: sigData.deadline,
        v: sigData.v,
        r: sigData.r,
        s: sigData.s,
      })

      return result
    })
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
          {"// PROTOCOL: ATTESTATION_STUDIO"}
        </span>
        <div className="flex-1 border-t border-border" />
        <span className="text-[10px] tracking-[0.2em] uppercase text-[#ea580c] font-mono">
          STEP 02 / 03
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
              ISSUE ATTESTATION
            </h1>
            <p className="text-xs lg:text-sm text-muted-foreground max-w-xl font-mono">
              Sign an EIP-712 cryptographic proof linking your model to its inference input and output.
              Stored permanently on Base Sepolia.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLoadSample}
            className="self-start sm:self-auto flex items-center gap-2 px-3 py-2 border border-foreground/30 text-xs font-mono uppercase tracking-wider hover:border-[#ea580c] hover:text-[#ea580c] transition-colors cursor-pointer"
          >
            <Sparkles size={14} className="text-[#ea580c]" />
            Load Sample
          </button>
        </div>
      </motion.div>

      {/* Main Attestation Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease }}
        className="border-2 border-foreground bg-background"
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b-2 border-foreground bg-foreground text-background">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-[#ea580c]" />
            <span className="text-[10px] tracking-[0.2em] uppercase font-mono font-semibold">
              EIP712_INFERENCE_SIGNER
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isConnected ? (
              <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase">
                <span className="h-1.5 w-1.5 bg-green-400 rounded-full" />
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "CONNECTED"}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-background/60">
                <span className="h-1.5 w-1.5 bg-red-400 rounded-full" />
                DISCONNECTED
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Model Selector / ID Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
                TARGET_MODEL_ID *
              </label>
              {loadingModels ? (
                <span className="text-[10px] font-mono text-muted-foreground animate-pulse">
                  Querying registered models...
                </span>
              ) : userModels.length > 0 ? (
                <span className="text-[10px] font-mono text-[#ea580c]">
                  Found {userModels.length} registered models in your wallet
                </span>
              ) : null}
            </div>

            {userModels.length > 0 ? (
              <div className="space-y-2">
                <select
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                  disabled={loadingModels}
                  className="w-full px-4 py-3 bg-background border-2 border-foreground text-xs font-mono focus:outline-none focus:border-[#ea580c]"
                >
                  <option value="">-- Select from your models --</option>
                  {userModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.version}) — {m.id.slice(0, 10)}...
                    </option>
                  ))}
                </select>
                <div className="text-[10px] font-mono text-muted-foreground">
                  Or paste a custom Model ID:
                </div>
                <input
                  type="text"
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value.trim())}
                  placeholder="0x..."
                  className="w-full px-4 py-2.5 bg-transparent border border-foreground/30 text-xs font-mono focus:outline-none focus:border-[#ea580c]"
                />
              </div>
            ) : (
              <input
                type="text"
                value={modelId}
                onChange={(e) => setModelId(e.target.value.trim())}
                placeholder="0x... (Bytes32 Model identifier)"
                required
                className="w-full px-4 py-3 bg-transparent border-2 border-foreground text-xs font-mono focus:outline-none focus:border-[#ea580c] transition-colors"
              />
            )}
          </div>

          {/* Inference Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
                INFERENCE_INPUT (RAW TEXT OR PAYLOAD) *
              </label>
              {inputHash && (
                <span className="text-[10px] font-mono text-muted-foreground truncate max-w-xs">
                  hash: {inputHash.slice(0, 14)}...
                </span>
              )}
            </div>
            <textarea
              rows={3}
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="e.g., Prompt, sensor reading, image embedding, or JSON input string"
              required
              className="w-full px-4 py-3 bg-transparent border-2 border-foreground text-xs font-mono focus:outline-none focus:border-[#ea580c] transition-colors resize-y"
            />
          </div>

          {/* Inference Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
                INFERENCE_OUTPUT (PREDICTION RESULT) *
              </label>
              {outputHash && (
                <span className="text-[10px] font-mono text-muted-foreground truncate max-w-xs">
                  hash: {outputHash.slice(0, 14)}...
                </span>
              )}
            </div>
            <textarea
              rows={3}
              value={outputData}
              onChange={(e) => setOutputData(e.target.value)}
              placeholder="e.g., Diagnostic classification, summary text, risk evaluation, or token logits"
              required
              className="w-full px-4 py-3 bg-transparent border-2 border-foreground text-xs font-mono focus:outline-none focus:border-[#ea580c] transition-colors resize-y"
            />
          </div>

          {/* Metadata URI */}
          <div className="space-y-2">
            <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
              OPTIONAL_METADATA_URI (IPFS / ARWEAVE)
            </label>
            <input
              type="text"
              value={metadataURI}
              onChange={(e) => setMetadataURI(e.target.value)}
              placeholder="ipfs://Qm... or https://..."
              className="w-full px-4 py-2.5 bg-transparent border border-foreground/40 text-xs font-mono focus:outline-none focus:border-[#ea580c]"
            />
          </div>

          {/* Hash Preview Matrix */}
          {(inputHash || outputHash) && (
            <div className="border border-dashed border-foreground/30 p-3 bg-foreground/5 space-y-1.5 text-[11px] font-mono">
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Computed Cryptographic Hashes</div>
              {inputHash && (
                <div className="truncate">
                  <span className="text-muted-foreground">INPUT_HASH: </span>
                  <span className="font-semibold">{inputHash}</span>
                </div>
              )}
              {outputHash && (
                <div className="truncate">
                  <span className="text-muted-foreground">OUTPUT_HASH: </span>
                  <span className="font-semibold">{outputHash}</span>
                </div>
              )}
            </div>
          )}

          {/* Submit Action */}
          <motion.button
            type="submit"
            disabled={!modelId || !inputData || !outputData || isLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full flex items-center justify-between bg-foreground text-background text-xs font-mono tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="flex items-center justify-center w-12 h-12 bg-[#ea580c] text-white">
              {isLoading ? (
                <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ShieldCheck size={18} strokeWidth={2} />
              )}
            </span>
            <span className="flex-1 py-3 text-center font-bold">
              {isLoading
                ? "SIGNING & SUBMITTING TO BASE..."
                : !isConnected
                ? "CONNECT WALLET FIRST"
                : "SIGN EIP-712 & RECORD ON-CHAIN"}
            </span>
            <span className="w-12 h-12 border-l border-background/20 flex items-center justify-center">
              <ArrowRight size={16} />
            </span>
          </motion.button>
        </form>

        {/* Confirmation Output Box */}
        {createdAttestation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.4, ease }}
            className="border-t-2 border-foreground p-5 bg-[#ea580c]/10 space-y-3"
          >
            <div className="flex items-center gap-2 text-green-500 font-mono text-xs uppercase font-bold tracking-wider">
              <Check size={16} strokeWidth={2.5} />
              ATTESTATION CONFIRMED ON BASE SEPOLIA
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="border border-foreground/20 p-2.5 bg-background">
                <span className="text-[10px] text-muted-foreground block uppercase">Attestation ID</span>
                <span className="font-semibold break-all">{createdAttestation.id}</span>
              </div>
              <div className="border border-foreground/20 p-2.5 bg-background">
                <span className="text-[10px] text-muted-foreground block uppercase">Transaction Hash</span>
                <a
                  href={`https://sepolia.basescan.org/tx/${createdAttestation.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#ea580c] hover:underline flex items-center gap-1 break-all"
                >
                  {createdAttestation.txHash.slice(0, 16)}...
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={`/verify?modelId=${createdAttestation.modelId}&input=${encodeURIComponent(
                  createdAttestation.inputHash
                )}&output=${encodeURIComponent(createdAttestation.outputHash)}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-xs font-mono uppercase tracking-wider hover:bg-[#ea580c] transition-colors"
              >
                Verify This Attestation Now
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Workflow Guidance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <div className="border border-foreground/20 p-4">
          <span className="text-[10px] font-mono tracking-widest text-[#ea580c] block mb-1">01 / TYPED DATA</span>
          <h3 className="text-xs font-mono font-bold uppercase mb-1">EIP-712 Structured Signatures</h3>
          <p className="text-[11px] font-mono text-muted-foreground">
            Signatures specify model ID, input hash, output hash, and a cryptographic deadline preventing replay attacks.
          </p>
        </div>
        <div className="border border-foreground/20 p-4">
          <span className="text-[10px] font-mono tracking-widest text-[#ea580c] block mb-1">02 / IMMUTABILITY</span>
          <h3 className="text-xs font-mono font-bold uppercase mb-1">Base Sepolia L2 Record</h3>
          <p className="text-[11px] font-mono text-muted-foreground">
            Submissions are verified against the registered model owner and recorded with block timestamp proofs.
          </p>
        </div>
        <div className="border border-foreground/20 p-4">
          <span className="text-[10px] font-mono tracking-widest text-[#ea580c] block mb-1">03 / PERMISSIONLESS</span>
          <h3 className="text-xs font-mono font-bold uppercase mb-1">Instant Public Audits</h3>
          <p className="text-[11px] font-mono text-muted-foreground">
            Anyone worldwide can verify whether an output genuinely came from that model version in under 500ms.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AttestPage() {
  return (
    <div className="min-h-screen dot-grid-bg">
      <Navbar />
      <main>
        <Suspense
          fallback={
            <div className="p-12 text-center font-mono text-xs text-muted-foreground">
              Loading Attestation Studio...
            </div>
          }
        >
          <AttestContent />
        </Suspense>
      </main>
    </div>
  )
}
