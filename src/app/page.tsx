'use client';

import React, { useState } from 'react';
import { WalletProvider } from '@/context/WalletContext';
import { Header } from '@/components/Header';
import { Overview } from '@/components/Overview';
import { SubmissionForm } from '@/components/SubmissionForm';
import { DaoPortal } from '@/components/DaoPortal';
import { AuditLog } from '@/components/AuditLog';

function MainApp() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '40px 32px 80px' }}>
        {activeTab === 'overview' && <Overview onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === 'whistleblower' && <SubmissionForm />}
        {activeTab === 'dao' && <DaoPortal />}
        {activeTab === 'audit' && <AuditLog />}
      </main>

      {/* Moving Bottom Marquee Tagline Bar */}
      <div style={{
        background: 'rgba(12, 16, 26, 0.95)',
        borderTop: '1px solid rgba(255, 46, 85, 0.3)',
        borderBottom: '1px solid rgba(255, 46, 85, 0.2)',
        padding: '12px 0',
        overflow: 'hidden',
        boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.5)'
      }}>
        <div className="animated-tagline-container" style={{ maxWidth: '100%', width: '100%' }}>
          <div className="animated-tagline-track" style={{ animationDuration: '24s' }}>
            <span className="font-old-english" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FF2E55', letterSpacing: '0.04em', textShadow: '0 0 16px rgba(255, 46, 85, 0.5)' }}>
              Uncover Exploits • Claim ETH Bounties • Zero Identity Exposure • iExec Nox TEE Hardware Verification • Safe Multisig Escrow •
            </span>
            <span className="font-old-english" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FF2E55', letterSpacing: '0.04em', textShadow: '0 0 16px rgba(255, 46, 85, 0.5)' }}>
              Uncover Exploits • Claim ETH Bounties • Zero Identity Exposure • iExec Nox TEE Hardware Verification • Safe Multisig Escrow •
            </span>
          </div>
        </div>
      </div>

      {/* Glossy Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(6, 8, 13, 0.95)',
        padding: '32px',
        marginTop: 'auto'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>
                Bug<span style={{ color: '#FF2E55' }}>Pay</span>
              </span>
              <span className="badge-white" style={{ fontSize: '0.65rem' }}>DoraHacks WTF Hackathon</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
              Powered by iExec Nox TEE Enclaves & Safe Multisig on Ethereum Sepolia.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.82rem', color: '#94A3B8' }}>
            <span>🛡️ Hardware SGX Isolated</span>
            <span>•</span>
            <span>⚡ Zero Exploits Leaked</span>
            <span>•</span>
            <span style={{ color: '#FF2E55', fontWeight: 600 }}>Ethereum Sepolia (Chain 11155111)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <WalletProvider>
      <MainApp />
    </WalletProvider>
  );
}
