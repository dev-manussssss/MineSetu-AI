import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Bell,
  CheckCircle2,
  Calendar,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TopHeader: React.FC<{
  pageTitle?: string;
  pageSubtitle?: string;
  onOpenMobileMenu?: () => void;
}> = ({
  pageTitle,
  pageSubtitle,
  onOpenMobileMenu
}) => {
  const {
    currentUser,
    navigateTo,
    notifications,
    markNotificationAsRead,
    isNotificationsOpen,
    setIsNotificationsOpen,
    globalSearchQuery,
    setGlobalSearchQuery
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearchQuery.trim()) {
      navigateTo('/ask');
    }
  };

  return (
    <header
      className="top-header"
      style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 30
      }}
    >
      {/* Left: Mobile Toggle & Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="btn btn-outline mobile-menu-btn"
            style={{ padding: '6px', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Toggle Navigation Drawer"
          >
            <Menu size={18} />
          </button>
        )}

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em', margin: 0 }}>
              {pageTitle || 'MDMS Operations'}
            </h1>
            <span className="badge badge-neutral" style={{ fontSize: '11px', fontWeight: 500 }}>
              {currentUser.subsidiaryCode ? `${currentUser.subsidiaryCode} Scope` : 'National Scope'}
            </span>
          </div>
          {pageSubtitle && (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {pageSubtitle}
            </div>
          )}
        </div>
      </div>

      {/* Center: Search Pill */}
      <form onSubmit={handleSearchSubmit} className="search-pill-container header-search-container" style={{ maxWidth: '360px', flex: 1, minWidth: 0 }}>
        <Search size={14} className="search-pill-icon" />
        <input
          type="text"
          className="search-pill-input"
          placeholder="Search records, tonnages, or ask AI..."
          value={globalSearchQuery}
          onChange={(e) => setGlobalSearchQuery(e.target.value)}
        />
      </form>

      {/* Right Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
        <button
          onClick={() => navigateTo('/ask')}
          className="btn btn-primary header-ask-btn"
          style={{ height: '34px', padding: '0 12px', fontSize: '12px', borderRadius: 'var(--radius-sm)' }}
        >
          <Sparkles size={13} />
          <span>Ask MineSetu</span>
        </button>

        {/* Date Filter Badge */}
        <div className="header-date-badge" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--bg-surface-muted)',
          border: '1px solid var(--border-subtle)',
          fontSize: '11px',
          color: 'var(--text-secondary)'
        }}>
          <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
          <span>FY 2026-27</span>
        </div>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="btn btn-outline"
            style={{
              padding: '8px',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
            title="Demonstration Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                fontSize: '10px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotificationsOpen && (
            <div style={{
              position: 'absolute',
              top: '46px',
              right: 0,
              width: '320px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              border: '1px solid var(--border-subtle)',
              zIndex: 60,
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--bg-surface-muted)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Event Notifications
                  </span>
                  <span className="badge badge-demo">Simulated</span>
                </div>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={15} />
                </button>
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                    No notifications in this session.
                  </div>
                ) : (
                  notifications.map(item => (
                    <div
                      key={item.id}
                      onClick={() => markNotificationAsRead(item.id)}
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: item.read ? '#FFFFFF' : 'var(--accent-light)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {item.title}
                        </span>
                        {!item.read && (
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }} />
                        )}
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                        {item.message}
                      </p>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Mini Avatar & Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-dark)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700
            }}>
              {currentUser.name.charAt(0)}
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {currentUser.name.split(' ')[0]}
            </span>
          </button>

          {isUserMenuOpen && (
            <div style={{
              position: 'absolute',
              top: '42px',
              right: 0,
              width: '240px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              border: '1px solid var(--border-subtle)',
              padding: '12px',
              zIndex: 60
            }}>
              <div style={{ paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {currentUser.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {currentUser.roleLabel}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--accent-primary)', marginTop: '2px', fontWeight: 600 }}>
                  {currentUser.email}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigateTo('/settings');
                  }}
                  className="btn btn-outline"
                  style={{ width: '100%', fontSize: '11px', padding: '6px', justifyContent: 'flex-start' }}
                >
                  <ExternalLink size={12} /> Preferences & Reset
                </button>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigateTo('/login');
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%', fontSize: '11px', padding: '6px', justifyContent: 'center' }}
                >
                  <CheckCircle2 size={12} /> Switch Persona
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
