import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DisclaimerBanner: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <aside aria-label="Prototype Notice" style={{
      background: '#FFFBEB',
      borderBottom: '1px solid #FDE68A',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      fontSize: '12px',
      color: '#92400E',
      position: 'relative',
      zIndex: 40
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          background: '#F59E0B',
          color: '#FFFFFF',
          padding: '2px 6px',
          borderRadius: '4px',
          fontWeight: 700,
          fontSize: '10px',
          letterSpacing: '0.04em'
        }}>
          <AlertTriangle size={12} /> PROTOTYPE
        </span>
        <span style={{ fontWeight: 600 }}>MDMS + Mindsetu AI Extension Concept:</span>
        <span>Demonstration prototype for research and evaluation. Not an official Government of India, MoC, CIL, or CMPDI production system. All data synthetic.</span>
      </div>
      <button
        onClick={() => navigateTo('/admin')}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#B45309',
          cursor: 'pointer',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '11px',
          textDecoration: 'underline'
        }}
      >
        <span>View Scope & Health</span>
        <ExternalLink size={12} />
      </button>
    </aside>
  );
};
