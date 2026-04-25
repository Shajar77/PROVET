"use client";

import * as React from "react";
import "@rainbow-me/rainbowkit/styles.css"
import {
  RainbowKitProvider,
  getDefaultConfig,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider, http } from "wagmi";
import { base, baseSepolia, hardhat } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

const chains = [baseSepolia, base, hardhat] as const;

const transports = {
  [baseSepolia.id]: http("https://sepolia.base.org"),
  [base.id]: http("https://mainnet.base.org"),
  [hardhat.id]: http("http://127.0.0.1:8545"),
} as const;

const rainbowTheme = (() => {
  const theme = lightTheme({
    accentColor: "#ea580c",
    accentColorForeground: "#ffffff",
    borderRadius: "none",
  });
  return {
    ...theme,
    fonts: {
      ...theme.fonts,
      body: "var(--font-mono), monospace",
    },
  };
})();

// Reown Project ID for WalletConnect integration
const PROJECT_ID = "14fa06d18e2d81e027a24a4edbccdfc1";

const config = getDefaultConfig({
  appName: "ROVET",
  projectId: PROJECT_ID,
  chains,
  transports,
  ssr: false,
});

export default function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          appInfo={{
            appName: "ROVET",
            learnMoreUrl: "https://docs.rovet.ai",
          }}
          theme={rainbowTheme}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
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
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
