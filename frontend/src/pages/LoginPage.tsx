import React, { useState } from 'react';
import { Layers, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEMO_PERSONAS } from '../lib/rbac';
import type { Role } from '../types';

export const LoginPage: React.FC = () => {
  const { switchRole, navigateTo } = useApp();
  const [selectedRole, setSelectedRole] = useState<Role>('cmpdi_nodal');
  const [emailInput, setEmailInput] = useState(DEMO_PERSONAS['cmpdi_nodal'].email);
  const [passwordInput, setPasswordInput] = useState('demo-session-token-2026');

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setEmailInput(DEMO_PERSONAS[role].email);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    switchRole(selectedRole);
    navigateTo('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-app)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      {/* Return to Landing Button */}
      <button
        onClick={() => navigateTo('/')}
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 500
        }}
      >
        <ArrowLeft size={16} />
        <span>Return to Landing Page</span>
      </button>

      <div style={{ maxWidth: '680px', width: '100%' }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-dark)',
            color: '#FFFFFF',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px'
          }}>
            <Layers size={26} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
            MDMS + Mindsetu AI Access Portal
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Select a verified prototype persona or enter synthetic demo credentials
          </p>
        </div>

        {/* Demo Watermark Banner */}
        <div style={{
          backgroundColor: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertCircle size={20} style={{ color: '#D97706', flexShrink: 0 }} />
          <div style={{ fontSize: '12px', color: '#92400E' }}>
            <strong style={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              DEMO ACCOUNT — SYNTHETIC DATA ONLY
            </strong>
            All accounts operate in controlled research environments with synthetic figures.
          </div>
        </div>

        {/* Role Selector Grid */}
        <div className="card-base" style={{ marginBottom: '20px', padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
            1. Select Demo Persona & Authority Role
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
            {(Object.keys(DEMO_PERSONAS) as Role[]).map(roleKey => {
              const p = DEMO_PERSONAS[roleKey];
              const isSelected = selectedRole === roleKey;
              return (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => handleRoleSelect(roleKey)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                    backgroundColor: isSelected ? 'var(--accent-light)' : '#FFFFFF',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                      {p.roleLabel}
                    </span>
                    {isSelected && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }} />}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {p.name.split(',')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="card-base" style={{ padding: '24px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px' }}>
            2. Verify Credentials
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Synthetic User ID / Email
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  fontSize: '13px',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Demonstration Passkey (Fixed)
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  fontSize: '13px',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-pill"
            style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 600 }}
          >
            <span>Authenticate as {DEMO_PERSONAS[selectedRole].roleLabel}</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
