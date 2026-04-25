"use client";

import * as React from "react";
import { useWeb3Context } from "../app/web3-context";

const BTN =
  "h-8 px-3 sm:px-4 text-[10px] sm:text-[11px] font-mono font-semibold tracking-[0.1em] uppercase border border-orange-600 bg-orange-600 text-white hover:bg-orange-700 hover:border-orange-700 transition-all duration-200 whitespace-nowrap cursor-pointer";

// Inner component that uses RainbowKit — only rendered after Web3 is enabled
function RainbowConnectButton() {
  // Inline require so this module is never imported at the top-level
  // before RainbowKitProvider is mounted
  const { ConnectButton } = require("@rainbow-me/rainbowkit");

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted: rkMounted,
      }: {
        account: any;
        chain: any;
        openAccountModal: () => void;
        openChainModal: () => void;
        openConnectModal: () => void;
        mounted: boolean;
      }) => {
        const ready = rkMounted;
        const connected = ready && account && chain;

        if (!ready) {
          return (
            <div className="h-8 w-[140px] border border-foreground/20 bg-foreground/5 animate-pulse" />
          );
        }

        if (!connected) {
          return (
            <button onClick={openConnectModal} className={BTN}>
              Connect Wallet
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              onClick={openChainModal}
              className="h-8 px-3 sm:px-4 text-[10px] sm:text-[11px] font-mono font-semibold tracking-[0.1em] uppercase border border-red-600 bg-red-600 text-white hover:bg-red-700 hover:border-red-700 transition-all duration-200 whitespace-nowrap cursor-pointer"
            >
              Wrong Network
            </button>
          );
        }

        return (
          <div className="flex items-center gap-1">
            {/* Chain button */}
            <button
              onClick={openChainModal}
              className="h-8 px-2 border border-orange-600 bg-orange-600 text-white hover:bg-orange-700 hover:border-orange-700 transition-all duration-200 cursor-pointer flex items-center"
              title={chain.name}
            >
              {chain.hasIcon && chain.iconUrl ? (
                <img
                  src={chain.iconUrl}
                  alt={chain.name}
                  className="w-4 h-4"
                />
              ) : (
                <span className="text-[10px] font-mono font-semibold">
                  {chain.name?.slice(0, 3).toUpperCase()}
                </span>
              )}
            </button>

            {/* Account button */}
            <button onClick={openAccountModal} className={BTN}>
              {account.displayName}
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

export function ConnectWalletButton() {
  const [mounted, setMounted] = React.useState(false);
  const { isWeb3Enabled, isWeb3Ready, enableWeb3 } = useWeb3Context();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // SSR guard — render nothing on server
  if (!mounted) {
    return (
      <div className="h-8 w-full max-w-[140px] border border-foreground/20 bg-foreground/5" />
    );
  }

  // Web3 not yet enabled — show plain button to trigger lazy load
  if (!isWeb3Enabled) {
    return (
      <button onClick={enableWeb3} className={BTN}>
        Connect Wallet
      </button>
    );
  }

  // Web3 enabled but WagmiProvider not yet fully mounted — show skeleton
  if (!isWeb3Ready) {
    return (
      <div className="h-8 w-[140px] border border-foreground/20 bg-foreground/5 animate-pulse" />
    );
  }

  // WagmiProvider is confirmed mounted — safe to render ConnectButton.Custom
  return (
    <React.Suspense
      fallback={
        <div className="h-8 w-[140px] border border-foreground/20 bg-foreground/5 animate-pulse" />
      }
    >
      <RainbowConnectButton />
    </React.Suspense>
  );
}
