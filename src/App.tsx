import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import { useEffect } from 'react';
import { doc, getDocFromServer } from 'firebase/firestore';
import { db } from './lib/firebase';

export default function App() {
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        console.log('Firebase connection successful.');
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="pr" element={<PurchaseRequestPage />} />

          <Route path="approvals" element={<ApprovalPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="po" element={<PurchaseOrderPage />} />
          <Route path="vendors" element={<VendorsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center h-full text-center">
               <h2 className="text-xl font-bold text-slate-800">เร็วๆ นี้</h2>
               <p className="text-slate-500 mt-2">ฟีเจอร์นี้กำลังอยู่ระหว่างการพัฒนา</p>
            </div>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
