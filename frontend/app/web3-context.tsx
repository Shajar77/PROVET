"use client";

import * as React from "react";

interface Web3ContextType {
  isWeb3Enabled: boolean;
  enableWeb3: () => void;
}

const Web3Context = React.createContext<Web3ContextType | null>(null);

export function Web3ContextProvider({ children, enableWeb3 }: { children: React.ReactNode; enableWeb3: () => void }) {
  const [isWeb3Enabled, setIsWeb3Enabled] = React.useState(false);

  const handleEnableWeb3 = React.useCallback(() => {
    setIsWeb3Enabled(true);
    enableWeb3();
  }, [enableWeb3]);

  return (
    <Web3Context.Provider value={{ isWeb3Enabled, enableWeb3: handleEnableWeb3 }}>
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
