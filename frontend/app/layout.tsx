import type { Metadata } from "next";

import "./globals.css";
import Navbar from "../src/components/Navbar";
import WalletProvider from "@/src/components/providers/WalletProvider";

export const metadata: Metadata = {
  title: "Job Escrow | Web3 Freelance Protocol",
  description:
    "Secure freelance contracts with trustless escrow, milestone payouts, and transparent workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <WalletProvider>
          <Navbar />
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
