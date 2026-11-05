"use client";

import * as React from "react";
import RainbowConnectButton from "./rainbow-connect-button";

const emptySubscribe = () => () => {};
function useMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function ConnectWalletButton() {
  const mounted = useMounted();

  // SSR guard — render placeholder on server until hydrated
  if (!mounted) {
    return (
      <div className="h-8 w-[140px] border border-foreground/20 bg-foreground/5" />
    );
  }

  return <RainbowConnectButton />;
}
