# 🚀 How to Deploy BugPayVault.sol to Ethereum Sepolia

Follow these 3 simple steps to deploy `BugPayVault.sol` live to Sepolia Testnet:

---

### Step 1: Open Remix IDE
1. Open **[https://remix.ethereum.org](https://remix.ethereum.org)**.
2. Create a new file named `BugPayVault.sol`.
3. Paste the contents of [`BugPayVault.sol`](file:///c:/Users/samre/OneDrive/Documents/first%20hackathon/bugpay/contracts/BugPayVault.sol).

---

### Step 2: Compile & Deploy
1. In Remix, select Compiler version `0.8.20`.
2. Click **Compile BugPayVault.sol**.
3. Under the **Deploy & Run Transactions** tab:
   - Environment: Select **Injected Provider - MetaMask**.
   - Ensure MetaMask is set to **Ethereum Sepolia Testnet (Chain ID: 11155111)**.
   - Constructor Parameter `_noxEnclaveRelayer`: Enter `0x742d35Cc6634C0532925a3b844Bc454e4438f44e` (Nox TEE Relayer Address).
4. Click **Deploy** and confirm the transaction in MetaMask!

---

### Step 3: Update `.env.local`
Copy your deployed Sepolia contract address and paste it into `.env.local`:

```env
NEXT_PUBLIC_BUG_PAY_VAULT_ADDRESS=0xYOUR_DEPLOYED_SEPOLIA_ADDRESS
```
