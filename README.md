# 🛡️ BugPay — Anonymous TEE Bug Bounty Protocol

[![Live Demo](https://img.shields.io/badge/Live%20Demo-https%3A%2F%2Fbugpay.vercel.app-FF2E55?style=for-the-badge&logo=vercel)](https://bugpay.vercel.app)
[![Ethereum Sepolia](https://img.shields.io/badge/Network-Ethereum%20Sepolia-blue?style=for-the-badge&logo=ethereum)](https://sepolia.etherscan.io)
[![iExec Nox TEE](https://img.shields.io/badge/TEE%20Enclave-iExec%20Nox-green?style=for-the-badge)](https://docs.iex.ec)

🔗 **Live Production URL**: [https://bugpay.vercel.app](https://bugpay.vercel.app)

**BugPay** is an anonymous, confidential bug bounty platform built for Web3 DAOs and smart contract protocols. Powered by **iExec Nox TEE (Trusted Execution Environment) Hardware Enclaves** and **EIP-191 Safe Multisig Governance** on **Ethereum Sepolia Testnet**.

---

## 🌟 Key Features

- **🔐 100% Confidential Exploit Verification**: Whistleblowers submit exploits encrypted client-side with 2048-bit RSA keys.
- **🛡️ Hardware SGX Enclave Execution**: iExec Nox TEE executes exploit scripts off-chain inside hardware-isolated Intel SGX RAM against forked Sepolia blockchain state.
- **✍️ ECDSA Proof Signatures**: The TEE enclave emits cryptographic proof signatures (`0x...`) verifying vulnerabilities without leaking zero-day exploit code on-chain.
- **💸 Anonymous Payouts to Stealth Burner Wallets**: Escrow funds in `BugPayVault.sol` release automatically to un-linked stealth burner addresses with zero identity exposure.
- **🏦 DAO Safe Multisig Governance**: DAO admins manage treasury escrows, pre-fund bounty pools, and decrypt verified remediation patches delivered straight to their inbox.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (React 19, TypeScript)
- **Blockchain**: Ethereum Sepolia Testnet (Chain ID `11155111`)
- **TEE Hardware Enclaves**: iExec Nox TEE Enclave Execution Pipeline
- **Cryptography**: RSA-2048 Client Encryption, ECDSA Proof Signatures, EIP-191 Web3 Signatures
- **Styling**: Modern Obsidian Cyber Aesthetics (Playfair Display + Georgia + JetBrains Mono)

---

## 🚀 Getting Started Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/RexEth070/bugpay.git
   cd bugpay
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [https://bugpay.vercel.app/) in your browser.

4. **Build production bundle**:
   ```bash
   npm run build
   npm run start
   ```

---

## 📜 Smart Contract Architecture

- **`BugPayVault.sol`**: DAO Safe Multisig Escrow Manager deployed on Ethereum Sepolia Testnet (`0x3A2b801F480fEa11C1e028b1227092182046E4f2`). Handles pool creation, bounty reservation, and TEE proof-verified payout releases.

---

## 🏆 DoraHacks WTF Hackathon Submission

Developed for the **DoraHacks WTF Hackathon** to revolutionize smart contract security auditing, confidential bug disclosure, and anonymous researcher rewards.
