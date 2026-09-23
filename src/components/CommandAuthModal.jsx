import React, { useState, useEffect, useRef } from 'react';
import { IconTerminal, IconCrown, IconAlert } from './CyberIcons';

export const CommandAuthModal = ({
  isOpen,
  mode = 'command', // 'command' | 'admin_auth'
  onClose,
  onOpenAdmin,
  onOpenLeaderboard,
  onLogout
}) => {
  const [commandInput, setCommandInput] = useState('');
  const [passkeyInput, setPasskeyInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setCommandInput('');
      setPasskeyInput('');
      setAuthError('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    const cmd = commandInput.trim().toLowerCase();

    if (cmd === '/option' || cmd === 'option' || cmd === '/options' || cmd === 'options' || cmd === '/admin' || cmd === 'admin') {
      // Transition to admin passkey verification
      setCommandInput('');
      onOpenAdmin(true); // Open admin auth prompt
    } else if (cmd === '/leaderboard' || cmd === 'leaderboard' || cmd === '/rank') {
      onClose();
      onOpenLeaderboard();
    } else if (cmd === '/logout' || cmd === 'logout' || cmd === '/exit') {
      onClose();
      onLogout && onLogout();
    } else if (cmd === '/clear' || cmd === 'clear') {
      localStorage.clear();
      window.location.reload();
    } else if (cmd === '/help' || cmd === 'help') {
      setAuthError('Available commands: /leaderboard, /logout, /clear');
    } else {
      setAuthError(`Unknown command: '${commandInput}'. Try /leaderboard or /help`);
    }
  };

  const handleAdminPasskeySubmit = async (e) => {
    e.preventDefault();
    if (!passkeyInput.trim()) {
      setAuthError('Please enter the Game Master passkey.');
      return;
    }

    setIsVerifying(true);
    setAuthError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey: passkeyInput.trim() })
      });

      const data = await res.json();
      if (data && data.success) {
        onClose();
        onOpenAdmin(false, data.adminToken); // Successfully authenticated!
      } else {
        setAuthError(data.message || 'ACCESS DENIED — Invalid Doctor Doom Passkey.');
      }
    } catch (err) {
      setAuthError('Connection error verifying passkey with server.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="modal-overlay is-open" style={{ zIndex: 500, background: 'rgba(2,6,4,0.92)', backdropFilter: 'blur(12px)' }}>
      <div
        className="modal-content"
        style={{
          maxWidth: '560px',
          width: '92%',
          background: 'linear-gradient(180deg, #091a10 0%, #040c07 100%)',
          border: '1px solid rgba(0, 255, 102, 0.4)',
          boxShadow: '0 0 50px rgba(0,255,102,0.2), 0 20px 60px rgba(0,0,0,0.9)',
          padding: '24px'
        }}
      >
        {mode === 'command' ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(0,255,102,0.2)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconTerminal size={15} color="var(--doom-green-bright)" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--doom-green-bright)', letterSpacing: '0.1em', fontWeight: 'bold' }}>
                  LATVERIA-NET SECURE COMMAND PALETTE
                </span>
              </div>
              <button className="btn btn--ghost btn--xs" onClick={onClose}>ESC</button>
            </div>

            <form onSubmit={handleCommandSubmit}>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.6)', border: '1px solid var(--doom-green)', borderRadius: '6px', padding: '10px 14px', gap: '10px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--doom-green-bright)', fontWeight: 'bold', fontSize: '1.1rem' }}>&gt;</span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a command (/leaderboard, /logout, /option...)"
                  value={commandInput}
                  onChange={(e) => {
                    setCommandInput(e.target.value);
                    setAuthError('');
                  }}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--doom-green-bright)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}
                />
                <button type="submit" className="btn btn--primary btn--xs">RUN</button>
              </div>
            </form>

            {authError && (
              <div style={{ marginTop: '10px', color: 'var(--doom-amber)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconAlert size={13} color="var(--doom-amber)" />
                <span>{authError}</span>
              </div>
            )}

            <div style={{ marginTop: '16px', background: 'rgba(0,255,102,0.04)', border: '1px solid rgba(0,255,102,0.15)', borderRadius: '6px', padding: '12px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ink-faint)', letterSpacing: '0.1em', marginBottom: '8px' }}>
                AVAILABLE DIRECTIVES:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                <div style={{ cursor: 'pointer', color: 'var(--doom-cyan)', display: 'flex', justifyContent: 'space-between' }} onClick={() => { onClose(); onOpenLeaderboard(); }}>
                  <span><strong>/leaderboard</strong></span>
                  <span style={{ color: 'var(--ink-faint)' }}>Live Satellite Telemetry Rankings</span>
                </div>
                <div style={{ cursor: 'pointer', color: 'var(--doom-red)', display: 'flex', justifyContent: 'space-between' }} onClick={() => { onClose(); onLogout && onLogout(); }}>
                  <span><strong>/logout</strong></span>
                  <span style={{ color: 'var(--ink-faint)' }}>Sign out active operative team</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ADMIN AUTHENTICATION PASSKEY PROMPT */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(168,85,247,0.3)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconCrown size={16} color="var(--doom-purple)" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--doom-purple)', letterSpacing: '0.1em', fontWeight: 'bold' }}>
                  DOCTOR DOOM // GAME MASTER AUTHENTICATION
                </span>
              </div>
              <button className="btn btn--ghost btn--xs" onClick={onClose}>ESC</button>
            </div>

            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#aab8b0', margin: '0 0 14px', lineHeight: '1.4' }}>
              Administrative override requires clearance credentials. Enter the master passkey:
            </p>

            <form onSubmit={handleAdminPasskeySubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--doom-purple)', fontWeight: 'bold', marginBottom: '4px' }}>
                    MASTER ADMIN PASSKEY:
                  </label>
                  <input
                    ref={inputRef}
                    type="password"
                    placeholder="Enter Doctor Doom admin passkey..."
                    value={passkeyInput}
                    onChange={(e) => {
                      setPasskeyInput(e.target.value);
                      setAuthError('');
                    }}
                    className="admin-input"
                    style={{ width: '100%', padding: '10px 14px', fontSize: '1rem', color: 'var(--doom-purple)', borderColor: 'var(--doom-purple)' }}
                  />
                </div>

                {authError && (
                  <div style={{
                    background: 'rgba(255, 34, 68, 0.15)',
                    border: '1px solid var(--doom-red)',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    color: 'var(--doom-red)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <IconAlert size={13} color="var(--doom-red)" />
                    <span>{authError}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>CANCEL</button>
                  <button
                    type="submit"
                    className="btn btn--primary btn--sm"
                    style={{ background: 'var(--doom-purple)', borderColor: 'var(--doom-purple)', color: '#fff' }}
                    disabled={isVerifying}
                  >
                    {isVerifying ? 'VERIFYING...' : 'UNLOCK ADMIN CONTROL'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
