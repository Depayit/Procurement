import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProcurementProvider } from './contexts/ProcurementContext';
import { Layout } from './components/Layout';
import { OfflineIndicator } from './components/OfflineIndicator';
import { doc, getDocFromServer } from 'firebase/firestore';
import { db } from './lib/firebase';

// Route-level Code Splitting for ultra-fast initial load
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const PurchaseRequestPage = lazy(() => import('./pages/PurchaseRequest').then(m => ({ default: m.PurchaseRequestPage })));
const ApprovalPage = lazy(() => import('./pages/Approval').then(m => ({ default: m.ApprovalPage })));
const InventoryPage = lazy(() => import('./pages/Inventory').then(m => ({ default: m.InventoryPage })));
const PurchaseOrderPage = lazy(() => import('./pages/PurchaseOrder').then(m => ({ default: m.PurchaseOrderPage })));
const VendorsPage = lazy(() => import('./pages/Vendors').then(m => ({ default: m.VendorsPage })));
const SettingsPage = lazy(() => import('./pages/Settings').then(m => ({ default: m.SettingsPage })));
const ReportsPage = lazy(() => import('./pages/Reports').then(m => ({ default: m.ReportsPage })));
const UsersPage = lazy(() => import('./pages/Users').then(m => ({ default: m.UsersPage })));
const ManualPage = lazy(() => import('./pages/Manual').then(m => ({ default: m.ManualPage })));
const DataImportHub = lazy(() => import('./pages/DataImportHub').then(m => ({ default: m.DataImportHub })));
const IntegrationsPage = lazy(() => import('./pages/Integrations').then(m => ({ default: m.IntegrationsPage })));

function PageLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse p-2 sm:p-4">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-200 rounded-lg" />
          <div className="h-4 w-72 bg-slate-100 rounded" />
        </div>
        <div className="h-10 w-28 bg-slate-200 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-28 bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="h-4 w-20 bg-slate-200 rounded" />
            <div className="h-8 w-24 bg-slate-300 rounded" />
          </div>
        ))}
      </div>
      <div className="h-96 bg-white border border-slate-200 rounded-2xl p-6" />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    async function testConnection() {
      try {
        if (!db) return;
        await getDocFromServer(doc(db, 'test', 'connection')).catch(() => {
          // Expected when unauthenticated or offline
        });
      } catch {
        // Silently handle any initialization/network error
      }
    }
    testConnection();
  }, []);

  // Initialize UI display density scale across all devices
  useEffect(() => {
    try {
      const savedScale = localStorage.getItem('procuresync_ui_scale') || '100%';
      document.documentElement.style.zoom = savedScale;
      const numScale = parseFloat(savedScale) / 100;
      document.documentElement.style.setProperty('--app-zoom', String(numScale || 1));
    } catch {
      // ignore
    }
  }, []);

  return (
    <LanguageProvider>
      <NotificationProvider>
        <AuthProvider>
          <ProcurementProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={
                    <Suspense fallback={<PageLoadingSkeleton />}>
                      <Dashboard />
                    </Suspense>
                  } />
                  <Route path="pr" element={
                    <Suspense fallback={<PageLoadingSkeleton />}>
                      <PurchaseRequestPage />
                    </Suspense>
                  } />
                  <Route path="approvals" element={
                    <Suspense fallback={<PageLoadingSkeleton />}>
                      <ApprovalPage />
                    </Suspense>
                  } />
                  <Route path="inventory" element={
                    <Suspense fallback={<PageLoadingSkeleton />}>
                      <InventoryPage />
                    </Suspense>
                  } />
                  <Route path="po" element={
                    <Suspense fallback={<PageLoadingSkeleton />}>
                      <PurchaseOrderPage />
                    </Suspense>
                  } />
                  <Route path="purchase-orders" element={
                    <Suspense fallback={<PageLoadingSkeleton />}>
                      <PurchaseOrderPage />
                    </Suspense>
                  } />
                  <Route path="vendors" element={
                    <Suspense fallback={<PageLoadingSkeleton />}>
                      <VendorsPage />
                    </Suspense>
                  } />
                  <Route path="settings" element={
                    <Suspense fallback={<PageLoadingSkeleton />}>
                      <SettingsPage />
                    </Suspense>
                  } />
                  <Route path="reports" element={
                    <Suspense fallback={<PageLoadingSkeleton />}>
                      <ReportsPage />
                    </Suspense>
                  } />
                  <Route path="users" element={
                    <Suspense fallback={<PageLoadingSkeleton />}>
                      <UsersPage />
                    </Suspense>
                  } />
                  <Route path="manual" element={
                    <Suspense fallback={<PageLoadingSkeleton />}>
                      <ManualPage />
                    </Suspense>
                  } />
                  <Route path="import" element={
                    <Suspense fallback={<PageLoadingSkeleton />}>
                      <DataImportHub />
                    </Suspense>
                  } />
                  <Route path="integrations" element={
                    <Suspense fallback={<PageLoadingSkeleton />}>
                      <IntegrationsPage />
                    </Suspense>
                  } />
                  <Route path="*" element={
                    <div className="flex flex-col items-center justify-center h-full text-center py-20">
                      <h2 className="text-xl font-bold text-slate-800">Coming Soon / เร็วๆ นี้</h2>
                      <p className="text-slate-500 mt-2">Under active development / ฟีเจอร์นี้กำลังอยู่ระหว่างการพัฒนา</p>
                    </div>
                  } />
                </Route>
              </Routes>
              <OfflineIndicator />
            </BrowserRouter>
          </ProcurementProvider>
        </AuthProvider>
      </NotificationProvider>
    </LanguageProvider>
  );
}
