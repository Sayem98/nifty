"use client";
import "@rainbow-me/rainbowkit/styles.css";
// import { AvatarComponent } from "@rainbow-me/rainbowkit"; // Unused in this snippet

import React, { useEffect } from "react";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider, useAccount, useSwitchChain } from "wagmi";
import { base } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import {
  RainbowKitSiweNextAuthProvider,
  GetSiweMessageOptions,
} from "@rainbow-me/rainbowkit-siwe-next-auth";

const getSiweMessageOptions: GetSiweMessageOptions = () => ({
  statement: "Sign in to Nifty Tales",
});

const config = getDefaultConfig({
  appName: "Nifty Tales", // Updated to match your SIWE statement
  projectId: "5d10af3027c340310f3a3da64cbcedac",
  chains: [base], // Only allowing Base
  ssr: true,
});

const queryClient = new QueryClient();

// --- 1. Create a component to enforce the network ---
const NetworkWatcher = () => {
  const { chainId, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    // If connected, and the current chain is NOT Base (8453)
    if (isConnected && chainId && chainId !== base.id) {
      console.log("Wrong network detected. Attempting to switch to Base...");
      switchChain({ chainId: base.id });
    }
  }, [chainId, isConnected, switchChain]);

  return null; // This component renders nothing
};

const Rainbow = ({ children }: any) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitSiweNextAuthProvider
          getSiweMessageOptions={getSiweMessageOptions}
        >
          {/* 2. Set initialChain to base. 
             This ensures RainbowKit prioritizes Base when connecting.
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
