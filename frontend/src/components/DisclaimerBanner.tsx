import React from 'react';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DisclaimerBanner: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <aside
      aria-label="Prototype Notice"
      className="disclaimer-banner"
      style={{
        backgroundColor: '#FFFBEB',
        borderBottom: '1px solid #FDE68A',
        padding: '7px 24px',
        fontSize: '12px',
        lineHeight: '1.4',
        color: '#78350F',
        position: 'relative',
        zIndex: 40
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <AlertCircle size={14} style={{ color: '#D97706', flexShrink: 0 }} />
        <span style={{ fontWeight: 500 }}>
          MineSetu AI demonstrates a proposed AI-powered extension to the MDMS reporting workflow. This is a standalone prototype, not the official MDMS portal, and live integration is not currently claimed.
        </span>
      </div>
      <button
        onClick={() => navigateTo('/settings')}
        style={{
          background: 'none',
          border: 'none',
          color: '#B45309',
          cursor: 'pointer',
          fontWeight: 500,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px',
          fontSize: '11px',
          padding: 0,
          whiteSpace: 'nowrap'
        }}
        title="View prototype configuration and demo settings"
      >
        <span>Demo Scope & Status</span>
        <ChevronRight size={12} />
      </button>
    </aside>
  );
};
