import React, { useState } from 'react';
import {
  Cloud,
  Filter,
  Sparkles,
  RotateCcw,
  Tag,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOCK_SUBSIDIARIES } from '../data/mockMiningData';

interface KeywordTag {
  term: string;
  freq: number;
  clusterId: string;
  sentiment: 'urgent' | 'neutral' | 'positive';
}

const KEYWORD_TAGS: KeywordTag[] = [
  { term: 'Monsoon Inundation', freq: 44, clusterId: 'top-1', sentiment: 'urgent' },
  { term: 'HEMM Fleet Availability', freq: 38, clusterId: 'top-2', sentiment: 'neutral' },
  { term: 'Sump Water Drainage', freq: 34, clusterId: 'top-1', sentiment: 'urgent' },
  { term: 'Rail Rake Allocation', freq: 31, clusterId: 'top-3', sentiment: 'positive' },
  { term: 'Clean Washery Yield', freq: 24, clusterId: 'top-4', sentiment: 'urgent' },
  { term: 'Shovel-Dumper Cycle', freq: 22, clusterId: 'top-2', sentiment: 'neutral' },
  { term: 'DGMS Safety Audits', freq: 19, clusterId: 'top-5', sentiment: 'positive' },
  { term: 'FMC Silo Rapid Loading', freq: 17, clusterId: 'top-3', sentiment: 'positive' },
  { term: 'Ash Content Reduction', freq: 18, clusterId: 'top-4', sentiment: 'urgent' },
  { term: 'Highwall Slope Sensors', freq: 14, clusterId: 'top-5', sentiment: 'positive' },
  { term: 'Pit Dewatering Capacity', freq: 21, clusterId: 'top-1', sentiment: 'urgent' },
  { term: 'BOXN Rake Demurrage', freq: 16, clusterId: 'top-3', sentiment: 'positive' },
  { term: 'Night Illumination Audit', freq: 11, clusterId: 'top-5', sentiment: 'positive' },
  { term: 'Dense Media Cyclone', freq: 15, clusterId: 'top-4', sentiment: 'urgent' },
  { term: 'Dragline Availability', freq: 19, clusterId: 'top-2', sentiment: 'neutral' }
];

export const TopicsPage: React.FC = () => {
  const { topicClusters, selectTopic, navigateTo } = useApp();

  const [selectedSubsidiary, setSelectedSubsidiary] = useState<string>('ALL');
  const [selectedDocType, setSelectedDocType] = useState<string>('ALL');
  const [activeClusterId, setActiveClusterId] = useState<string>(topicClusters[0]?.id || 'top-1');

  const filteredClusters = topicClusters.filter(tc => {
    if (selectedSubsidiary !== 'ALL' && tc.subsidiaryBreakdown && !tc.subsidiaryBreakdown[selectedSubsidiary]) {
      return false;
    }
    return true;
  });

  const activeCluster = filteredClusters.find(t => t.id === activeClusterId) || filteredClusters[0];

  const handleResetFilters = () => {
    setSelectedSubsidiary('ALL');
    setSelectedDocType('ALL');
    if (topicClusters[0]) setActiveClusterId(topicClusters[0].id);
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.015em', margin: 0 }}>
              Topics & Word Cloud
            </h1>
            <span className="badge badge-neutral">Semantic Analysis</span>
            <span className="badge badge-demo">Sample Text</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '3px' }}>
            Explore recurring terms, themes, and operational remarks across selected coal-sector returns
          </p>
        </div>

        <button
          onClick={() => navigateTo('/ask')}
          className="btn btn-primary"
          style={{ height: '36px', fontSize: '13px', padding: '0 16px' }}
        >
          <Sparkles size={14} />
          <span>Ask MineSetu About Topics</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="card-base" style={{ padding: '12px 18px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Filters:</span>
            </div>

            {/* Subsidiary Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Subsidiary:</span>
              <select
                value={selectedSubsidiary}
                onChange={(e) => setSelectedSubsidiary(e.target.value)}
                style={{
                  height: '32px',
                  padding: '0 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: '#FFFFFF',
                  fontSize: '12px',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="ALL">All Subsidiaries</option>
                {MOCK_SUBSIDIARIES.map(s => (
                  <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>

            {/* Document Type */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Category:</span>
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                style={{
                  height: '32px',
                  padding: '0 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: '#FFFFFF',
                  fontSize: '12px',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="ALL">All Document Types</option>
                <option value="production">Production & Despatch</option>
                <option value="equipment">HEMM Equipment Logs</option>
                <option value="geology">Geological & Washery</option>
              </select>
            </div>

            {/* Period Indicator */}
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '12px' }}>
              Dataset: Q2 FY 2026-27 returns (5 Clusters, 15 Key Terms)
            </span>
          </div>

          <button
            onClick={handleResetFilters}
            className="btn btn-outline"
            style={{ height: '30px', fontSize: '11px', padding: '0 10px' }}
          >
            <RotateCcw size={12} />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Main Split: Left Word Cloud & Thematic Clusters, Right Topic Detail & Excerpts */}
      <div className="split-grid-14-1">
        {/* Left Column: Interactive Keyword Cloud + Thematic Clusters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Card 1: Authentic Interactive Keyword Cloud */}
          <div className="card-base" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cloud size={16} style={{ color: 'var(--accent-primary)' }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Interactive Keyword Cloud
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Sized by mention frequency in verified returns
              </span>
            </div>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              padding: '18px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              minHeight: '160px',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {KEYWORD_TAGS.map(tag => {
                const isSelected = activeCluster?.id === tag.clusterId;
                const fontSize = 12 + Math.min(4, Math.floor(tag.freq / 10));

                return (
                  <button
                    key={tag.term}
                    onClick={() => {
                      setActiveClusterId(tag.clusterId);
                      const parent = topicClusters.find(c => c.id === tag.clusterId);
                      if (parent) selectTopic(parent.name);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      fontSize: `${fontSize}px`,
                      fontWeight: isSelected ? 600 : 500,
                      borderRadius: 'var(--radius-full)',
                      border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border-medium)',
                      backgroundColor: isSelected ? 'var(--text-primary)' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      boxShadow: isSelected ? 'var(--shadow-card)' : 'none'
                    }}
                  >
                    <span>{tag.term}</span>
                    <span style={{
                      fontSize: '10px',
                      padding: '1px 5px',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--bg-surface-muted)',
                      color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                      fontVariantNumeric: 'tabular-nums'
                    }}>
                      {tag.freq}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              * Click any keyword or cluster to filter document evidence and view actual mining shift log excerpts.
            </div>
          </div>

          {/* Card 2: Thematic Cluster Ledger */}
          <div className="card-base" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag size={15} style={{ color: 'var(--accent-primary)' }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Thematic Clusters ({filteredClusters.length})
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Aggregated operational themes
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredClusters.map(topic => {
                const isSelected = activeCluster?.id === topic.id;
                return (
                  <div
                    key={topic.id}
                    onClick={() => {
                      setActiveClusterId(topic.id);
                      selectTopic(topic.name);
                    }}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? 'var(--accent-light)' : 'var(--bg-surface)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {topic.name}
                        </span>
                        <span className={`badge ${topic.sentiment === 'urgent' ? 'badge-warning' : 'badge-neutral'}`} style={{ fontSize: '10px' }}>
                          {topic.category}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <span>Mentions: <strong style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{topic.frequency}</strong></span>
                        <span>Weight: <strong style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{topic.weight}</strong></span>
                        <span>Subsidiaries: {Object.keys(topic.subsidiaryBreakdown).join(', ')}</span>
                      </div>
                    </div>
                    <ChevronRight size={16} style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)', flexShrink: 0 }} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Topic Detail & Excerpts */}
        {activeCluster ? (
          <div className="card-base" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span className={`badge ${activeCluster.sentiment === 'urgent' ? 'badge-warning' : 'badge-neutral'}`}>
                  {activeCluster.sentiment === 'urgent' ? 'Requires Attention' : 'Standard Routine'}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                  Weight: {activeCluster.weight} · Frequency: {activeCluster.frequency}
                </span>
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: '4px 0 2px' }}>
                {activeCluster.name}
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Associated Subsidiaries: <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{Object.keys(activeCluster.subsidiaryBreakdown).join(', ')}</span>
              </div>
            </div>

            {/* Supporting Remarks / Excerpts */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Sample Operational Remarks & Excerpts ({activeCluster.sampleExcerpts.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeCluster.sampleExcerpts.map((excerpt, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      borderLeft: '3px solid var(--accent-primary)',
                      fontSize: '12px'
                    }}
                  >
                    <p style={{ fontSize: '12px', color: 'var(--text-primary)', margin: '0 0 6px', lineHeight: '1.45' }}>
                      "{excerpt}"
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span>Verified Colliery Shift Log</span>
                      <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                        {Object.keys(activeCluster.subsidiaryBreakdown)[idx % Object.keys(activeCluster.subsidiaryBreakdown).length] || 'CIL'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action to Inquire in Ask MineSetu */}
            <button
              onClick={() => {
                navigateTo('/ask');
              }}
              className="btn btn-primary"
              style={{ width: '100%', height: '36px', fontSize: '13px', justifyContent: 'center' }}
            >
              <Sparkles size={14} />
              <span>Inquire in Ask MineSetu</span>
            </button>
          </div>
        ) : (
          <div className="card-base" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            Select a topic or keyword to view verified document excerpts.
          </div>
        )}
      </div>
    </div>
  );
};

