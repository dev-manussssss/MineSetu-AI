import React, { useState } from 'react';
import { Search, Sparkles, SlidersHorizontal, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TopHeader: React.FC<{ pageTitle?: string; pageSubtitle?: string }> = ({
  pageTitle,
  pageSubtitle
}) => {
  const { currentUser, navigateTo } = useApp();
  const [searchVal, setSearchVal] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigateTo('/query');
    }
  };

  return (
    <header style={{
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '14px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '20px',
      position: 'sticky',
      top: 0,
      zIndex: 20
    }}>
      {/* Page Title & Breadcrumb */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            {pageTitle || 'MDMS Operations'}
          </h1>
          <span className="badge badge-match" style={{ fontSize: '11px', fontWeight: 600 }}>
            {currentUser.subsidiaryCode ? `${currentUser.subsidiaryCode} Scope` : 'National Scope'}
          </span>
        </div>
        {pageSubtitle && (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {pageSubtitle}
          </div>
        )}
      </div>

      {/* Pill Search (Replicating ref1.png) */}
      <form onSubmit={handleSearchSubmit} className="search-pill-container" style={{ maxWidth: '420px', flex: 1 }}>
        <Search size={16} className="search-pill-icon" />
        <input
          type="text"
          className="search-pill-input"
          placeholder="Search documents, mines, tonnages, or ask AI query..."
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
        />
      </form>

      {/* Action Controls (Replicating ref2.png pill actions) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={() => navigateTo('/query')}
          className="btn btn-primary btn-pill"
          style={{ padding: '7px 16px', fontSize: '12px' }}
        >
          <Sparkles size={14} />
          <span>Ask AI Assistant</span>
        </button>

        <button
          onClick={() => navigateTo('/documents')}
          className="btn btn-outline btn-pill"
          style={{ padding: '7px 14px', fontSize: '12px' }}
        >
          <SlidersHorizontal size={13} />
          <span>Filters</span>
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--bg-surface-muted)',
          border: '1px solid var(--border-subtle)',
          fontSize: '12px',
          color: 'var(--text-secondary)'
        }}>
          <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
          <span>Q2 / Sep 2026</span>
        </div>

        {/* User Mini Card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          paddingLeft: '8px',
          borderLeft: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-dark)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: 700
          }}>
            {currentUser.name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};
