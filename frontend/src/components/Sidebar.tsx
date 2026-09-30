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
  Layers,
  ChevronRight,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getNavigationForRole } from '../lib/rbac';

export const Sidebar: React.FC = () => {
  const { currentUser, currentRoute, navigateTo } = useApp();
  const navItems = getNavigationForRole(currentUser);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutDashboard': return <LayoutDashboard size={20} strokeWidth={1.8} />;
      case 'Files': return <Files size={20} strokeWidth={1.8} />;
      case 'CheckSquare': return <CheckSquare size={20} strokeWidth={1.8} />;
      case 'GitCompare': return <GitCompare size={20} strokeWidth={1.8} />;
      case 'Cloud': return <Cloud size={20} strokeWidth={1.8} />;
      case 'MessageSquareText': return <MessageSquareText size={20} strokeWidth={1.8} />;
      case 'FileText': return <FileText size={20} strokeWidth={1.8} />;
      case 'Landmark': return <Landmark size={20} strokeWidth={1.8} />;
      case 'ShieldAlert': return <ShieldAlert size={20} strokeWidth={1.8} />;
      default: return <Layers size={20} strokeWidth={1.8} />;
    }
  };

  return (
    <aside style={{
      width: '260px',
      backgroundColor: '#FFFFFF',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          backgroundColor: 'var(--bg-dark)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF'
        }}>
          <Layers size={22} strokeWidth={2.2} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              MineSetu
            </span>
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent-primary)',
              padding: '1px 6px',
              borderRadius: '4px',
              border: '1px solid var(--accent-border)'
            }}>
              AI
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
            MDMS Operational Layer
          </div>
        </div>
      </div>

      {/* Role Watermark Card */}
      <div style={{
        margin: '16px 16px 8px',
        padding: '12px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-surface-muted)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Active Persona
          </span>
          <span className="badge badge-demo">
            DEMO
          </span>
        </div>
        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
          {currentUser.roleLabel}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
          {currentUser.department}
        </div>
        <button
          onClick={() => navigateTo('/login')}
          style={{
            marginTop: '8px',
            width: '100%',
            padding: '4px 8px',
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
            gap: '4px'
          }}
        >
          <UserCheck size={12} /> Switch Role
        </button>
      </div>

      {/* Navigation List */}
      <div style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 8px 8px' }}>
          Modules & Actions
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {navItems.map(item => {
            const isActive = currentRoute === item.path || (item.path !== '/dashboard' && currentRoute.startsWith(item.path));
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '9px 12px',
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
                    fontSize: '11px',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--accent-light)',
                    color: isActive ? '#FFFFFF' : 'var(--accent-primary)',
                    fontWeight: 600
                  }}>
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.6)' }} />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation: Home & Logout */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <button
          onClick={() => navigateTo('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            padding: '8px 10px',
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
          <span>Back to Landing Page</span>
        </button>
        <button
          onClick={() => navigateTo('/login')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            padding: '8px 10px',
            fontSize: '12px',
            color: '#DC2626',
            background: 'transparent',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <LogOut size={14} />
          <span>Sign Out / Switch</span>
        </button>
      </div>
    </aside>
  );
};
