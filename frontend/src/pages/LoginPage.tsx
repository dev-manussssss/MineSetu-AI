import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  FileCheck,
  Search,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEMO_PERSONAS } from '../lib/rbac';
import type { Role } from '../types';

export const LoginPage: React.FC = () => {
  const { switchRole, navigateTo } = useApp();
  const [selectedRole, setSelectedRole] = useState<Role>('cmpdi');
  const [showPassword, setShowPassword] = useState(false);
  const [passkey, setPasskey] = useState('demo-session-2026');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const activePersona = DEMO_PERSONAS[selectedRole];

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setValidationError(null);
  };

  const handleEnterWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkey.trim()) {
      setValidationError('Please enter or preserve the demonstration passkey.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      switchRole(selectedRole);
      navigateTo('/dashboard');
      setIsLoading(false);
    }, 450);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-app)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      {/* Return to Landing Link */}
      <button
        onClick={() => navigateTo('/')}
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 500,
          zIndex: 10
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Public Overview</span>
      </button>

      {/* Main Split Container: 45% Left Information Panel, 55% Right Form Panel */}
      <div style={{
        maxWidth: '1040px',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 20px 50px -10px rgba(0,0,0,0.12)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexWrap: 'wrap',
        overflow: 'hidden'
      }}>
        {/* Left Information Panel (45%) */}
        <div style={{
          flex: '1 1 400px',
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '48px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div>
            {/* Logo and Wordmark */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
              <img
                src="/minesetu-logo.png"
                alt="MineSetu AI Logo"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  objectFit: 'contain'
                }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                    MineSetu AI
                  </span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: '#93C5FD'
                  }}>
                    PROTOTYPE
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                  MDMS Reporting Extension
                </div>
              </div>
            </div>

            <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#CBD5E1', marginBottom: '32px' }}>
              AI-assisted document processing, information discovery, review workflows, and report preparation for the coal sector.
            </p>

            {/* Three Capability Points */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#93C5FD',
                  flexShrink: 0
                }}>
                  <FileCheck size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>
                    1. Process and Verify Records
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px', lineHeight: '1.4' }}>
                    Extract structured mining returns and verify field values against source facsimiles.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#93C5FD',
                  flexShrink: 0
                }}>
                  <Search size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>
                    2. Search and Identify Gaps
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px', lineHeight: '1.4' }}>
                    Ask MineSetu retrieves verified records with citations and alerts on missing evidence.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#93C5FD',
                  flexShrink: 0
                }}>
                  <FileText size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>
                    3. Prepare Supported Reports
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px', lineHeight: '1.4' }}>
                    Compile multi-subsidiary figures into draft reports with PDF, Word, and Excel exports.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Watermark Notice */}
          <div style={{
            marginTop: '36px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            fontSize: '11px',
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldCheck size={14} style={{ color: '#93C5FD' }} />
            <span>Prototype environment · Synthetic coal-sector data</span>
          </div>
        </div>

        {/* Right Form Panel (55%) */}
        <div style={{
          flex: '1 1 480px',
          padding: '48px 40px',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Access the prototype
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Select a demo persona to explore its specific workflow and authorized sample records.
            </p>
          </div>

          {/* Validation Error Banner */}
          {validationError && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              marginBottom: '16px',
              fontSize: '12px',
              color: '#991B1B',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{validationError}</span>
            </div>
          )}

          <form onSubmit={handleEnterWorkspace}>
            {/* 4 Approved Personas Cards */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
                Select Authority Persona
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                {/* 1. Ministry of Coal */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('ministry_coal')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: selectedRole === 'ministry_coal' ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                    backgroundColor: selectedRole === 'ministry_coal' ? 'var(--accent-light)' : '#FFFFFF',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Ministry of Coal
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '10px' }}>Executive</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Cross-organisation information requests & executive report preparation
                    </div>
                  </div>
                  {selectedRole === 'ministry_coal' && (
                    <CheckCircle2 size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                  )}
                </button>

                {/* 2. CIL Headquarters */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('cil_hq')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: selectedRole === 'cil_hq' ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                    backgroundColor: selectedRole === 'cil_hq' ? 'var(--accent-light)' : '#FFFFFF',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        CIL Headquarters
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '10px' }}>Management</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Subsidiary-level consolidation, tracking submissions & follow-up
                    </div>
                  </div>
                  {selectedRole === 'cil_hq' && (
                    <CheckCircle2 size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                  )}
                </button>

                {/* 3. CMPDI */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('cmpdi')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: selectedRole === 'cmpdi' ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                    backgroundColor: selectedRole === 'cmpdi' ? 'var(--accent-light)' : '#FFFFFF',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        CMPDI (Technical Authority)
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '10px' }}>Technical</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Technical record review, evidence inspection & discrepancy clarification
                    </div>
                  </div>
                  {selectedRole === 'cmpdi' && (
                    <CheckCircle2 size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                  )}
                </button>

                {/* 4. Subsidiary / Mine Officer */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('subsidiary_officer')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: selectedRole === 'subsidiary_officer' ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                    backgroundColor: selectedRole === 'subsidiary_officer' ? 'var(--accent-light)' : '#FFFFFF',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Subsidiary / Mine Officer (ECL)
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '10px' }}>Operations</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Upload colliery documents, enter manual records & respond to requests
                    </div>
                  </div>
                  {selectedRole === 'subsidiary_officer' && (
                    <CheckCircle2 size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                  )}
                </button>
              </div>
            </div>

            {/* Active Demo Account Info */}
            <div style={{
              padding: '12px 14px',
              backgroundColor: 'var(--bg-app)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Configured Demo Identity:
                </span>
                <span className="badge badge-neutral" style={{ fontSize: '9px' }}>Synthetic ID</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {activePersona.name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {activePersona.email}
              </div>
            </div>

            {/* Masked Passkey Field with Show/Hide Toggle */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Demonstration Passkey (Fixed Session Token)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 40px 0 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-medium)',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    backgroundColor: '#FFFFFF'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)'
                  }}
                  title={showPassword ? 'Hide passkey' : 'Show passkey'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Enter Workspace Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{
                width: '100%',
                height: '42px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13.5px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isLoading ? (
                <span>Entering Workspace...</span>
              ) : (
                <>
                  <span>Enter {activePersona.roleLabel} Workspace</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Truthful Footer Note */}
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: 'var(--text-muted)' }}>
            Demo access only · No public account registration · Zero live MDMS credential transmission
          </div>
        </div>
      </div>
    </div>
  );
};
