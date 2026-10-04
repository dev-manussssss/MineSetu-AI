import React, { useState } from 'react';
import {
  UserCheck,
  RotateCcw,
  CheckCircle2,
  HardDrive,
  LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsPage: React.FC = () => {
  const { currentUser, navigateTo, resetDatasetToDefaults } = useApp();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleReset = () => {
    if (confirm('Warning: This will restore all synthetic records, documents, and requests to default demonstration state. Proceed?')) {
      resetDatasetToDefaults();
      showToast('Local demonstration state reseeded to defaults.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 100,
          fontSize: '13px'
        }}>
          <CheckCircle2 size={16} style={{ color: '#10B981' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Workspace Settings & Demonstration Preferences
          </h1>
          <span className="badge badge-neutral">Local Configuration</span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Manage your active persona, inspect demonstration persistence state, and reset sample data
        </p>
      </div>

      {/* Card 1: Active Demo Profile */}
      <div className="card-base" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-dark)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '16px'
            }}>
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {currentUser.name}
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {currentUser.roleLabel}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigateTo('/login')}
            className="btn btn-outline"
            style={{ fontSize: '12px' }}
          >
            <UserCheck size={13} />
            <span>Switch Persona</span>
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          padding: '16px',
          backgroundColor: 'var(--bg-app)',
          borderRadius: 'var(--radius-md)',
          fontSize: '12px'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>
              Assigned Department
            </span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {currentUser.department}
            </span>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>
              Synthetic Demo Email
            </span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {currentUser.email}
            </span>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>
              Scope & Jurisdiction
            </span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {currentUser.subsidiaryCode ? `${currentUser.subsidiaryCode} Regional Scope` : 'National Executive Scope'}
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: Demonstration Data Persistence Status */}
      <div className="card-base" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <HardDrive size={18} style={{ color: 'var(--accent-primary)' }} />
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Demonstration State Storage
          </h2>
        </div>
        <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          All prototype mutations (document uploads, field-level corrections, information requests, and generated reports) are stored securely in browser <code>localStorage</code>. No confidential government documents or credentials are ever sent to an external server.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '6px', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Reset Prototype Data to Factory Baseline
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Clears locally modified returns, drafts, and resets to the default synthetic Coal India dataset.
            </div>
          </div>
          <button
            onClick={handleReset}
            className="btn btn-outline"
            style={{ fontSize: '12px', color: '#DC2626', borderColor: '#FECACA' }}
          >
            <RotateCcw size={13} />
            <span>Reset Dataset</span>
          </button>
        </div>
      </div>

      {/* Card 3: Session Controls */}
      <div className="card-base" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Sign Out of Demonstration Session
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Returns to the public prototype entrance and role selection screen.
            </div>
          </div>
          <button
            onClick={() => navigateTo('/login')}
            className="btn btn-primary"
            style={{ fontSize: '12px' }}
          >
            <LogOut size={14} />
            <span>Sign Out / Switch</span>
          </button>
        </div>
      </div>
    </div>
  );
};
