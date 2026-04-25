"use client";

import * as React from "react";
import { useWeb3Context } from "../app/web3-context";
import dynamic from "next/dynamic";

// Dynamically import ConnectButton - only loads when this component renders
const ConnectButton = dynamic(
  () => import("@rainbow-me/rainbowkit").then((mod) => mod.ConnectButton),
  { ssr: false }
);

export function ConnectWalletButton() {
  const [mounted, setMounted] = React.useState(false);
  const { isWeb3Enabled, enableWeb3 } = useWeb3Context();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-8 w-full max-w-[140px] border border-foreground/20 bg-foreground/5" />
    );
  }

  // If Web3 is not enabled, show styled button to enable it
  if (!isWeb3Enabled) {
    return (
      <button
        onClick={enableWeb3}
        className="h-8 px-3 sm:px-4 text-[10px] sm:text-[11px] font-mono font-semibold tracking-[0.1em] uppercase border border-orange-600 bg-orange-600 text-white hover:bg-orange-700 hover:border-orange-700 transition-all duration-200 whitespace-nowrap"
      >
        Connect Wallet
      </button>
    );
  }

  // Web3 is enabled - show RainbowKit ConnectButton with custom styling wrapper
  return (
    <React.Suspense fallback={
      <div className="h-8 w-full max-w-[140px] border border-foreground/20 bg-foreground/5 animate-pulse" />
    }>
      <div className="rk-button-wrapper">
        <ConnectButton
          accountStatus="address"
          chainStatus="icon"
          showBalance={false}
        />
      </div>
      <style jsx>{`
        .rk-button-wrapper :global(button) {
          height: 2rem !important;
          padding: 0 1rem !important;
          font-size: 11px !important;
          font-family: ui-monospace, monospace !important;
          font-weight: 600 !important;
          letter-spacing: 0.1em !important;
          text-transform: uppercase !important;
          border: 1px solid #ea580c !important;
          background: #ea580c !important;
          color: white !important;
          border-radius: 0 !important;
          transition: all 0.2s !important;
        }
        .rk-button-wrapper :global(button:hover) {
          background: #c2410c !important;
          border-color: #c2410c !important;
        }
        .rk-button-wrapper :global([data-testid="account-button"]),
        .rk-button-wrapper :global([data-testid="connect-button"]) {
          height: 2rem !important;
          min-height: 2rem !important;
          padding: 0 1rem !important;
        }
      `}</style>
    </React.Suspense>
  );
}
