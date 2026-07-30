'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AuditLogEntry {
  id: string;
  bountyId?: string;
  bugHash: string;
  targetContract: string;
  category: string;
  stealthRecipient: string;
  amount: string;
  timestamp: string;
  signature: string;
  customPatch?: string;
}

export interface BountyPool {
  id: string;
  title: string;
  category: string;
  targetContract: string;
  capAmount: string;
  numCapEth: number;
  status: 'LIVE' | 'ENDED' | 'EXPIRED';
  requirement: string;
  patchSolution: string;
  createdDate: string;
  endDate: string;
  creatorAddress: string;
}

export interface PatchEntry {
  id: string;
  bountyId: string;
  bountyTitle: string;
  category: string;
  targetContract: string;
  timestamp: string;
  codeFix: string;
  status: 'ENCRYPTED' | 'DECRYPTED';
}

interface EIP1193Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  isMetaMask?: boolean;
  providers?: EIP1193Provider[];
}

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  balance: string;
  chainId: string | null;
  networkName: string;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  connectDemoWallet: () => void;
  disconnectWallet: () => void;
  error: string | null;
  auditLogs: AuditLogEntry[];
  addAuditLog: (entry: AuditLogEntry) => void;
  vaultBalance: number;
  fundVault: (amount: number) => void;
  bounties: BountyPool[];
  createBounty: (newBounty: Omit<BountyPool, 'id' | 'status' | 'createdDate'>) => void;
  claimCategoryBounty: (bountyIdOrCategory: string, amountEth: number, customPatchCode?: string) => void;
  patches: PatchEntry[];
  addPatchEntry: (newPatch: PatchEntry) => void;
  clearAllHistory: () => void;
}

const defaultLogs: AuditLogEntry[] = [];
const initialBounties: BountyPool[] = [];
const defaultPatches: PatchEntry[] = [];

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  address: null,
  balance: '0.00',
  chainId: null,
  networkName: 'Ethereum Sepolia',
  isConnecting: false,
  connectWallet: async () => {},
  connectDemoWallet: () => {},
  disconnectWallet: () => {},
  error: null,
  auditLogs: defaultLogs,
  addAuditLog: () => {},
  vaultBalance: 12.50,
  fundVault: () => {},
  bounties: initialBounties,
  createBounty: () => {},
  claimCategoryBounty: () => {},
  patches: defaultPatches,
  addPatchEntry: () => {},
  clearAllHistory: () => {},
});

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bugpay_connected_address');
    }
    return null;
  });

  const [isConnected, setIsConnected] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('bugpay_connected_address');
    }
    return false;
  });

  const [balance, setBalance] = useState<string>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('bugpay_connected_address')) {
      return '2.45';
    }
    return '0.00';
  });

  const [chainId, setChainId] = useState<string | null>('0xaa36a7'); // 11155111 Sepolia
  const [networkName, setNetworkName] = useState('Ethereum Sepolia');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedLogs = localStorage.getItem('bugpay_audit_logs_v2');
        if (savedLogs) {
          const parsed = JSON.parse(savedLogs);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {
        console.warn('Failed to load audit logs:', e);
      }
    }
    return [];
  });

  const [vaultBalance, setVaultBalance] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedBalance = localStorage.getItem('bugpay_vault_balance');
        if (savedBalance) {
          const parsedBal = parseFloat(savedBalance);
          if (!isNaN(parsedBal)) return parsedBal;
        }
      } catch (e) {
        console.warn('Failed to load vault balance:', e);
      }
    }
    return 12.50;
  });

  const [bounties, setBounties] = useState<BountyPool[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedBounties = localStorage.getItem('bugpay_bounties_v2');
        if (savedBounties) {
          const parsedBounties = JSON.parse(savedBounties);
          if (Array.isArray(parsedBounties)) return parsedBounties;
        }
      } catch (e) {
        console.warn('Failed to load bounties:', e);
      }
    }
    return [];
  });

  const [patches, setPatches] = useState<PatchEntry[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedPatches = localStorage.getItem('bugpay_patches_v2');
        if (savedPatches) {
          const parsedPatches = JSON.parse(savedPatches);
          if (Array.isArray(parsedPatches)) return parsedPatches;
        }
      } catch (e) {
        console.warn('Failed to load patches:', e);
      }
    }
    return [];
  });

  const clearAllHistory = () => {
    setBounties([]);
    setPatches([]);
    setAuditLogs([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bugpay_bounties');
      localStorage.removeItem('bugpay_patches');
      localStorage.removeItem('bugpay_audit_logs');
      localStorage.removeItem('bugpay_bounties_v2');
      localStorage.removeItem('bugpay_patches_v2');
      localStorage.removeItem('bugpay_audit_logs_v2');
    }
  };

  const getEthereumProvider = (): EIP1193Provider | null => {
    if (typeof window === 'undefined') return null;
    const win = window as unknown as { ethereum?: EIP1193Provider };

    if (win.ethereum) {
      if (win.ethereum.providers && win.ethereum.providers.length) {
        return win.ethereum.providers.find((p) => p.isMetaMask) || win.ethereum.providers[0];
      }
      return win.ethereum;
    }
    return null;
  };

  // Fund Vault updates balance immediately without wallet sign popup
  const fundVault = (amount: number) => {
    setVaultBalance((prev) => {
      const nextBal = parseFloat((prev + amount).toFixed(2));
      localStorage.setItem('bugpay_vault_balance', nextBal.toString());
      return nextBal;
    });
  };

  const createBounty = (newBounty: Omit<BountyPool, 'id' | 'status' | 'createdDate'>) => {
    const poolItem: BountyPool = {
      ...newBounty,
      id: `BOUNTY-${Math.floor(101 + Math.random() * 895)}`,
      status: 'LIVE',
      createdDate: new Date().toISOString().slice(0, 10)
    };

    setBounties((prev) => {
      const updated = [poolItem, ...prev];
      localStorage.setItem('bugpay_bounties_v2', JSON.stringify(updated));
      return updated;
    });
  };

  const addPatchEntry = (newPatch: PatchEntry) => {
    setPatches((prev) => {
      const filtered = prev.filter(p => p.bountyId !== newPatch.bountyId);
      const updated = [newPatch, ...filtered];
      localStorage.setItem('bugpay_patches_v2', JSON.stringify(updated));
      return updated;
    });
  };

  const claimCategoryBounty = (bountyIdOrCategory: string, amountEth: number, customPatchCode?: string) => {
    // 1. Subtract payout amount directly from vault balance
    setVaultBalance((prev) => {
      const nextBal = Math.max(0, parseFloat((prev - amountEth).toFixed(2)));
      localStorage.setItem('bugpay_vault_balance', nextBal.toString());
      return nextBal;
    });

    const targetQuery = bountyIdOrCategory.trim().toLowerCase();

    // 2. Find target bounty: exact ID match FIRST (e.g. "BOUNTY-401"), then category match
    let matchedBounty = bounties.find((b) => b.id.toLowerCase() === targetQuery);

    if (!matchedBounty) {
      matchedBounty = bounties.find((b) =>
        b.id.toLowerCase().includes(targetQuery) ||
        targetQuery.includes(b.id.toLowerCase()) ||
        b.category.toLowerCase().includes(targetQuery) ||
        targetQuery.includes(b.category.toLowerCase()) ||
        b.title.toLowerCase().includes(targetQuery)
      );
    }

    if (!matchedBounty) {
      matchedBounty = bounties.find((b) => b.status === 'LIVE') || bounties[0];
    }

    if (matchedBounty) {
      const targetBountyId = matchedBounty.id;

      // Update bounty status to ENDED
      setBounties((prev) => {
        const updated = prev.map((b) => b.id === targetBountyId ? { ...b, status: 'ENDED' as const } : b);
        localStorage.setItem('bugpay_bounties_v2', JSON.stringify(updated));
        return updated;
      });

      // Instantly generate & sync remediation patch to DAO Vault Patch Inbox!
      const patchItem: PatchEntry = {
        id: `PATCH-${matchedBounty.id}`,
        bountyId: matchedBounty.id,
        bountyTitle: matchedBounty.title,
        category: matchedBounty.category,
        targetContract: matchedBounty.targetContract,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
        codeFix: customPatchCode || matchedBounty.patchSolution || '// REMEDIATION PATCH: State check & input validation applied',
        status: 'ENCRYPTED'
      };

      setPatches((prev) => {
        const filtered = prev.filter(p => p.bountyId !== patchItem.bountyId);
        const updated = [patchItem, ...filtered];
        localStorage.setItem('bugpay_patches_v2', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const addAuditLog = (newEntry: AuditLogEntry) => {
    setAuditLogs((prev) => {
      const updated = [newEntry, ...prev];
      try {
        localStorage.setItem('bugpay_audit_logs_v2', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save audit logs to localStorage:', e);
      }
      return updated;
    });

    const numAmount = parseFloat(newEntry.amount.replace(/[^0-9.]/g, '')) || 0;
    if (numAmount > 0) {
      claimCategoryBounty(newEntry.bountyId || newEntry.category, numAmount, newEntry.customPatch);
    }
  };

  // Automatically purge legacy demo cache keys on initial mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Purge old keys
    localStorage.removeItem('bugpay_bounties');
    localStorage.removeItem('bugpay_patches');
    localStorage.removeItem('bugpay_audit_logs');

    const handleWindowError = (event: ErrorEvent) => {
      if (
        event.message?.includes('Cannot redefine property: ethereum') ||
        event.error?.message?.includes('Cannot redefine property: ethereum')
      ) {
        event.stopImmediatePropagation();
        event.preventDefault();
        return true;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason?.message?.includes('Cannot redefine property: ethereum') ||
        event.reason?.includes?.('Cannot redefine property: ethereum')
      ) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleWindowError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true);

    return () => {
      window.removeEventListener('error', handleWindowError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
    };
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const ethereum = getEthereumProvider();
      if (ethereum) {
        // Force wallet permission re-prompt so user can pick/switch account in MetaMask
        try {
          await ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }]
          });
        } catch (permErr: unknown) {
          console.warn('Wallet permissions cancelled/rejected:', permErr);
          setError('Wallet connection cancelled by user.');
          setIsConnecting(false);
          return;
        }

        const accounts = (await ethereum.request({ method: 'eth_requestAccounts' })) as string[];
        const chain = (await ethereum.request({ method: 'eth_chainId' })) as string;

        if (accounts && accounts.length > 0) {
          const userAddress = accounts[0];
          setAddress(userAddress);
          setIsConnected(true);
          setChainId(chain);
          setNetworkName('Ethereum Sepolia');
          setBalance('4.82');
          localStorage.setItem('bugpay_connected_address', userAddress);
        }
      } else {
        setError('No Web3 wallet detected in browser.');
      }
    } catch (err: unknown) {
      const errObj = err as { code?: number; message?: string };
      if (errObj.code === 4001 || errObj.message?.includes('rejected') || errObj.message?.includes('User rejected')) {
        setError('Wallet connection cancelled by user.');
      } else {
        console.warn('Wallet connection error:', err);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const connectDemoWallet = () => {
    setIsConnecting(true);
    setTimeout(() => {
      const demoAddr = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      setAddress(demoAddr);
      setIsConnected(true);
      setBalance('5.00');
      setNetworkName('Ethereum Sepolia');
      localStorage.setItem('bugpay_connected_address', demoAddr);
      setIsConnecting(false);
    }, 600);
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
    setBalance('0.00');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bugpay_connected_address');
    }
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        balance,
        chainId,
        networkName,
        isConnecting,
        connectWallet,
        connectDemoWallet,
        disconnectWallet,
        error,
        auditLogs,
        addAuditLog,
        vaultBalance,
        fundVault,
        bounties,
        createBounty,
        claimCategoryBounty,
        patches,
        addPatchEntry,
        clearAllHistory,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
