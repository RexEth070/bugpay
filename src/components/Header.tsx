/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { useWallet } from '@/context/WalletContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { isConnected, address, balance, networkName, isConnecting, connectWallet, disconnectWallet } = useWallet();

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      backgroundColor: 'rgba(6, 8, 15, 0.88)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '12px 32px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px'
      }}>
        {/* Midnight Obsidian Cyber Logo Branding - 70px Logo Image */}
        <div
          onClick={() => setActiveTab('overview')}
          style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
        >
          {/* Bigger Pure Crimson Red Logo Element */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              title="BugPay Logo"
              style={{
                height: '95px',
                width: '140px',
                backgroundColor: '#FF2E55',
                WebkitMaskImage: 'url(https://i.postimg.cc/WhX9Mtty/840EB90F-C804-44D2-A1B1-151D84D1E81C-removebg-preview.png)',
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskImage: 'url(https://i.postimg.cc/WhX9Mtty/840EB90F-C804-44D2-A1B1-151D84D1E81C-removebg-preview.png)',
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                filter: 'drop-shadow(0 0 16px rgba(255, 46, 85, 0.9))',
                transition: 'transform 0.2s ease'
              }}
            />
          </div>

          {/* Subtitle & NOX TEE Status Badge */}
          <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.12)', paddingLeft: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <a
                href="https://docs.iex.ec"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ textDecoration: 'none' }}
                title="View iExec Nox Developer Documentation"
              >
                <span className="badge-red" style={{ fontSize: '0.68rem', padding: '3px 10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span className="pulse-dot"></span> BugPay Powered by iExec Nox ↗
                </span>
              </a>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 500, marginTop: '4px' }}>
              Safe Multisig + Anonymous Bug Bounty Vault
            </p>
          </div>
        </div>

        {/* Unified Rectangular Navigation Pill Container */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(12, 16, 26, 0.9)',
          border: '1px solid rgba(255, 46, 85, 0.3)',
          borderRadius: '14px',
          padding: '5px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'whistleblower', label: 'Whistle Portal', icon: '🕵️‍♂️' },
            { id: 'dao', label: 'Safe Vault', icon: '🏦' },
            { id: 'audit', label: 'Audit Ledger', icon: '📜' }
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  background: isActive ? 'linear-gradient(135deg, rgba(255, 46, 85, 0.22) 0%, rgba(225, 29, 72, 0.12) 100%)' : 'transparent',
                  border: isActive ? '1px solid rgba(255, 46, 85, 0.6)' : '1px solid transparent',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontSize: '0.92rem',
                  fontWeight: isActive ? 700 : 500,
                  fontFamily: 'var(--font-heading)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isActive ? '0 4px 16px rgba(255, 46, 85, 0.35)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {isActive && (
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#FF2E55',
                    boxShadow: '0 0 8px #FF2E55'
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Wallet Connection & Disconnect Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isConnected && address ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Network Pill */}
              <div style={{
                background: 'rgba(255, 46, 85, 0.1)',
                border: '1px solid rgba(255, 46, 85, 0.3)',
                padding: '8px 14px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#FF2E55'
              }}>
                <span className="pulse-dot"></span>
                <span>{networkName}</span>
              </div>

              {/* Address Pill (ETH balance removed) */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <div style={{
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                  color: '#FFFFFF',
                  fontWeight: 700
                }}>
                  {truncateAddress(address)}
                </div>
              </div>

              {/* Disconnect Button */}
              <button
                onClick={disconnectWallet}
                title="Disconnect Wallet"
                style={{
                  background: 'rgba(255, 46, 85, 0.15)',
                  border: '1px solid rgba(255, 46, 85, 0.4)',
                  color: '#FF2E55',
                  padding: '10px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FF2E55';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 46, 85, 0.15)';
                  e.currentTarget.style.color = '#FF2E55';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="btn-primary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
              <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
