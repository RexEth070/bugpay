'use client';

import React, { useState } from 'react';
import { useWallet } from '@/context/WalletContext';

export const AuditLog: React.FC = () => {
  const { auditLogs } = useWallet();
  const [copiedSig, setCopiedSig] = useState<string | null>(null);

  const handleCopySig = (sig: string) => {
    navigator.clipboard.writeText(sig);
    setCopiedSig(sig);
    setTimeout(() => setCopiedSig(null), 2000);
  };

  const truncateAddress = (addr: string) => {
    if (!addr || addr.length < 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header Info */}
      <div className="glossy-card" style={{ padding: '32px', background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span className="badge-red">📜 Immutable Audit Trail</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', background: 'rgba(255, 255, 255, 0.06)', padding: '4px 12px', borderRadius: '9999px' }}>
            iExec Nox Hardware Signatures
          </span>
        </div>
        <h2 className="font-old-english" style={{ fontSize: '2.4rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '12px' }}>
          Encrypted Audit Log & Proof Ledger
        </h2>
        <p style={{ color: '#94A3B8', fontSize: '0.98rem', lineHeight: 1.6 }}>
          Every released bounty is backed by an off-chain <strong style={{ color: '#F59E0B' }}>iExec Nox TEE ECDSA Proof Signature</strong> verifying hardware enclave execution without exposing exploit code.
        </p>
      </div>

      {/* Logs Table Card */}
      <div className="glossy-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#FFFFFF' }}>
            Verified Bounty Settlements ({auditLogs.length})
          </h3>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#F59E0B', background: 'rgba(245, 158, 11, 0.1)', padding: '4px 12px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            Ethereum Sepolia (Chain ID: 11155111)
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {auditLogs.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px 24px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📜</div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                No Verified Settlements Yet
              </h4>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto', lineHeight: 1.5 }}>
                No TEE proof-verified settlements have been recorded yet. Create a live bounty pool in the Safe Vault and submit a report in the Whistleblower Enclave to generate off-chain TEE verified settlements!
              </p>
            </div>
          ) : (
            auditLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  transition: 'all 0.25s ease'
                }}
              >
                {/* Row 1: Title, Date, Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 800, color: '#F59E0B', background: 'rgba(245, 158, 11, 0.1)', padding: '4px 10px', borderRadius: '8px' }}>
                      {log.id}
                    </span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>
                      {log.category}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{log.timestamp}</span>
                    <span className="badge-red" style={{ fontSize: '0.68rem', padding: '3px 10px' }}>
                      <span className="pulse-dot"></span> NOX TEE VERIFIED
                    </span>
                  </div>
                </div>

                {/* Row 2: Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', background: 'rgba(0, 0, 0, 0.2)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '2px' }}>Target Vault:</span>
                    <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: '#CBD5E1', fontWeight: 600 }}>{truncateAddress(log.targetContract)}</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '2px' }}>Stealth Recipient:</span>
                    <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: '#CBD5E1', fontWeight: 600 }}>{truncateAddress(log.stealthRecipient)}</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '2px' }}>Bounty Released:</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#F59E0B' }}>{log.amount}</span>
                  </div>
                </div>

                {/* Row 3: Nox TEE Hardware Proof Signature & Copy Button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', paddingTop: '4px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontFamily: 'monospace' }}>
                    <span style={{ color: '#64748B' }}>Nox TEE SGX Proof: </span>
                    <span style={{ color: '#F59E0B' }}>{log.signature}</span>
                  </div>

                  <button
                    onClick={() => handleCopySig(log.signature)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: copiedSig === log.signature ? '#F59E0B' : '#94A3B8',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {copiedSig === log.signature ? '✓ Copied Proof!' : 'Copy Hardware Proof'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
