"use client";
import "@rainbow-me/rainbowkit/styles.css";

import React, { useEffect } from "react";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider, useAccount, useSwitchChain } from "wagmi";
import { base } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";

import { RainbowKitSiweNextAuthProvider } from "@rainbow-me/rainbowkit-siwe-next-auth";

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

const NetworkWatcher = () => {
  const { chainId, isConnected } = useAccount();
  const { switchChain, status } = useSwitchChain();

  useEffect(() => {
    if (isConnected && chainId && chainId !== base.id && status !== "pending") {
      console.log(
        `Wrong network (${chainId}). Switching to Base (${base.id})...`,
      );
      switchChain(
        { chainId: base.id },
        {
          onError: (err) => console.error("Switch network failed:", err),
          onSuccess: () => console.log("Switched to Base successfully"),
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
        <SessionProvider>
          {/* <RainbowKitSiweNextAuthProvider
            getSiweMessageOptions={getSiweMessageOptions}
          > */}
          <RainbowKitProvider coolMode initialChain={base}>
            <NetworkWatcher />
            {children}
          </RainbowKitProvider>
          {/* </RainbowKitSiweNextAuthProvider> */}
        </SessionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Rainbow;
