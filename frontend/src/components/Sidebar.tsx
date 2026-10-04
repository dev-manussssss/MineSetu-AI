import React from 'react';
import {
  LayoutDashboard,
  Files,
  CheckSquare,
  GitCompare,
  Cloud,
  MessageSquareText,
  FileText,
  Landmark,
  ShieldAlert,
  ChevronRight,
  LogOut,
  UserCheck,
  Sparkles,
  Edit3,
  Clock,
  Settings
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getNavigationForRole } from '../lib/rbac';

export const Sidebar: React.FC<{ isOpenOnMobile?: boolean; onCloseMobile?: () => void }> = ({
  isOpenOnMobile = false,
  onCloseMobile
}) => {
  const { currentUser, currentRoute, navigateTo } = useApp();
  const navItems = getNavigationForRole(currentUser);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutDashboard': return <LayoutDashboard size={18} strokeWidth={1.8} />;
      case 'Sparkles': return <Sparkles size={18} strokeWidth={1.8} />;
      case 'Files': return <Files size={18} strokeWidth={1.8} />;
      case 'Edit3': return <Edit3 size={18} strokeWidth={1.8} />;
      case 'MessageSquareText': return <MessageSquareText size={18} strokeWidth={1.8} />;
      case 'CheckSquare': return <CheckSquare size={18} strokeWidth={1.8} />;
      case 'FileText': return <FileText size={18} strokeWidth={1.8} />;
      case 'GitCompare': return <GitCompare size={18} strokeWidth={1.8} />;
      case 'Cloud': return <Cloud size={18} strokeWidth={1.8} />;
      case 'Clock': return <Clock size={18} strokeWidth={1.8} />;
      case 'Landmark': return <Landmark size={18} strokeWidth={1.8} />;
      case 'ShieldAlert': return <ShieldAlert size={18} strokeWidth={1.8} />;
      case 'Settings': return <Settings size={18} strokeWidth={1.8} />;
      default: return <Files size={18} strokeWidth={1.8} />;
    }
  };

  const handleNavClick = (path: string) => {
    navigateTo(path);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenOnMobile && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            zIndex: 45
          }}
        />
      )}

      <aside
        className={`app-sidebar ${isOpenOnMobile ? 'mobile-open' : ''}`}
      >
        {/* Brand Header with Authentic MineSetu Logo */}
        <div style={{
          padding: '18px 20px 14px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <img
            src="/minesetu-logo.png"
            alt="MineSetu AI Emblem"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              objectFit: 'contain',
              flexShrink: 0
            }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                MineSetu
              </span>
              <span style={{
                fontSize: '10px',
                fontWeight: 600,
                backgroundColor: 'var(--accent-light)',
                color: 'var(--accent-primary)',
                padding: '1px 6px',
                borderRadius: '4px',
                border: '1px solid var(--accent-border)'
              }}>
                AI
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              MDMS Reporting Extension
            </div>
          </div>
        </div>

        {/* Role Watermark Card */}
        <div style={{
          margin: '14px 14px 6px',
          padding: '12px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--bg-surface-muted)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Persona
            </span>
            <span className="badge badge-neutral">
              DEMO
            </span>
          </div>
          <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.3' }}>
            {currentUser.roleLabel}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.3' }}>
            {currentUser.department}
          </div>
          <button
            onClick={() => handleNavClick('/login')}
            style={{
              marginTop: '10px',
              width: '100%',
              padding: '6px 8px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '6px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-medium)',
              color: 'var(--accent-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all var(--transition-fast)'
            }}
          >
            <UserCheck size={12} /> Switch Persona
          </button>
        </div>

        {/* Navigation List */}
        <div style={{ flex: 1, padding: '10px 12px', overflowY: 'auto' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 8px 6px' }}>
            Workspace Modules
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {navItems.map(item => {
              const isActive =
                currentRoute === item.path ||
                (item.path !== '/dashboard' && currentRoute.startsWith(item.path));
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isActive ? 'var(--bg-dark)' : 'transparent',
                    color: isActive ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <span style={{ color: isActive ? 'var(--text-inverse)' : 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    {getIcon(item.iconName)}
                  </span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span style={{
                      fontSize: '10px',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--accent-light)',
                      color: isActive ? '#FFFFFF' : 'var(--accent-primary)',
                      fontWeight: 600
                    }}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight size={13} style={{ color: 'rgba(255,255,255,0.6)' }} />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Navigation: Home & Logout */}
        <div style={{
          padding: '12px 14px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <button
            onClick={() => handleNavClick('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '6px 10px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              background: 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>←</span>
            <span>Back to Public Overview</span>
          </button>
          <button
            onClick={() => handleNavClick('/login')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '6px 10px',
              fontSize: '12px',
              color: '#DC2626',
              background: 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <LogOut size={13} />
            <span>Sign Out / Switch Persona</span>
          </button>
        </div>
      </aside>
    </>
  );
};
