import React, { useState } from 'react';
import {
  RotateCcw,
  Database,
  Search,
  Server,
  Cpu
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ROLE_PERMISSIONS, DEMO_PERSONAS } from '../lib/rbac';
import type { Role } from '../types';

export const AdminPage: React.FC = () => {
  const { auditLogs, resetDatasetToDefaults } = useApp();
  const [activeTab, setActiveTab] = useState<'audit' | 'roles' | 'system'>('audit');
  const [auditSearch, setAuditSearch] = useState('');

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
    if (confirm('Warning: This will restore all synthetic records, documents, and queries to factory baseline. Proceed?')) {
      resetDatasetToDefaults();
      alert('Synthetic dataset successfully reseeded.');
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
              System Administration & Audit Governance
            </h1>
            <span className="badge badge-demo">Restricted</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Immutable audit logging, service health monitoring, and RBAC matrix controls
          </p>
        </div>

        <button
          onClick={handleReset}
          className="btn btn-outline"
          style={{ color: '#DC2626', borderColor: '#FECACA', fontSize: '12px' }}
        >
          <RotateCcw size={14} />
          <span>Reset Synthetic Dataset</span>
        </button>
      </div>

      {/* Pill Navigation Tabs */}
      <div className="pill-tabs-bar" style={{ marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pill-tab ${activeTab === 'audit' ? 'active' : ''}`}
        >
          Audit Event Ledger ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`pill-tab ${activeTab === 'roles' ? 'active' : ''}`}
        >
          RBAC Permissions Matrix
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`pill-tab ${activeTab === 'system' ? 'active' : ''}`}
        >
          Service Health & AI Gateway
        </button>
      </div>

      {/* Tab 1: Audit Log Ledger */}
      {activeTab === 'audit' && (
        <div>
          <div className="card-base" style={{ padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search audit trail by actor, action, or entity..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '13px',
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>

          <div className="table-container">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor Persona</th>
                  <th>Action Trigger</th>
                  <th>Target Entity</th>
                  <th>Result</th>
                  <th>Metadata Context</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleTimeString()} ({new Date(log.timestamp).toLocaleDateString()})
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.actorName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.actorRole}</div>
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: 'var(--bg-app)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', fontWeight: 600 }}>{log.entityType}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.entityId}</div>
                    </td>
                    <td>
                      <span className={`badge ${
                        log.result === 'success' ? 'badge-success' :
                        log.result === 'denied' ? 'badge-error' : 'badge-warning'
                      }`}>
                        {log.result.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      {JSON.stringify(log.metadata)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: RBAC Matrix */}
      {activeTab === 'roles' && (
        <div className="card-base" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
            Authority & Permissions Matrix
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Centralized policy registry mapping granular permissions to the 7 prototype personas.
          </p>

          <div className="table-container">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Role Identifier</th>
                  <th>Department / Focus</th>
                  <th>Granted Permissions</th>
                </tr>
              </thead>
              <tbody>
                {(Object.keys(ROLE_PERMISSIONS) as Role[]).map(r => (
                  <tr key={r}>
                    <td>
                      <strong>{DEMO_PERSONAS[r].roleLabel}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{r}</div>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {DEMO_PERSONAS[r].department}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {ROLE_PERMISSIONS[r].map(perm => (
                          <span key={perm} className="badge" style={{ backgroundColor: '#F1F5F9', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                            {perm}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: System & AI Service Health */}
      {activeTab === 'system' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="card-base">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', marginBottom: '12px' }}>
              <Cpu size={20} />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Grok 2 / xAI Inference Gateway</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Primary API Key:</span>
                <span className="badge badge-success">Standby / Ready</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Fallback API Key:</span>
                <span className="badge badge-info">Configured</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Security Envelope:</span>
                <span style={{ fontWeight: 600 }}>Edge Secrets Isolated</span>
              </div>
            </div>
          </div>

          <div className="card-base">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3B82F6', marginBottom: '12px' }}>
              <Database size={20} />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Supabase PostgreSQL & RLS</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>RLS Policies:</span>
                <span className="badge badge-success">Active & Enforced</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Storage Bucket:</span>
                <span style={{ fontWeight: 600 }}>documents-raw (Immutable)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Audit Triggers:</span>
                <span style={{ fontWeight: 600 }}>Append-Only</span>
              </div>
            </div>
          </div>

          <div className="card-base">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F59E0B', marginBottom: '12px' }}>
              <Server size={20} />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Vercel Edge Distribution</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Build Mode:</span>
                <span style={{ fontWeight: 600 }}>Vite Single Page App</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Demo Mock Mode:</span>
                <span className="badge badge-demo">Active</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Latency Baseline:</span>
                <span style={{ fontWeight: 600 }}>&lt; 40ms local</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
