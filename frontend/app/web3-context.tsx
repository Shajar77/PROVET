"use client";

import * as React from "react";

interface Web3ContextType {
  isWeb3Enabled: boolean;
  isWeb3Ready: boolean;
  enableWeb3: () => void;
  setWeb3Ready: () => void;
  setOpenConnectModal: (fn: () => void) => void;
}

const Web3Context = React.createContext<Web3ContextType | null>(null);

export function Web3ContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const openConnectModalRef = React.useRef<(() => void) | null>(null);

  const setOpenConnectModal = React.useCallback((fn: () => void) => {
    openConnectModalRef.current = fn;
  }, []);

  const handleEnableWeb3 = React.useCallback(() => {
    if (openConnectModalRef.current) {
      openConnectModalRef.current();
    }
  }, []);

  const value = React.useMemo(
    () => ({
      isWeb3Enabled: true,
      isWeb3Ready: true,
      enableWeb3: handleEnableWeb3,
      setWeb3Ready: () => {},
      setOpenConnectModal,
    }),
    [handleEnableWeb3, setOpenConnectModal]
  );

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

const fallbackContext: Web3ContextType = {
  isWeb3Enabled: true,
  isWeb3Ready: true,
  enableWeb3: () => {},
  setWeb3Ready: () => {},
  setOpenConnectModal: () => {},
};

export function useWeb3Context() {
  const context = React.useContext(Web3Context);
  return context || fallbackContext;
}
