"use client";
import "@rainbow-me/rainbowkit/styles.css";

import React, { useEffect } from "react";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider, useAccount, useSwitchChain } from "wagmi";
import { base } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import {
  RainbowKitSiweNextAuthProvider,
  GetSiweMessageOptions,
} from "@rainbow-me/rainbowkit-siwe-next-auth";

const getSiweMessageOptions = () => ({
  statement: "Sign in to Nifty Tales",
});

const config = getDefaultConfig({
  appName: "Nifty Tales",
  projectId: "5d10af3027c340310f3a3da64cbcedac",
  chains: [base],
  ssr: true,
});

const queryClient = new QueryClient();

// --- IMPROVED NETWORK WATCHER ---
const NetworkWatcher = () => {
  const { chainId, isConnected } = useAccount();
  // Get status and error to debug and prevent loops
  const { switchChain, status, error } = useSwitchChain();

  useEffect(() => {
    // 1. Check if we are connected
    // 2. Check if the current chainId is defined and is NOT Base (8453)
    // 3. Ensure we aren't already trying to switch (status !== 'pending')
    if (isConnected && chainId && chainId !== base.id && status !== "pending") {
      console.log(
        `Wrong network (${chainId}). Switching to Base (${base.id})...`,
      );

      switchChain(
        { chainId: base.id },
        {
          onError: (err) => {
            console.error("Failed to switch network:", err);
          },
          onSuccess: () => {
            console.log("Successfully switched to Base");
          },
        },
      );
    }
  }, [chainId, isConnected, switchChain, status]);

  return null;
};

const Rainbow = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitSiweNextAuthProvider
          getSiweMessageOptions={getSiweMessageOptions}
        >
          {/* initialChain={base} sets the default expectation, 
            but NetworkWatcher enforces it dynamically 
          */}
          <RainbowKitProvider coolMode initialChain={base}>
            <NetworkWatcher />
            {children}
          </RainbowKitProvider>
        </RainbowKitSiweNextAuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Rainbow;
