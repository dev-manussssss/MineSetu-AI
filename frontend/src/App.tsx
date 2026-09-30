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
import { ParliamentaryDeskPage } from './pages/ParliamentaryDeskPage';
import { AdminPage } from './pages/AdminPage';
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
          <DashboardLayout pageTitle="Operational Overview" pageSubtitle="Real-time multi-subsidiary monitoring and extraction tracking">
            <DashboardPage />
          </DashboardLayout>
        );

      case '/documents':
        if (!can(currentUser, 'documents.view')) return <AccessDenied route="Documents" />;
        return (
          <DashboardLayout pageTitle="Document Ingestion & Archive" pageSubtitle="Digital archive and optical recognition queue">
            <DocumentsPage />
          </DashboardLayout>
        );

      case '/documents/verify':
        if (!can(currentUser, 'documents.verify') && !can(currentUser, 'documents.view')) {
          return <AccessDenied route="Validation Workbench" />;
        }
        return (
          <DashboardLayout pageTitle="Extraction & Validation Workbench" pageSubtitle="Human-in-the-loop verification of parsed operational records">
            <ValidationWorkbenchPage />
          </DashboardLayout>
        );

      case '/compare':
        if (!can(currentUser, 'documents.approve') && !can(currentUser, 'documents.view')) {
          return <AccessDenied route="Document Compare" />;
        }
        return (
          <DashboardLayout pageTitle="Document & Baseline Compare" pageSubtitle="Evaluate field-level variances against historical baselines">
            <ComparePage />
          </DashboardLayout>
        );

      case '/topics':
        if (!can(currentUser, 'topic.analyze')) return <AccessDenied route="Topic Intelligence" />;
        return (
          <DashboardLayout pageTitle="Topic Intelligence & Word Cloud" pageSubtitle="Semantic cluster analysis of operational remarks and logs">
            <TopicsPage />
          </DashboardLayout>
        );

      case '/query':
        if (!can(currentUser, 'queries.execute')) return <AccessDenied route="AI Query" />;
        return (
          <DashboardLayout pageTitle="Grounded AI Query (RAG)" pageSubtitle="Multi-subsidiary question answering strictly grounded in verified sources">
            <QueryPage />
          </DashboardLayout>
        );

      case '/reports':
        if (!can(currentUser, 'reports.generate')) return <AccessDenied route="Automated Reports" />;
        return (
          <DashboardLayout pageTitle="Automated Report Builder" pageSubtitle="Compile verified operational returns into executive briefs with citations">
            <ReportsPage />
          </DashboardLayout>
        );

      case '/parliamentary':
        if (!can(currentUser, 'parliamentary.draft') && !can(currentUser, 'parliamentary.approve')) {
          return <AccessDenied route="Parliamentary Desk" />;
        }
        return (
          <DashboardLayout pageTitle="Parliamentary Response Desk" pageSubtitle="Drafting and ministerial review for legislative questions">
            <ParliamentaryDeskPage />
          </DashboardLayout>
        );

      case '/admin':
        if (!can(currentUser, 'admin.users') && !can(currentUser, 'audit.view')) {
          return <AccessDenied route="System Administration" />;
        }
        return (
          <DashboardLayout pageTitle="System Administration & Audit" pageSubtitle="Audit trails, RBAC permissions, and AI gateway monitoring">
            <AdminPage />
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
          Your current persona (<strong>{currentUser.roleLabel}</strong>) does not have authorization to view this module. In accordance with MDMS RBAC policies, this action has been logged in the audit trail.
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
