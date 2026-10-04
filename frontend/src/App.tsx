import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { ValidationWorkbenchPage } from './pages/ValidationWorkbenchPage';
import { ComparePage } from './pages/ComparePage';
import { TopicsPage } from './pages/TopicsPage';
import { QueryPage } from './pages/QueryPage';
import { ReportsPage } from './pages/ReportsPage';
import { RequestsPage } from './pages/RequestsPage';
import { AdminPage } from './pages/AdminPage';
import { SettingsPage } from './pages/SettingsPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { can } from './lib/rbac';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const RouteDispatcher: React.FC = () => {
  const { currentRoute, currentUser } = useApp();

  // Public Landing Page
  if (currentRoute === '/' || currentRoute === '') {
    return <LandingPage />;
  }

  // Public/Demo Login Page
  if (currentRoute === '/login') {
    return <LoginPage />;
  }

  // Protected Routes within DashboardLayout
  const renderProtectedContent = () => {
    switch (currentRoute) {
      case '/dashboard':
        return (
          <DashboardLayout
            pageTitle="Operational Dashboard"
            pageSubtitle="Multi-subsidiary tracking, extraction queue, and executive briefing"
          >
            <DashboardPage />
          </DashboardLayout>
        );

      case '/ask':
      case '/query':
        if (!can(currentUser, 'queries.execute')) return <AccessDenied route="Ask MineSetu" />;
        return (
          <DashboardLayout
            pageTitle="Ask MineSetu"
            pageSubtitle="Source-grounded inquiry assistant with mandatory evidence citations"
          >
            <QueryPage />
          </DashboardLayout>
        );

      case '/documents':
      case '/documents/manual':
        if (!can(currentUser, 'documents.view') && !can(currentUser, 'manual.entry')) {
          return <AccessDenied route="Documents" />;
        }
        return (
          <DashboardLayout
            pageTitle="Documents & Ingestion"
            pageSubtitle="Dual ingestion pipeline: Scanned PDF upload and first-class manual data entry"
          >
            <DocumentsPage />
          </DashboardLayout>
        );

      case '/documents/verify':
        if (!can(currentUser, 'documents.verify') && !can(currentUser, 'documents.view')) {
          return <AccessDenied route="Validation Workbench" />;
        }
        return (
          <DashboardLayout
            pageTitle="Validation Workbench"
            pageSubtitle="Human-in-the-loop verification of parsed figures against source facsimiles"
          >
            <ValidationWorkbenchPage />
          </DashboardLayout>
        );

      case '/requests':
      case '/parliamentary':
        return (
          <DashboardLayout
            pageTitle="Information Requests"
            pageSubtitle="Cross-organisation requests, subsidiary responses, and clarification threads"
          >
            <RequestsPage />
          </DashboardLayout>
        );

      case '/review':
      case '/compare':
        return (
          <DashboardLayout
            pageTitle="Review Queue & Variance"
            pageSubtitle="Multi-stage submission review and baseline comparison"
          >
            <ComparePage />
          </DashboardLayout>
        );

      case '/reports':
        if (!can(currentUser, 'reports.generate')) return <AccessDenied route="Reports" />;
        return (
          <DashboardLayout
            pageTitle="Automated Report Builder"
            pageSubtitle="Compile verified operational returns into executive briefs with citations"
          >
            <ReportsPage />
          </DashboardLayout>
        );

      case '/topics':
        if (!can(currentUser, 'topic.analyze')) return <AccessDenied route="Topics & Word Cloud" />;
        return (
          <DashboardLayout
            pageTitle="Topics & Word Cloud"
            pageSubtitle="Semantic analysis and recurring operational themes across returns"
          >
            <TopicsPage />
          </DashboardLayout>
        );

      case '/activity':
      case '/admin':
        if (!can(currentUser, 'audit.view')) return <AccessDenied route="Activity History" />;
        return (
          <DashboardLayout
            pageTitle="Activity History"
            pageSubtitle="Session activity event ledger and role permissions reference"
          >
            <AdminPage />
          </DashboardLayout>
        );

      case '/settings':
        return (
          <DashboardLayout
            pageTitle="Settings & Preferences"
            pageSubtitle="Demonstration persona management and local dataset controls"
          >
            <SettingsPage />
          </DashboardLayout>
        );

      default:
        return (
          <DashboardLayout pageTitle="Overview">
            <DashboardPage />
          </DashboardLayout>
        );
    }
  };

  return renderProtectedContent();
};

const AccessDenied: React.FC<{ route: string }> = ({ route }) => {
  const { currentUser, navigateTo } = useApp();

  return (
    <DashboardLayout pageTitle="Access Denied">
      <div className="card-base" style={{ textAlign: 'center', padding: '60px 24px', maxWidth: '600px', margin: '40px auto' }}>
        <ShieldAlert size={48} style={{ color: '#DC2626', margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Access Restricted: {route}
        </h2>
        <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Your current persona (<strong>{currentUser.roleLabel}</strong>) does not have authorization to view this module. In accordance with MDMS RBAC policies, this action has been recorded in the session activity history.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button
            onClick={() => navigateTo('/dashboard')}
            className="btn btn-outline"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <button
            onClick={() => navigateTo('/login')}
            className="btn btn-primary"
          >
            Switch to Authorized Persona
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <RouteDispatcher />
    </AppProvider>
  );
}
