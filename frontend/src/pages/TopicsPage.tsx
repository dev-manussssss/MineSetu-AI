import React, { useState } from 'react';
import { Cloud, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { TopicCluster } from '../types';

export const TopicsPage: React.FC = () => {
  const { topicClusters, selectTopic, navigateTo } = useApp();
  const [activeClusterId, setActiveClusterId] = useState<string>(topicClusters[0].id);

  const activeCluster = topicClusters.find(t => t.id === activeClusterId) || topicClusters[0];

  // Colors for word cloud pills
  const getPillStyle = (topic: TopicCluster) => {
    const isSelected = activeClusterId === topic.id;
    const baseFontSize = Math.max(13, Math.min(24, 12 + topic.weight / 6));
    
    if (isSelected) {
      return {
        fontSize: `${baseFontSize}px`,
        backgroundColor: 'var(--bg-dark)',
        color: '#FFFFFF',
        border: '1px solid var(--bg-dark)',
        fontWeight: 700,
      };
    }

    if (topic.sentiment === 'urgent') {
      return {
        fontSize: `${baseFontSize}px`,
        backgroundColor: '#FEF2F2',
        color: '#991B1B',
        border: '1px solid #FECACA',
        fontWeight: 600,
      };
    }

    if (topic.sentiment === 'positive') {
      return {
        fontSize: `${baseFontSize}px`,
        backgroundColor: '#ECFDF5',
        color: '#065F46',
        border: '1px solid #A7F3D0',
        fontWeight: 600,
      };
    }

    return {
      fontSize: `${baseFontSize}px`,
      backgroundColor: '#F8FAFC',
      color: '#334155',
      border: '1px solid #E2E8F0',
      fontWeight: 500,
    };
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Topic Intelligence & Word Cloud
          </h1>
          <span className="badge badge-match">SIH Module 2</span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
          Semantic theme clustering across unstructured shift remarks, inspection logs, and statutory DGMS returns
        </p>
      </div>

      {/* Main Interactive Word Cloud Container */}
      <div className="card-base" style={{ padding: '28px', marginBottom: '28px', backgroundColor: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cloud size={18} style={{ color: 'var(--accent-primary)' }} />
            <h2 style={{ fontSize: '15px', fontWeight: 700 }}>Interactive Theme Cloud</h2>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Click any term to inspect subsidiary breakdown and source excerpts
          </span>
        </div>

        {/* Word Cloud Surface */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '32px 16px',
          backgroundColor: 'var(--bg-app)',
          borderRadius: 'var(--radius-lg)',
          minHeight: '180px'
        }}>
          {topicClusters.map(topic => (
            <button
              key={topic.id}
              onClick={() => {
                setActiveClusterId(topic.id);
                selectTopic(topic.name);
              }}
              style={{
                ...getPillStyle(topic),
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all var(--transition-fast)'
              }}
            >
              <span>{topic.name}</span>
              <span style={{
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: '10px',
                backgroundColor: activeClusterId === topic.id ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)'
              }}>
                {topic.frequency}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Detailed Cluster Inspection & Subsidiary Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        {/* Left: Selected Topic Excerpts */}
        <div className="card-base">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Active Topic Cluster
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                {activeCluster.name}
              </h3>
            </div>
            <span className={`badge ${
              activeCluster.sentiment === 'urgent' ? 'badge-warning' : 'badge-success'
            }`}>
              {activeCluster.frequency} Mentions • {activeCluster.sentiment.toUpperCase()}
            </span>
          </div>

          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Synthesized Field Observations & Excerpts:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeCluster.sampleExcerpts.map((excerpt, idx) => (
              <div key={idx} style={{
                padding: '12px',
                backgroundColor: 'var(--bg-surface-muted)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                lineHeight: '1.5',
                color: 'var(--text-primary)',
                borderLeft: '3px solid var(--accent-primary)'
              }}>
                "{excerpt}"
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Source-grounded in operational returns
            </span>
            <button
              onClick={() => navigateTo('/query')}
              className="btn btn-outline btn-pill"
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              <span>Ask AI About This Topic</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* Right: Subsidiary Breakdown Chart & Distribution */}
        <div className="card-base">
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>
            Cross-Subsidiary Mention Frequency
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {Object.entries(activeCluster.subsidiaryBreakdown).map(([subCode, count]) => {
              const maxCount = Math.max(...Object.values(activeCluster.subsidiaryBreakdown));
              const percent = (count / maxCount) * 100;

              return (
                <div key={subCode}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{subCode}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} occurrences</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    backgroundColor: '#E2E8F0',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${percent}%`,
                      height: '100%',
                      backgroundColor: 'var(--accent-primary)',
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
