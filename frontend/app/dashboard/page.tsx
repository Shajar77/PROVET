"use client"

import { Navbar } from "@/components/navbar"
import { motion } from "framer-motion"
import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { useAccount } from "wagmi"
import { keccak256, toBytes } from "viem"
import { createProvet } from "@/lib/sdk"
import { useTransaction } from "@/hooks/use-transaction"
import { useWeb3Context } from "@/app/web3-context"
import toast from "react-hot-toast"

const ease = [0.22, 1, 0.36, 1] as const

function RegisterForm() {
  const { isWeb3Enabled } = useWeb3Context()

  // Only use wagmi hooks if web3 is enabled
  // When web3 is not enabled, wagmi provider isn't mounted
  let isConnected = false
  let address: string | undefined

  try {
    if (isWeb3Enabled) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const account = useAccount()
      isConnected = account.isConnected
      address = account.address
    }
  } catch {
    // wagmi hooks fail if provider isn't available
  }

  const [formData, setFormData] = useState({
    name: "",
    version: "",
    metadataURI: "ipfs://",
  })
  const [txHash, setTxHash] = useState<string | null>(null)

  const { isLoading, execute } = useTransaction({
    successMessage: "Model registered successfully on-chain!",
    errorMessage: "Failed to register model",
    onSuccess: (hash) => {
      setTxHash(hash)
      setFormData({ name: "", version: "", metadataURI: "ipfs://" })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.version) return

    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    const sdk = createProvet({ chain: "baseSepolia" })
    const modelHash = keccak256(
      toBytes(`${formData.name}:${formData.version}:${Date.now()}`)
    )

    await execute(async () => {
      const result = await sdk.registerModel({
        name: formData.name,
        version: formData.version,
        modelHash,
        metadataURI: formData.metadataURI,
      })
      return result
    })
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease }}
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="border-2 border-foreground">
          {/* Form header */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b-2 border-foreground bg-foreground text-background">
            <span className="text-[10px] tracking-[0.2em] uppercase font-mono">
              MODEL_REGISTRATION_FORM
            </span>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase">
                  <span className="h-1.5 w-1.5 bg-green-400 rounded-full" />
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "CONNECTED"}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-background/50">
                  <span className="h-1.5 w-1.5 bg-red-400 rounded-full" />
                  NOT CONNECTED
                </span>
              )}
            </div>
          </div>

          {/* Form body */}
          <div className="p-4 sm:p-6 space-y-6">
            {/* Model Name */}
            <div className="space-y-2">
              <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono block">
                MODEL_NAME *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Fraud Detection Model"
                required
                className="w-full px-4 py-3 bg-transparent border-2 border-foreground text-sm font-mono focus:outline-none focus:border-[#ea580c] transition-colors"
              />
            </div>

            {/* Version */}
            <div className="space-y-2">
              <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono block">
                VERSION *
              </label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="e.g., v1.0.0"
                required
                className="w-full px-4 py-3 bg-transparent border-2 border-foreground text-sm font-mono focus:outline-none focus:border-[#ea580c] transition-colors"
              />
            </div>

            {/* Metadata URI */}
            <div className="space-y-2">
              <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono block">
                METADATA_URI (IPFS)
              </label>
              <input
                type="text"
                value={formData.metadataURI}
                onChange={(e) => setFormData({ ...formData, metadataURI: e.target.value })}
                placeholder="ipfs://Qm..."
                className="w-full px-4 py-3 bg-transparent border-2 border-foreground text-sm font-mono focus:outline-none focus:border-[#ea580c] transition-colors"
              />
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={!formData.name || !formData.version || isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-0 bg-foreground text-background text-sm font-mono tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center w-10 h-10 bg-[#ea580c]">
                {isLoading ? (
                  <span className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                ) : (
                  <ArrowRight size={16} strokeWidth={2} className="text-background" />
                )}
              </span>
              <span className="flex-1 py-2.5 text-center">
                {isLoading ? "PROCESSING..." : !isConnected ? "CONNECT WALLET FIRST" : "REGISTER MODEL"}
              </span>
            </motion.button>
          </div>

          {/* Transaction result */}
          {txHash && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease }}
              className="border-t-2 border-foreground p-4 bg-[#ea580c]/10"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                <span className="text-[10px] tracking-[0.2em] uppercase text-green-500 font-mono">
                  TRANSACTION CONFIRMED
                </span>
              </div>
              <div className="text-xs font-mono break-all">
                <span className="text-muted-foreground">TX_HASH: </span>
                <span className="font-semibold">{txHash}</span>
              </div>
            </motion.div>
          )}
        </form>
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
            REQUIREMENTS
          </span>
          <ul className="text-xs font-mono text-muted-foreground space-y-1 list-disc list-inside">
            <li>Connect your wallet to register models</li>
            <li>Model name and version are required</li>
            <li>A keccak256 hash of your model data is computed on submission</li>
            <li>Metadata URI should point to IPFS for permanent storage</li>
            <li>Gas fees apply for on-chain registration (~0.001 ETH)</li>
          </ul>
        </div>
      </motion.div>
    </>
  )
}

export default function DashboardPage() {
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
            {"// SECTION: OWNER_DASHBOARD"}
          </span>
          <div className="flex-1 border-t border-border" />
          <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
            009
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
            REGISTER MODEL
          </h1>
          <p className="text-xs lg:text-sm text-muted-foreground max-w-lg font-mono">
            Register a new AI model on the blockchain. Your model hash is computed automatically from your inputs.
          </p>
        </motion.div>

        <RegisterForm />
      </main>
    </div>
  )
}
