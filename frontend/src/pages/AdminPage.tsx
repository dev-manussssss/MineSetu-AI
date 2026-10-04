import React, { useState } from 'react';
import {
  RotateCcw,
  Search,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ROLE_PERMISSIONS } from '../lib/rbac';
import type { Role } from '../types';

export const AdminPage: React.FC = () => {
  const { auditLogs, resetDatasetToDefaults, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'activity' | 'roles'>('activity');
  const [auditSearch, setAuditSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredLogs = auditLogs.filter(log => {
    if (!auditSearch.trim()) return true;
    const q = auditSearch.toLowerCase();
    return (
      log.actorName.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.entityType.toLowerCase().includes(q)
    );
  });

  const handleReset = () => {
    if (confirm('Warning: This will restore all synthetic records, documents, and requests to default demonstration state. Proceed?')) {
      resetDatasetToDefaults();
      showToast('Demonstration dataset restored to factory defaults.');
    }
  };

  return (
    <div>
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

      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Activity History & Demonstration Controls
            </h1>
            <span className="badge badge-demo">Local Event Ledger</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Demonstration event tracking, role permissions overview, and local dataset state controls
          </p>
        </div>

        <button
          onClick={handleReset}
          className="btn btn-outline"
          style={{ fontSize: '12px', padding: '8px 16px', color: '#DC2626', borderColor: '#FECACA' }}
        >
          <RotateCcw size={14} />
          <span>Reset Demonstration Dataset</span>
        </button>
      </div>

      {/* Primary Tab Navigation */}
      <div className="pill-tabs-bar" style={{ marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('activity')}
          className={`pill-tab ${activeTab === 'activity' ? 'active' : ''}`}
        >
          Session Activity History ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`pill-tab ${activeTab === 'roles' ? 'active' : ''}`}
        >
          Role Permissions Matrix
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ACTIVITY HISTORY                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'activity' && (
        <div className="card-base" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Filter events by action, actor, or entity..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                style={{ width: '100%', height: '34px', padding: '0 10px 0 32px', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontSize: '12px' }}
              />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Note: Client-side demonstration event history · Not a legal audit log
            </span>
          </div>

          <div className="table-responsive">
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-medium)', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 16px' }}>Timestamp</th>
                  <th style={{ padding: '10px 16px' }}>Actor & Persona</th>
                  <th style={{ padding: '10px 16px' }}>Action Triggered</th>
                  <th style={{ padding: '10px 16px' }}>Target Entity</th>
                  <th style={{ padding: '10px 16px', textAlign: 'right' }}>Result</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '12px' }}>
                {filteredLogs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                      {log.actorName}
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>
                        {log.actorRole}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--accent-primary)', fontWeight: 600 }}>
                      {log.action}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {log.entityType} ({log.entityId.substring(0, 16)})
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <span className={`badge ${log.result === 'success' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '10px' }}>
                        {log.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: RBAC MATRIX OVERVIEW                                              */}
      {/* ========================================================================= */}
      {activeTab === 'roles' && (
        <div className="card-base" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Prototype Role Permissions Reference
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Functional access control capabilities mapped to each demonstration persona
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {(['ministry_coal', 'cil_hq', 'cmpdi', 'subsidiary_officer'] as Role[]).map(roleKey => {
              const perms = ROLE_PERMISSIONS[roleKey] || [];
              const isCurrent = currentUser.role === roleKey;
              return (
                <div
                  key={roleKey}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: isCurrent ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                    backgroundColor: isCurrent ? 'var(--accent-light)' : 'var(--bg-app)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                      {roleKey.replace('_', ' ').toUpperCase()}
                    </strong>
                    {isCurrent && <span className="badge badge-match">Active</span>}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    {perms.length} Granted Permissions
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {perms.map(p => (
                      <span key={p} style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        ✓ {p}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
