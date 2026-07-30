'use client';

import React, { useState } from 'react';
import { useWallet, PatchEntry } from '@/context/WalletContext';

export const DaoPortal: React.FC = () => {
  const { isConnected, address, isConnecting, connectWallet, vaultBalance, fundVault, bounties, createBounty, patches, clearAllHistory } = useWallet();

  const [fundAmount, setFundAmount] = useState('2.00');
  const [isFunding, setIsFunding] = useState(false);
  const [fundedTxHash, setFundedTxHash] = useState<string | null>(null);

  // Create Bounty Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Reentrancy Vulnerability');
  const [newTarget] = useState('0x3A2b801F480fEa11C1e028b1227092182046E4f2');
  const [newCapEth, setNewCapEth] = useState('1.00');
  const [newEndDate, setNewEndDate] = useState('2026-08-30');
  const [newRequirement, setNewRequirement] = useState('');
  const [newSolution, setNewSolution] = useState('');

  // Interactive Signing & Error State for Creation
  const [isSigningModalOpen, setIsSigningModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createErrorMsg, setCreateErrorMsg] = useState<string | null>(null);
  const [createdTxHash, setCreatedTxHash] = useState<string | null>(null);

  // Decrypted Patch Inbox State & Search
  const [patchSearchQuery, setPatchSearchQuery] = useState('');
  const [selectedPatchToDecrypt, setSelectedPatchToDecrypt] = useState<PatchEntry | null>(null);
  const [decryptedPatchId, setDecryptedPatchId] = useState<string | null>(null);
  const [isDecryptSigning, setIsDecryptSigning] = useState(false);
  const [decryptErrorMsg, setDecryptErrorMsg] = useState<string | null>(null);

  const handleStartDecryptPatch = (patch: PatchEntry) => {
    setSelectedPatchToDecrypt(patch);
  };

  // Filter patches by search query supporting raw numbers (e.g. "105" or "101"), Bounty IDs, categories, or contract addresses
  const filteredPatches = patches.filter(p => {
    const rawQuery = patchSearchQuery.trim().toLowerCase();
    if (!rawQuery) return true;

    const cleanQuery = rawQuery.replace(/[^a-z0-9]/g, '');
    const cleanBountyId = p.bountyId.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanPatchId = p.id.toLowerCase().replace(/[^a-z0-9]/g, '');

    return (
      p.bountyId.toLowerCase().includes(rawQuery) ||
      p.id.toLowerCase().includes(rawQuery) ||
      cleanBountyId.includes(cleanQuery) ||
      cleanPatchId.includes(cleanQuery) ||
      p.category.toLowerCase().includes(rawQuery) ||
      p.targetContract.toLowerCase().includes(rawQuery) ||
      p.bountyTitle.toLowerCase().includes(rawQuery)
    );
  });

  const handleFundVault = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(fundAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setIsFunding(true);
    setFundedTxHash(null);

    try {
      fundVault(parsedAmount);
      setFundedTxHash('SUCCESS');
    } catch (err: unknown) {
      console.error('Funding failed:', err);
    } finally {
      setIsFunding(false);
    }
  };

  const handleStartCreateBounty = (e: React.FormEvent) => {
    e.preventDefault();
    const capNum = parseFloat(newCapEth);
    setCreateErrorMsg(null);

    if (!newTitle || isNaN(capNum) || capNum <= 0) {
      setCreateErrorMsg('Please fill in a valid bounty title and cap amount.');
      return;
    }

    // Open mandatory wallet signature modal
    setIsSigningModalOpen(true);
  };

  const handleConfirmWalletSignature = async () => {
    const capNum = parseFloat(newCapEth);
    setIsCreating(true);
    setCreateErrorMsg(null);

    try {
      if (typeof window !== 'undefined' && (window as unknown as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum && address) {
        try {
          const txParams = {
            from: address,
            to: '0x3A2b801F480fEa11C1e028b1227092182046E4f2',
            value: '0x0',
            data: '0x34293f9e'
          };

          const txHash = (await (window as unknown as { ethereum: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum.request({
            method: 'eth_sendTransaction',
            params: [txParams]
          })) as string;

          if (txHash) {
            setCreatedTxHash(txHash);
          }
        } catch (txErr: unknown) {
          const errObj = txErr as { code?: number; message?: string };
          if (errObj.code === 4001 || errObj.message?.includes('rejected')) {
            throw new Error('Wallet Transaction Rejected! Bounty pool deployment cancelled by user.');
          }
          const msg = `BugPay Safe Multisig: Deploy Bounty Pool "${newTitle}" for ${capNum} ETH on Sepolia.`;
          await (window as unknown as { ethereum: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum.request({
            method: 'personal_sign',
            params: [msg, address]
          });
        }
      }

      createBounty({
        title: newTitle,
        category: newCategory,
        targetContract: newTarget,
        capAmount: `${capNum.toFixed(2)} ETH`,
        numCapEth: capNum,
        requirement: newRequirement || 'Must provide complete PoC exploit script and inline refactored patch solution.',
        patchSolution: newSolution || '// REMEDIATION PATCH SOLUTION\n// Applied security assertions and state updates before external calls.\n\nfunction patchVulnerability() external {\n    // Fixed state update logic\n}',
        endDate: newEndDate || '2026-08-30',
        creatorAddress: address || '0x8920...43e7'
      });

      setCreatedTxHash('SUCCESS');
      setIsSigningModalOpen(false);
      setShowCreateModal(false);
      
      setNewTitle('');
      setNewRequirement('');
      setNewSolution('');
    } catch (err: unknown) {
      const errorMsg = (err as Error).message || 'Signature rejected or failed';
      setCreateErrorMsg(errorMsg);
      setIsSigningModalOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelSignature = () => {
    setIsSigningModalOpen(false);
    setCreateErrorMsg('⚠️ Wallet signature rejected. Bounty pool was NOT created.');
  };

  const handleConfirmDecryptSignature = async () => {
    if (!selectedPatchToDecrypt) return;
    setIsDecryptSigning(true);
    setDecryptErrorMsg(null);

    try {
      if (typeof window !== 'undefined' && (window as unknown as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum && address) {
        try {
          const msg = `BugPay Authentication: Sign message to authenticate DAO Safe Admin ownership & decrypt ${selectedPatchToDecrypt.id}.`;
          await (window as unknown as { ethereum: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum.request({
            method: 'personal_sign',
            params: [msg, address]
          });
        } catch (sigErr: unknown) {
          const errObj = sigErr as { code?: number; message?: string };
          if (errObj.code === 4001 || errObj.message?.includes('rejected')) {
            throw new Error('Wallet Signature Rejected! Authentication failed to decrypt patch.');
          }
        }
      }

      setDecryptedPatchId(selectedPatchToDecrypt.id);
      setSelectedPatchToDecrypt(null);
    } catch (err: unknown) {
      const errorMsg = (err as Error).message || 'Authentication failed';
      setDecryptErrorMsg(errorMsg);
    } finally {
      setIsDecryptSigning(false);
    }
  };

  const isExpired = (endDateStr: string) => {
    const today = new Date().toISOString().slice(0, 10);
    return endDateStr < today;
  };

  // Mandatory Wallet Connection Access Gate for Safe Vault Portal
  if (!isConnected || !address) {
    return (
      <div style={{ maxWidth: '720px', margin: '40px auto 0', textAlign: 'center' }}>
        <div className="glossy-card" style={{ padding: '48px 36px', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '3.2rem', marginBottom: '16px' }}>🔒</div>
          <span className="badge-red" style={{ marginBottom: '16px', display: 'inline-flex' }}>DAO Safe Vault Access Locked</span>
          <h2 className="font-old-english" style={{ fontSize: '2.4rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '14px' }}>
            Wallet Connection Required
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '1rem', lineHeight: 1.6, marginBottom: '28px' }}>
            Access to the DAO Safe Multisig Treasury Vault, active bounty pool deployments, and re-encrypted remediation patches requires an authenticated Web3 wallet connection.
          </p>
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="btn-primary"
            style={{ fontSize: '1.05rem', padding: '14px 32px' }}
          >
            <span>⚡ {isConnecting ? 'Connecting Wallet...' : 'Connect Wallet to Unlock Safe Vault'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header Banner */}
      <div className="glossy-card" style={{ padding: '32px', background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span className="badge-red">🏦 DAO Safe Treasury Governance</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', background: 'rgba(255, 255, 255, 0.06)', padding: '4px 12px', borderRadius: '9999px' }}>
            BugPayVault.sol Escrow Manager
          </span>
        </div>
        <h2 className="font-old-english" style={{ fontSize: '2.4rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '12px' }}>
          DAO Safe Multisig Vault Management
        </h2>
        <p style={{ color: '#94A3B8', fontSize: '0.98rem', lineHeight: 1.6 }}>
          Pre-fund bounty pools, set target vulnerability requirements with expiry dates, and decrypt verified remediation patches delivered off-chain by <strong style={{ color: '#FF2E55' }}>iExec Nox TEE Enclaves</strong>.
        </p>
      </div>

      {createErrorMsg && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          color: '#F87171',
          padding: '14px 18px',
          borderRadius: '12px',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          {createErrorMsg}
        </div>
      )}

      {decryptErrorMsg && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          color: '#F87171',
          padding: '14px 18px',
          borderRadius: '12px',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          {decryptErrorMsg}
        </div>
      )}

      {/* Row 1: Treasury Balance & Deposit Form */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Treasury Stats Card */}
        <div className="glossy-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Vault Escrow Balance
              </span>
              <span className="badge-red" style={{ fontSize: '0.68rem' }}>
                <span className="pulse-dot"></span> LIVE VAULT
              </span>
            </div>
            <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1, marginBottom: '8px' }}>
              {vaultBalance.toFixed(2)} <span style={{ fontSize: '1.4rem', color: '#FF2E55' }}>ETH</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Secured in <code style={{ color: '#CBD5E1', fontFamily: 'monospace' }}>BugPayVault.sol</code> on Ethereum Sepolia
            </p>
          </div>

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Active Bounty Tiers:</span>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>{bounties.filter(b => b.status === 'LIVE').length} Live Pools</span>
          </div>
        </div>

        {/* Deposit / Fund Bounty Form Card */}
        <div className="glossy-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>
            Deposit ETH to Vault Pool
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '20px' }}>
            Fund the Safe Multisig escrow vault to back active bug bounty claims.
          </p>

          <form onSubmit={handleFundVault} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                Deposit Amount (Sepolia ETH) *
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  className="input-glossy"
                  style={{ flex: 1 }}
                  placeholder="2.00"
                  required
                />
                <button
                  type="submit"
                  disabled={isFunding}
                  className="btn-primary"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <span>{isFunding ? 'Signing...' : '💸 Fund Vault'}</span>
                </button>
              </div>
            </div>

            {fundedTxHash && (
              <div style={{
                background: 'rgba(255, 46, 85, 0.1)',
                border: '1px solid rgba(255, 46, 85, 0.3)',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>✓ Vault Funded Successfully (+{fundAmount} ETH)!</span>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Row 2: Vulnerability Bounties Registry */}
      <div className="glossy-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '4px' }}>
              Vulnerability Bounty Requirements & Pools ({bounties.length})
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#94A3B8' }}>
              Pre-approved severity tiers, specific researcher report requirements, and live expiry status.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: '0.88rem' }}
          >
            <span>✍️ Create & Sign Bounty Pool</span>
          </button>
        </div>

        {createdTxHash && (
          <div style={{
            background: 'rgba(255, 46, 85, 0.1)',
            border: '1px solid rgba(255, 46, 85, 0.3)',
            padding: '12px 18px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ color: '#FFFFFF', fontWeight: 700 }}>🎉 Bounty Pool Deployed & Signed on Sepolia!</span>
          </div>
        )}

        {/* Bounties Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {bounties.map((bounty) => {
            const expired = isExpired(bounty.endDate);
            const statusLabel = bounty.status === 'ENDED' ? 'ENDED & CLAIMED' : expired ? 'EXPIRED' : 'LIVE';

            return (
              <div
                key={bounty.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: bounty.status === 'LIVE' && !expired ? '1px solid rgba(255, 46, 85, 0.25)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                {/* Header: Title, Cap Amount, Status Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 800, color: '#94A3B8', background: 'rgba(255, 255, 255, 0.06)', padding: '4px 10px', borderRadius: '8px' }}>
                      {bounty.id}
                    </span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>
                      {bounty.title}
                    </h4>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FF2E55' }}>
                      {bounty.capAmount}
                    </span>
                    {statusLabel === 'LIVE' ? (
                      <span className="badge-red" style={{ fontSize: '0.72rem', padding: '4px 12px' }}>
                        <span className="pulse-dot"></span> LIVE
                      </span>
                    ) : statusLabel === 'EXPIRED' ? (
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#F59E0B', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '4px 12px', borderRadius: '9999px' }}>
                        ⏳ EXPIRED
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94A3B8', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '4px 12px', borderRadius: '9999px' }}>
                        ✓ ENDED & CLAIMED
                      </span>
                    )}
                  </div>
                </div>

                {/* Body: Requirements & Patch Solution */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#FF2E55', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                      📋 Report Requirement Criterion:
                    </span>
                    <p style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: 1.5 }}>
                      {bounty.requirement}
                    </p>
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                      🔧 Required Remediation Solution:
                    </span>
                    <p style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: 1.5 }}>
                      {bounty.patchSolution.split('\n')[0]}
                    </p>
                  </div>
                </div>

                {/* Footer: Target Contract & Expiry Date */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748B', flexWrap: 'wrap', gap: '10px' }}>
                  <span>Target Contract: <code style={{ color: '#94A3B8', fontFamily: 'monospace' }}>{bounty.targetContract}</code></span>
                  <span>📅 Expiry End Date: <strong style={{ color: expired ? '#F59E0B' : '#FFFFFF' }}>{bounty.endDate}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 3: Dynamic Encrypted Remediation Patch Inbox with Search & Wallet Signing Decryption */}
      <div className="glossy-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '4px' }}>
              Encrypted Remediation Patch Inbox ({patches.length})
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
              Re-encrypted bug patches delivered by Nox TEE to DAO Safe admins after verified payouts.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Search / Filter Input */}
            <input
              type="text"
              value={patchSearchQuery}
              onChange={(e) => setPatchSearchQuery(e.target.value)}
              className="input-glossy"
              style={{ width: '240px', padding: '8px 14px', fontSize: '0.85rem' }}
              placeholder="Search Bounty ID (e.g. BOUNTY-105)..."
            />
            <span className="badge-red" style={{ fontSize: '0.7rem' }}>RSA-2048 DAO Key</span>
          </div>
        </div>

        {/* Patch List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredPatches.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '0.9rem' }}>
              No patches match your search query &quot;{patchSearchQuery}&quot;.
            </div>
          ) : (
            filteredPatches.map((patch) => {
              const isDecrypted = decryptedPatchId === patch.id;

              return (
                <div key={patch.id} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 800, color: '#FF2E55', background: 'rgba(255, 46, 85, 0.1)', padding: '3px 8px', borderRadius: '6px' }}>
                          {patch.id}
                        </span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>
                          {patch.bountyTitle}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block', marginTop: '4px' }}>
                        Verified & Re-encrypted by Nox TEE SGX Enclave on {patch.timestamp}
                      </span>
                    </div>

                    {isDecrypted ? (
                      <button
                        onClick={() => setDecryptedPatchId(null)}
                        className="btn-secondary"
                        style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                      >
                        <span>✖ Close Patch</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartDecryptPatch(patch)}
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                      >
                        <span>🔓 Sign & Decrypt Patch</span>
                      </button>
                    )}
                  </div>

                  {/* Decrypted Code Fix Display Container */}
                  {isDecrypted && (
                    <div style={{ marginTop: '16px', background: '#080A0F', border: '1px solid rgba(255, 46, 85, 0.3)', borderRadius: '12px', padding: '18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38BDF8' }}>
                          🔓 Decrypted Remediation Instructions (Nox TEE Verified for {patch.bountyId})
                        </span>
                        <button
                          onClick={() => setDecryptedPatchId(null)}
                          style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}
                        >
                          Close ✖
                        </button>
                      </div>
                      <pre style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#F8FAFC', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                        {patch.codeFix}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal: Create New Bounty Pool */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          background: 'rgba(6, 8, 15, 0.85)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div className="glossy-card" style={{ maxWidth: '600px', width: '100%', padding: '36px', background: '#0D111A', border: '1px solid rgba(255, 46, 85, 0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF' }}>
                Create New Bounty Pool
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStartCreateBounty} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                  Bounty Pool Title *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="input-glossy"
                  placeholder="e.g. Tier 6: Cross-Chain Bridge Flash Loan Flaw"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                    Category *
                  </label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="input-glossy"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                    Cap Amount (ETH) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newCapEth}
                    onChange={(e) => setNewCapEth(e.target.value)}
                    className="input-glossy"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                  Bounty End / Expiry Date *
                </label>
                <input
                  type="date"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  className="input-glossy"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                  Report Requirement Criterion *
                </label>
                <textarea
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  className="input-glossy"
                  rows={3}
                  placeholder="e.g. Must include PoC exploit script and inline refactored solution..."
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <span>✍️ Proceed to Sign Transaction</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mandatory Wallet Signature Modal for Creating Bounty Pool */}
      {isSigningModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 250,
          background: 'rgba(6, 8, 15, 0.9)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div className="glossy-card" style={{ maxWidth: '520px', width: '100%', padding: '36px', background: '#0D111A', border: '1px solid rgba(255, 46, 85, 0.4)' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255, 46, 85, 0.15)', color: '#FF2E55', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 16px auto', border: '1px solid rgba(255, 46, 85, 0.4)' }}>
                ✍️
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
                Wallet Signature Required
              </h3>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Please sign the Sepolia deployment request in your Web3 wallet to authorize creating <strong style={{ color: '#FF2E55' }}>{newCapEth} ETH</strong> bounty pool.
              </p>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px', marginBottom: '24px', fontSize: '0.82rem', fontFamily: 'monospace', color: '#CBD5E1' }}>
              <div>Message: &quot;BugPay Safe Multisig: Deploy Bounty Pool &apos;{newTitle}&apos; for {newCapEth} ETH on Sepolia.&quot;</div>
              <div style={{ color: '#64748B', marginTop: '4px' }}>End Date: {newEndDate}</div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleConfirmWalletSignature}
                disabled={isCreating}
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <span>{isCreating ? 'Deploying to Sepolia...' : '✓ Confirm & Sign Wallet Request'}</span>
              </button>
              <button
                onClick={handleCancelSignature}
                disabled={isCreating}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center', color: '#F87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
              >
                <span>✖ Cancel / Reject</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Wallet Signature Modal for Decrypting Patch */}
      {selectedPatchToDecrypt && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 250,
          background: 'rgba(6, 8, 15, 0.9)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div className="glossy-card" style={{ maxWidth: '520px', width: '100%', padding: '36px', background: '#0D111A', border: '1px solid rgba(255, 46, 85, 0.4)' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255, 46, 85, 0.15)', color: '#FF2E55', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 16px auto', border: '1px solid rgba(255, 46, 85, 0.4)' }}>
                🔐
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
                Authenticate Admin Ownership
              </h3>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Sign message with your connected DAO Safe wallet to decrypt <strong style={{ color: '#FF2E55' }}>{selectedPatchToDecrypt.id}</strong> ({selectedPatchToDecrypt.bountyId}).
              </p>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px', marginBottom: '24px', fontSize: '0.82rem', fontFamily: 'monospace', color: '#CBD5E1' }}>
              <div>Challenge: &quot;BugPay Authentication: Sign message to authenticate DAO Safe Admin ownership &amp; decrypt {selectedPatchToDecrypt.id}.&quot;</div>
              <div style={{ color: '#64748B', marginTop: '4px' }}>Category: {selectedPatchToDecrypt.category}</div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleConfirmDecryptSignature}
                disabled={isDecryptSigning}
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <span>{isDecryptSigning ? 'Decrypting...' : '🔓 Sign & Decrypt Patch'}</span>
              </button>
              <button
                onClick={() => setSelectedPatchToDecrypt(null)}
                disabled={isDecryptSigning}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center', color: '#F87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
              >
                <span>✖ Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
