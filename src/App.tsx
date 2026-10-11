import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { PurchaseRequestPage } from './pages/PurchaseRequest';
import { ApprovalPage } from './pages/Approval';
import { InventoryPage } from './pages/Inventory';
import { PurchaseOrderPage } from './pages/PurchaseOrder';
import { VendorsPage } from './pages/Vendors';
import { SettingsPage } from './pages/Settings';
import { ReportsPage } from './pages/Reports';
import { UsersPage } from './pages/Users';
import { OfflineIndicator } from './components/OfflineIndicator';
import { useEffect } from 'react';
import { doc, getDocFromServer } from 'firebase/firestore';
import { db } from './lib/firebase';

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

  return (
    <LanguageProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="pr" element={<PurchaseRequestPage />} />
              <Route path="approvals" element={<ApprovalPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="po" element={<PurchaseOrderPage />} />
              <Route path="purchase-orders" element={<PurchaseOrderPage />} />
              <Route path="vendors" element={<VendorsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="users" element={<UsersPage />} />
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
      </NotificationProvider>
    </LanguageProvider>
  );
}
