"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { Web3ContextProvider } from "./web3-context";

// Lazy load heavy Web3 libraries ONLY when user clicks Connect Wallet
const Web3Provider = React.lazy(() => import("./web3-provider"));

// Non-Web3 fallback - no heavy libraries loaded
function NonWeb3Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            border: "2px solid hsl(var(--foreground))",
            fontFamily: "var(--font-mono), monospace",
            fontSize: "12px",
            borderRadius: "0",
          },
          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "hsl(var(--background))",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "hsl(var(--background))",
            },
          },
        }}
      />
    </ThemeProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  const [web3Enabled, setWeb3Enabled] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Function to enable Web3 (called by ConnectWalletButton via context)
  const enableWeb3 = React.useCallback(() => {
    setWeb3Enabled(true);
  }, []);

  // Render without Web3 providers during SSR and initial load
  if (!mounted) {
    return (
      <Web3ContextProvider enableWeb3={enableWeb3}>
        <NonWeb3Providers>
          {children}
        </NonWeb3Providers>
      </Web3ContextProvider>
    );
  }

  // Only load Web3 when user clicks Connect Wallet
  if (!web3Enabled) {
    return (
      <Web3ContextProvider enableWeb3={enableWeb3}>
        <NonWeb3Providers>
          {children}
        </NonWeb3Providers>
      </Web3ContextProvider>
    );
  }

  // Web3 enabled - lazy load the providers
  return (
    <Web3ContextProvider enableWeb3={enableWeb3}>
      <React.Suspense fallback={
        <NonWeb3Providers>
          {children}
        </NonWeb3Providers>
      }>
        <Web3Provider>
          {children}
        </Web3Provider>
      </React.Suspense>
    </Web3ContextProvider>
  );
}
