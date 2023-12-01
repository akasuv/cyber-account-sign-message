"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { WagmiConfig, createConfig, configureChains, mainnet } from "wagmi";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import {
  optimismGoerli,
  baseGoerli,
  polygonMumbai,
  manta,
  scrollTestnet,
  scrollSepolia,
  mantle,
} from "viem/chains";
import { publicProvider } from "wagmi/providers/public";
import "@rainbow-me/rainbowkit/styles.css";
import {
  connectorsForWallets,
  RainbowKitProvider,
  Chain,
  Wallet,
} from "@rainbow-me/rainbowkit";
export interface CyberWalletOptions {
  projectId: string;
  chains: Chain[];
}

import { CyberWalletConnector } from "@cyberlab/cyber-app-sdk";

const chainlist = [
  mantle,
  manta,
  optimismGoerli,
  baseGoerli,
  polygonMumbai,
  scrollTestnet,
  scrollSepolia,
  mainnet,
];

const connector = new CyberWalletConnector({
  chains: chainlist,
  options: {
    name: "Sign Message Demo", // required
    icon: "https://wallet.cyber.co/_next/image?url=%2Fassets%2Flogos%2Flogo.png&w=64&q=100", // required
    appId: "0eb3b939-d21d-4759-8498-e91baeda88b2", // required
  },
});

export const cyberWallet = (): Wallet => ({
  id: "cyber-wallet",
  name: "CyberWallet",
  iconUrl:
    "https://wallet-sandbox.cyber.co/_next/image?url=%2Fassets%2Flogos%2Flogo.png&w=64&q=100",
  iconBackground: "#fff",
  createConnector: () => {
    return {
      connector,
    };
  },
});

const { chains, publicClient } = configureChains(chainlist, [publicProvider()]);

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [metaMaskWallet({ chains, projectId: "" }), cyberWallet()],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
        </WagmiConfig>
      </body>
    </html>
  );
}
