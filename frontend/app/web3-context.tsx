"use client";

import * as React from "react";

interface Web3ContextType {
  /** True once the user has clicked Connect Wallet (starts lazy loading Web3Provider) */
  isWeb3Enabled: boolean;
  /** True only after WagmiProvider + RainbowKitProvider have fully mounted */
  isWeb3Ready: boolean;
  enableWeb3: () => void;
  setWeb3Ready: () => void;
}

const Web3Context = React.createContext<Web3ContextType | null>(null);

export function Web3ContextProvider({
  children,
  enableWeb3,
}: {
  children: React.ReactNode;
  enableWeb3: () => void;
}) {
  const [isWeb3Enabled, setIsWeb3Enabled] = React.useState(false);
  const [isWeb3Ready, setIsWeb3ReadyState] = React.useState(false);

  const handleEnableWeb3 = React.useCallback(() => {
    setIsWeb3Enabled(true);
    enableWeb3();
  }, [enableWeb3]);

  const setWeb3Ready = React.useCallback(() => {
    setIsWeb3ReadyState(true);
  }, []);

  return (
    <Web3Context.Provider
      value={{ isWeb3Enabled, isWeb3Ready, enableWeb3: handleEnableWeb3, setWeb3Ready }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3Context() {
  const context = React.useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3Context must be used within Web3ContextProvider");
  }
  return context;
}
