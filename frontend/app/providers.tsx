"use client";

import * as React from "react";
import Web3Provider from "./web3-provider";
import { Web3ContextProvider } from "./web3-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Web3ContextProvider>
      <Web3Provider>{children}</Web3Provider>
    </Web3ContextProvider>
  );
}
