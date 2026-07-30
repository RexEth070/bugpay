import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BugPay | Zero-Knowledge & TEE Anonymous Bug Bounty Protocol",
  description: "BugPay bridges Safe Multisig Treasuries with iExec Nox TEE Enclaves. Submit zero-day vulnerabilities and DAO exploits confidentially with automated Sepolia bounty payouts.",
  keywords: ["iExec Nox", "TEE", "Safe Multisig", "DoraHacks", "Ethereum Sepolia", "Bug Bounty", "Zero-Knowledge", "Privacy"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
