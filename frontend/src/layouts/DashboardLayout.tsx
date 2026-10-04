import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { TopHeader } from '../components/TopHeader';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

export const DashboardLayout: React.FC<{
  pageTitle?: string;
  pageSubtitle?: string;
  children: React.ReactNode;
}> = ({ pageTitle, pageSubtitle, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
      {/* Institutional Disclaimer Banner across all pages */}
      <DisclaimerBanner />

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Left Navigation Sidebar */}
        <Sidebar
          isOpenOnMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          <TopHeader
            pageTitle={pageTitle}
            pageSubtitle={pageSubtitle}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          />
          <main className="dashboard-main" style={{ flex: 1, padding: '24px 28px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
