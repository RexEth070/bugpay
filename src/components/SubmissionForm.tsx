'use client';

import React, { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { verifyAndSignPayload, NoxVerificationResult } from '@/lib/noxTEE';

export const SubmissionForm: React.FC = () => {
  const { addAuditLog, bounties } = useWallet();
  
  // Filter for LIVE bounties
  const liveBounties = bounties.filter(b => b.status === 'LIVE');
  const hasLiveBounties = liveBounties.length > 0;

  const [selectedBountyId, setSelectedBountyId] = useState<string>(
    hasLiveBounties ? liveBounties[0].id : bounties[0]?.id || ''
  );
  
  const selectedBounty = bounties.find(b => b.id === selectedBountyId) || (hasLiveBounties ? liveBounties[0] : null);

  const [targetContract, setTargetContract] = useState(selectedBounty ? selectedBounty.targetContract : '0x780d6258de52693aDfD0163e89798372Fa6ba360');
  const [exploitCode, setExploitCode] = useState(
    `// Sample Exploit Script for Nox TEE Verification
function executeExploit(address targetVault) external {
    // 1. Trigger vulnerable withdrawal
    ITargetVault(targetVault).withdraw(1.0 ether);
}
fallback() external payable {
    if (address(msg.sender).balance >= 1.0 ether) {
        ITargetVault(msg.sender).withdraw(1.0 ether);
    }
}`
  );

  const [customPatchCode, setCustomPatchCode] = useState(
    `// RECOMMENDED REMEDIATION PATCH FIX
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

function withdraw(uint256 amount) external nonReentrant {
    require(balances[msg.sender] >= amount, "Insufficient balance");
    
    // 1. UPDATE STATE FIRST (Effect)
    balances[msg.sender] -= amount;
    
    // 2. EXTERNAL TRANSFER SECOND (Interaction)
    (bool success, ) = payable(msg.sender).call{value: amount}("");
    require(success, "Transfer failed");
}`
  );

  const [stealthWallet, setStealthWallet] = useState('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [verificationData, setVerificationData] = useState<NoxVerificationResult | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleBountySelect = (id: string) => {
    setSelectedBountyId(id);
    const bounty = bounties.find((b) => b.id === id);
    if (bounty) {
      setTargetContract(bounty.targetContract);
      if (bounty.patchSolution) {
        setCustomPatchCode(bounty.patchSolution);
      }
    }
  };

  const steps = [
    { title: 'Client-Side Encryption', desc: 'Encrypting payload using Nox TEE Public Key (2048-bit RSA)' },
    { title: 'Nox TEE Dispatch', desc: 'Transmitting job into iExec Hardware-Enclosed SGX RAM' },
    { title: 'Sepolia State Forking', desc: 'Running test script against live Sepolia RPC node' },
    { title: 'Proof Signature Generation', desc: 'Nox TEE emitting ECDSA signature for BugPayVault.sol' },
    { title: 'Bounty Released', desc: 'Bounty released to stealth burner wallet on Sepolia' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasLiveBounties || !selectedBounty || selectedBounty.status !== 'LIVE') {
      setErrorMsg('Cannot submit: Selected bounty is already claimed or no live bounties available.');
      return;
    }

    if (!targetContract || !exploitCode || !stealthWallet || !customPatchCode) {
      setErrorMsg('Please complete all required vulnerability & custom patch details.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    setCurrentStep(0);
    setShowSuccessModal(false);

    // Compute real RSA encryption, Keccak256 bug hash & ECDSA TEE signature
    const teeResult = await verifyAndSignPayload(targetContract, exploitCode, stealthWallet);
    setVerificationData(teeResult);

    // Simulate 5-step live Nox TEE execution pipeline
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      await new Promise((res) => setTimeout(res, 800));
    }

    // Append new verified entry directly to global Audit Log state & deduct vault money & switch bounty to ENDED
    const newLogEntry = {
      id: `LOG-${Math.floor(9500 + Math.random() * 499)}`,
      bountyId: selectedBounty ? selectedBounty.id : undefined,
      bugHash: teeResult.bugHash,
      targetContract: targetContract.length > 10 ? targetContract : '0x780d6258de52693aDfD0163e89798372Fa6ba360',
      category: selectedBounty ? selectedBounty.category : 'Vulnerability Report',
      stealthRecipient: stealthWallet,
      amount: selectedBounty ? selectedBounty.capAmount : '1.50 ETH',
      timestamp: teeResult.timestamp,
      signature: teeResult.signature,
      customPatch: customPatchCode
    };

    addAuditLog(newLogEntry);
    setIsSubmitting(false);
    setShowSuccessModal(true);
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header Info */}
      <div className="glossy-card" style={{ padding: '32px', background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span className="badge-red">🕵️‍♂️ Anonymous Whistleblower Enclave</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', background: 'rgba(255, 255, 255, 0.06)', padding: '4px 12px', borderRadius: '9999px' }}>
            Zero Identity Exposure
          </span>
        </div>
        <h2 className="font-old-english" style={{ fontSize: '2.4rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '12px' }}>
          Submit Confidential Vulnerability Report
        </h2>
        <p style={{ color: '#94A3B8', fontSize: '0.98rem', lineHeight: 1.6 }}>
          Select an active DAO bounty pool below. Your exploit script and custom patch code are encrypted client-side. The <strong style={{ color: '#FFFFFF' }}>iExec Nox TEE Hardware Enclave</strong> validates the bug off-chain and executes the Sepolia vault payout automatically.
        </p>
      </div>

      {/* Main Submission Form Card */}
      <div className="glossy-card" style={{ padding: '36px' }}>
        {/* Banner when zero live bounties remain */}
        {!hasLiveBounties && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            color: '#FBBF24',
            padding: '18px 24px',
            borderRadius: '14px',
            marginBottom: '24px',
            fontSize: '0.95rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '1.4rem' }}>⚠️</span>
            <div>
              <div style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 800 }}>All DAO Bounty Pools Have Been Claimed & Settled!</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 500, marginTop: '2px', color: '#FCD34D' }}>
                There are currently no active live bounties. DAO admins can fund and create new bounty pools in the DAO Safe Vault.
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#F87171',
              padding: '14px 18px',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: 600
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Dynamic DAO Bounty Selection Box */}
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '8px' }}>
              Select Active DAO Bounty Pool *
            </label>
            <select
              value={selectedBountyId}
              onChange={(e) => handleBountySelect(e.target.value)}
              className="input-glossy"
              disabled={!hasLiveBounties}
              style={{ appearance: 'none', cursor: hasLiveBounties ? 'pointer' : 'not-allowed', fontWeight: 700, color: hasLiveBounties ? '#FF2E55' : '#64748B' }}
            >
              {bounties.map((b) => (
                <option key={b.id} value={b.id} disabled={b.status !== 'LIVE'}>
                  [{b.id}] {b.title} — {b.capAmount} {b.status !== 'LIVE' ? `(${b.status} - UNAVAILABLE)` : `(Ends: ${b.endDate})`}
                </option>
              ))}
            </select>
            {selectedBounty && (
              <span style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'block', marginTop: '6px' }}>
                📋 <strong style={{ color: '#FFFFFF' }}>Requirement:</strong> {selectedBounty.requirement}
              </span>
            )}
          </div>

          {/* Form Row: 2-Column Grid for Target Contract & Stealth Wallet */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '8px' }}>
                Target Sepolia Contract Address *
              </label>
              <input
                type="text"
                value={targetContract}
                onChange={(e) => setTargetContract(e.target.value)}
                className="input-glossy"
                placeholder="0x..."
                disabled={!hasLiveBounties}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '8px' }}>
                Stealth Burner Wallet Address (Payout Recipient) *
              </label>
              <input
                type="text"
                value={stealthWallet}
                onChange={(e) => setStealthWallet(e.target.value)}
                className="input-glossy"
                placeholder="0x... (Unlinked fresh burner wallet)"
                disabled={!hasLiveBounties}
                required
              />
            </div>
          </div>

            {/* Dynamic Locked Bounty Payout Indicator */}
            <div style={{
              background: hasLiveBounties ? 'rgba(255, 46, 85, 0.08)' : 'rgba(255, 255, 255, 0.03)',
              border: hasLiveBounties ? '1px solid rgba(255, 46, 85, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '2px' }}>
                  Locked Bounty Payout
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: hasLiveBounties ? '#FF2E55' : '#64748B' }}>
                  {hasLiveBounties && selectedBounty ? selectedBounty.capAmount : '0.00 ETH'}
                </span>
              </div>
              <span className={hasLiveBounties ? 'badge-red' : 'badge-white'} style={{ fontSize: '0.7rem' }}>
                {hasLiveBounties ? 'DAO APPROVED' : 'ALL CLAIMED'}
              </span>
            </div>

          {/* Form Row 3: Exploit Code Editor */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#CBD5E1' }}>
                Exploit Script / PoC Payload (Solidity / JavaScript) *
              </label>
              <span className="badge-red" style={{ fontSize: '0.65rem' }}>
                RSA-2048 Client Encrypted
              </span>
            </div>
            <textarea
              value={exploitCode}
              onChange={(e) => setExploitCode(e.target.value)}
              className="code-editor"
              rows={6}
              disabled={!hasLiveBounties}
              style={{ width: '100%', resize: 'vertical', opacity: hasLiveBounties ? 1 : 0.5 }}
              placeholder="// Paste exploit script here..."
              required
            />
          </div>

          {/* Form Row 4: Custom Remediation Patch Solution (Fix Solution) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#38BDF8' }}>
                🔧 Custom Remediation Patch Fix (Delivered to DAO Admin Inbox) *
              </label>
              <span className="badge-red" style={{ fontSize: '0.65rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                Re-encrypted for DAO Admin
              </span>
            </div>
            <textarea
              value={customPatchCode}
              onChange={(e) => setCustomPatchCode(e.target.value)}
              className="code-editor"
              rows={6}
              disabled={!hasLiveBounties}
              style={{ width: '100%', resize: 'vertical', opacity: hasLiveBounties ? 1 : 0.5, borderColor: 'rgba(56, 189, 248, 0.3)' }}
              placeholder="// Write or paste your recommended Solidity patch code fix for the DAO..."
              required
            />
            <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginTop: '4px' }}>
              💡 This patch code will be re-encrypted by Nox TEE and delivered straight to the DAO Safe Admin Patch Inbox upon payout!
            </span>
          </div>

          {/* Submit CTA */}
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#94A3B8' }}>
              <span>🛡️ Encrypted with RSA-2048 iExec Nox Public Key</span>
            </div>

            <button
              type="submit"
              disabled={Boolean(isSubmitting || !hasLiveBounties || (selectedBounty && selectedBounty.status !== 'LIVE'))}
              className="btn-primary"
              style={{
                padding: '14px 32px',
                fontSize: '1rem',
                opacity: hasLiveBounties && selectedBounty?.status === 'LIVE' ? 1 : 0.5,
                cursor: hasLiveBounties && selectedBounty?.status === 'LIVE' ? 'pointer' : 'not-allowed'
              }}
            >
              <span>
                {!hasLiveBounties
                  ? '🔒 All Bounties Claimed (0 Live)'
                  : isSubmitting
                  ? 'Processing Nox TEE Task...'
                  : `🔒 Encrypt & Submit (${selectedBounty ? selectedBounty.capAmount : '1.50 ETH'})`}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Execution Pipeline Modal */}
      {isSubmitting && (
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
          <div className="glossy-card" style={{ maxWidth: '540px', width: '100%', padding: '36px', background: '#0D111A', border: '1px solid rgba(255, 46, 85, 0.3)' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <span className="pulse-dot" style={{ width: '14px', height: '14px', margin: '0 auto 16px auto', display: 'block' }}></span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>
                iExec Nox TEE Enclave Execution
              </h3>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                Confidential hardware-isolated SGX enclave verification pipeline
              </p>
            </div>

            {/* Pipeline Step Progress */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {steps.map((step, idx) => {
                const isDone = idx < currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: isCurrent ? 'rgba(255, 46, 85, 0.12)' : isDone ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                      border: isCurrent ? '1px solid rgba(255, 46, 85, 0.35)' : '1px solid transparent',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: isDone ? '#FF2E55' : isCurrent ? 'rgba(255, 46, 85, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      color: isDone ? '#FFFFFF' : isCurrent ? '#FF2E55' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      flexShrink: 0
                    }}>
                      {isDone ? '✓' : idx + 1}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: isCurrent || isDone ? '#FFFFFF' : '#64748B' }}>
                        {step.title}
                      </h4>
                      <p style={{ fontSize: '0.78rem', color: isCurrent ? '#FF2E55' : '#94A3B8' }}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Clean Submission Success Modal with Real Nox TEE Verification Hashes */}
      {showSuccessModal && (
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
          <div className="glossy-card" style={{ maxWidth: '540px', width: '100%', padding: '36px', background: '#0D111A', border: '1px solid rgba(255, 46, 85, 0.4)' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255, 46, 85, 0.15)', color: '#FF2E55', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 16px auto', border: '1px solid rgba(255, 46, 85, 0.4)' }}>
                🎉
              </div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
                Bounty Verification & Payout Complete!
              </h3>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.5 }}>
                The iExec Nox TEE Enclave successfully verified your zero-day exploit and executed the bounty payout from <strong style={{ color: '#FFFFFF' }}>BugPayVault.sol</strong>.
              </p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '18px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#94A3B8' }}>Bounty Released:</span>
                <span style={{ fontWeight: 800, color: '#FF2E55' }}>{selectedBounty ? selectedBounty.capAmount : '1.50 ETH'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#94A3B8' }}>Recipient Wallet:</span>
                <span style={{ fontFamily: 'monospace', color: '#FFFFFF' }}>{stealthWallet.slice(0, 8)}...{stealthWallet.slice(-6)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#94A3B8' }}>Keccak256 Bug Hash:</span>
                <span style={{ fontFamily: 'monospace', color: '#38BDF8' }}>{verificationData ? verificationData.bugHash.slice(0, 14) + '...' : '0xa4e8...c83b'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#94A3B8' }}>Nox TEE Hardware Proof:</span>
                <span style={{ fontFamily: 'monospace', color: '#FF2E55' }}>{verificationData ? verificationData.signature.split(' ')[0] : '0x8f2a9d41...1be707'}</span>
              </div>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}
            >
              <span>Close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
