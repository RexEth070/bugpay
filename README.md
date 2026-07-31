# 🛡️ BugPay — Anonymous TEE Bug Bounty Protocol

[![Live Demo](https://img.shields.io/badge/Live%20Demo-https%3A%2F%2Fbugpay.vercel.app-FF2E55?style=for-the-badge&logo=vercel)](https://bugpay.vercel.app)
[![Demo Video](https://img.shields.io/badge/Demo%20Video-X%2F%20Twitter-1DA1F2?style=for-the-badge&logo=x)](https://x.com/rexkillz_/status/2083143260453654775?s=20)
[![Ethereum Sepolia](https://img.shields.io/badge/Network-Ethereum%20Sepolia-blue?style=for-the-badge&logo=ethereum)](https://sepolia.etherscan.io)
[![iExec Nox TEE](https://img.shields.io/badge/TEE%20Enclave-iExec%20Nox%20SGX-green?style=for-the-badge)](https://docs.iex.ec)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**BugPay** is an anonymous, confidential bug bounty platform built for Web3 DAOs and smart contract protocols. Powered by **iExec Nox TEE (Trusted Execution Environment) Hardware Enclaves** and **EIP-191 Safe Multisig Governance** on **Ethereum Sepolia Testnet**.

🔗 **Live Production URL**: [https://bugpay.vercel.app](https://bugpay.vercel.app)  
🎥 **Demo Video (X/Twitter)**: [https://x.com/rexkillz_/status/2083143260453654775?s=20](https://x.com/rexkillz_/status/2083143260453654775?s=20)  
🌐 **GitHub Repository**: [https://github.com/RexEth070/bugpay](https://github.com/RexEth070/bugpay)

---

## 💡 Problem & Solution

### The Problem
Traditional Web3 bug bounty programs suffer from critical flaws:
- **Zero-Day Code Leakage**: Submitting un-verified bug reports exposes zero-day vulnerabilities to public servers and rogue protocol admins.
- **Doxxing & Identity Risks**: Ethical hackers are forced to complete intrusive KYC or reveal real-world identities, risking personal safety or legal retribution.
- **Manual Escrow Delays**: DAOs delay payouts for weeks while manually reviewing exploit code, creating distrust between researchers and security teams.

### The BugPay Solution
BugPay introduces **Confidential Off-Chain Hardware Verification**:
- **Zero-Knowledge Privacy**: Exploit scripts are encrypted client-side using **2048-bit RSA keys** before leaving the browser.
- **Hardware-Enclosed Execution**: Exploit payloads execute inside an **Intel SGX Hardware Enclave (iExec Nox TEE)** off-chain against a forked Sepolia state.
- **ECDSA Proof Signatures**: The enclave proves the bug is real without leaking a single line of zero-day code on-chain.
- **Instant Stealth Payouts**: Escrow funds in `BugPayVault.sol` release automatically to un-linked stealth burner wallets.

---

## 🛡️ 5-Step iExec Nox TEE Execution Pipeline

```
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│  1. Client Encryption   │ ──> │   2. Nox TEE Dispatch   │ ──> │ 3. Sepolia State Fork  │
│  2048-bit RSA Public Key│     │   Intel SGX Hardware RAM│     │  Off-chain RPC Sandbox  │
└─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘
                                                                             │
┌─────────────────────────┐     ┌─────────────────────────┐                  ▼
│   5. Stealth Payout     │ <── │   4. ECDSA Proof Signature                  │
│   Escrow Release to ETH │     │   Hardware Signed Receipt                 │
└─────────────────────────┘     └─────────────────────────┘ <────────────────┘
```

1. **Client-Side RSA-2048 Encryption**: The whistleblower's browser encrypts the exploit script and remediation fix using Nox TEE's public key.
2. **Nox TEE Dispatch**: Transmits the encrypted payload into isolated Intel SGX RAM hardware. Memory is hardware-encrypted at the CPU memory controller level.
3. **Sepolia State Forking**: Nox decrypts the payload inside the enclave and forks the live Sepolia testnet state in RAM to simulate and verify the exploit.
4. **Proof Signature Generation**: Nox emits an un-forgeable **ECDSA Proof Signature** (`0x...`) verifying the bug without exposing zero-day code.
5. **Stealth Escrow Release**: `BugPayVault.sol` verifies the proof signature and transfers the ETH bounty directly to the researcher's un-linked stealth burner wallet.

---

## 🏛️ Application Portals & Features

### 🏦 1. DAO Safe Multisig Vault
- **Treasury Escrow Management**: DAO admins pre-fund bounty pools (`0.20 ETH` to `5.00 ETH`) with custom target contract requirements and expiry dates.
- **Mandatory EIP-191 Web3 Signatures**: Deploys bounty pools on Sepolia via authenticated MetaMask transaction prompts.
- **Encrypted Patch Inbox**: Decrypts re-encrypted remediation code fixes delivered straight from Nox TEE hardware.
- **Access Control Gate**: Locks vault contents when wallet is disconnected to protect treasury governance.

### 🕵️‍♂️ 2. Whistleblower Confidential Enclave
- **Zero Identity Exposure**: Researchers submit reports without connecting personal wallets or performing KYC.
- **Dual Payload Submission**: Accepts both the exploit proof-of-concept payload and the refactored Solidity remediation patch.
- **Stealth Burner Payout**: Payouts deliver directly to fresh, un-traceable stealth burner addresses on Sepolia.

### 📜 3. TEE Audit Ledger
- **Immutable Proof History**: Displays verified settlement records backed by iExec Nox TEE hardware signatures.
- **Copyable Hardware Proofs**: Anyone can verify off-chain hardware signatures (`0x7c9b8f2a...`) on Sepolia Etherscan.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | Next.js 16 (React 19, App Router) |
| **Language** | TypeScript |
| **Styling** | Vanilla CSS + Design Tokens (Playfair Display + Georgia + JetBrains Mono) |
| **Blockchain Network** | Ethereum Sepolia Testnet (Chain ID `11155111`) |
| **TEE Enclave Engine** | iExec Nox TEE Hardware Enclave (Intel SGX) |
| **Cryptography** | RSA-2048 Client Encryption, ECDSA Enclave Signatures, EIP-191 Web3 |
| **Deployment** | Vercel Serverless Production Infrastructure |

---

## 📜 Smart Contract Architecture

### `BugPayVault.sol`
Deployed on **Ethereum Sepolia Testnet**:  
📍 **Contract Address**: `0x3A2b801F480fEa11C1e028b1227092182046E4f2`

- `createBountyPool(...)`: Locks DAO ETH treasury funds in escrow for a target contract.
- `claimCategoryBounty(...)`: Validates Nox TEE proof signatures and releases funds to stealth burner addresses.
- `fundVault(...)`: Allows DAO treasury pre-funding.

---

## 🚀 Local Development Guide

### Prerequisites
- Node.js 18.0+ or Node.js 20+
- npm or yarn
- MetaMask Browser Extension

### 1. Clone & Install
```bash
git clone https://github.com/RexEth070/bugpay.git
cd bugpay
npm install
```

### 2. Run Local Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm run start
```

---

## 🏆 Hackathon Details

- **Hackathon**: DoraHacks WTF Hackathon  
- **Track**: Confidential Compute & Privacy Systems / Web3 Infrastructure  
- **Live Demo**: [https://bugpay.vercel.app](https://bugpay.vercel.app)  
- **Demo Video**: [https://x.com/rexkillz_/status/2083143260453654775?s=20](https://x.com/rexkillz_/status/2083143260453654775?s=20)  
- **GitHub Repo**: [https://github.com/RexEth070/bugpay](https://github.com/RexEth070/bugpay)  

---

© 2026 **BugPay Protocol** — Powered by iExec Nox TEE & Safe Multisig on Ethereum Sepolia.
