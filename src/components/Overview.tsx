'use client';

import React from 'react';
import { useWallet } from '@/context/WalletContext';

interface OverviewProps {
  onNavigate: (tab: string) => void;
}

export const Overview: React.FC<OverviewProps> = ({ onNavigate }) => {
  const { isConnected, connectWallet, vaultBalance, auditLogs } = useWallet();

  // Calculate dynamic total payouts released from audit logs
  const totalPayoutsEth = auditLogs.reduce((acc, log) => {
    const amt = parseFloat(log.amount.replace(/[^0-9.]/g, '')) || 0;
    return acc + amt;
  }, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', paddingBottom: '60px' }}>
      {/* Hero Banner Card */}
      <div className="glossy-card" style={{ padding: '48px 40px', position: 'relative', overflow: 'hidden', background: 'var(--bg-card)' }}>
        {/* Glow Accent Circles */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(255, 46, 85, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '850px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span className="badge-red">
              <span className="pulse-dot"></span> iExec Nox TEE + Safe Multisig Enabled
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', background: 'rgba(255, 255, 255, 0.06)', padding: '4px 12px', borderRadius: '9999px' }}>
              Ethereum Sepolia Live
            </span>
          </div>

          <h1 className="font-old-english" style={{
            fontSize: '3.6rem',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #FFFFFF 30%, #CBD5E1 70%, #FF2E55 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Whistleblow Without Fear.<br />
            Verified by TEE. Paid by Safe.
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: '#94A3B8',
            lineHeight: 1.6,
            marginBottom: '32px',
            maxWidth: '720px'
          }}>
            <strong style={{ color: '#FFFFFF' }}>BugPay</strong> bridges <strong style={{ color: '#FF2E55' }}>Safe Multisig Treasuries</strong> with <strong style={{ color: '#FFFFFF' }}>iExec Nox Enclaves</strong>. Submit zero-day vulnerabilities or DAO exploits confidentially. Off-chain TEE verifies code execution and automatically releases bounty funds to stealth burner wallets on Sepolia—with zero exploit leaks.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => onNavigate('whistleblower')} 
              className="btn-primary"
              style={{ fontSize: '1rem', padding: '14px 28px' }}
            >
              <span>🕵️‍♂️ Submit Anonymous Vulnerability</span>
            </button>

            <button 
              onClick={() => onNavigate('dao')} 
              className="btn-secondary"
              style={{ fontSize: '1rem', padding: '14px 28px' }}
            >
              <span>🏦 Access Safe Multisig Vault</span>
            </button>

            {!isConnected && (
              <button 
                onClick={connectWallet} 
                className="btn-secondary"
                style={{ fontSize: '0.95rem' }}
              >
                <span>⚡ Connect MetaMask</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Protocol Metrics Grid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>📈 Live BugPay Protocol Telemetry</span>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 500 }}>(Ethereum Sepolia Testnet)</span>
          </h2>
          <span className="badge-red">Real-Time Data</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {[
            { title: 'Total Escrowed Bounties', value: `${vaultBalance.toFixed(2)} ETH`, sub: 'Secured in BugPayVault.sol', icon: '💎', color: '#FF2E55' },
            { title: 'Confidential Payouts Released', value: `${totalPayoutsEth.toFixed(2)} ETH`, sub: 'Direct to Stealth Wallets', icon: '💸', color: '#FFFFFF' },
            { title: 'Verified Exploits', value: `${auditLogs.length} Bugs`, sub: 'Zero Code Leaks', icon: '🐛', color: '#FF2E55' },
            { title: 'Nox TEE Execution Time', value: '< 1.2s', sub: 'Hardware SGX Enclave', icon: '⚡', color: '#FFFFFF' }
          ].map((stat, idx) => (
            <div key={idx} className="glossy-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.9rem', color: '#94A3B8', fontWeight: 600 }}>{stat.title}</span>
                <span style={{ fontSize: '1.4rem' }}>{stat.icon}</span>
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: stat.color, letterSpacing: '-0.02em', marginBottom: '4px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3-Step Confidential Enclave Architecture */}
      <div className="glossy-card" style={{ padding: '36px' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '24px', textAlign: 'center' }}>
          How Confidential Bug Bounties Work with iExec Nox TEE
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {[
            {
              step: '01',
              title: 'Client-Side RSA Encryption',
              desc: 'Whistleblowers encrypt PoC exploit scripts client-side using the Nox TEE Public Key (2048-bit RSA). No plain-text code ever hits public networks.'
            },
            {
              step: '02',
              title: 'Hardware SGX Execution',
              desc: 'iExec Nox hardware enclave decrypts the exploit in isolated RAM, forks live Sepolia RPC state off-chain, and verifies code execution autonomously.'
            },
            {
              step: '03',
              title: 'Automated Vault Settlement',
              desc: 'Nox TEE emits an ECDSA signature proof. BugPayVault.sol verifies the signature and instantly releases ETH to the stealth burner wallet.'
            }
          ].map((card) => (
            <div
              key={card.step}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '28px',
                position: 'relative'
              }}
            >
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                color: 'rgba(255, 46, 85, 0.25)',
                position: 'absolute',
                top: '16px',
                right: '20px'
              }}>
                {card.step}
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '10px' }}>
                {card.title}
              </h4>
              <p style={{ fontSize: '0.88rem', color: '#94A3B8', lineHeight: 1.6 }}>
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
