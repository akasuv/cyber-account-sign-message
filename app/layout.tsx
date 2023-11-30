"use client";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WagmiConfig, createConfig, configureChains, mainnet } from "wagmi";
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
import {
  CyberWalletConnector,
  isChainUnsupported,
} from "@cyberlab/cyber-app-sdk";
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
  // @ts-ignore
  chains: chainlist,
  options: {
    name: "Sign Message Demo", // required
    icon: "https://wallet.cyber.co/_next/image?url=%2Fassets%2Flogos%2Flogo.png&w=64&q=100", // required
    appId: "0eb3b939-d21d-4759-8498-e91baeda88b2", // required
  },
});

const { chains, publicClient, webSocketPublicClient } = configureChains(
  chainlist,
  [publicProvider()]
);

const config = createConfig({
  //@ts-ignore
  connectors: [connector],
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
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
        <WagmiConfig config={config}>{children}</WagmiConfig>
      </body>
    </html>
  );
}
