import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  writeBatch, 
  serverTimestamp,
  getCountFromServer
} from 'firebase/firestore';
import { db, ensureFirebaseAuth, testFirebaseConnection, firebaseConfig } from './firebase';
import type { PurchaseRequest, PurchaseOrder, InventoryItem, Vendor } from '../types';
import { logSystemAction } from './auditLog';

export interface FirebaseCollectionStats {
  prsCount: number;
  posCount: number;
  inventoryCount: number;
  vendorsCount: number;
  logsCount: number;
  lastChecked: string;
}

/**
 * Push all local data into Firebase Cloud Firestore
 */
export async function pushAllToFirestore(data: {
  prs: PurchaseRequest[];
  pos: PurchaseOrder[];
  inventory: InventoryItem[];
  vendors: Vendor[];
}): Promise<{
  success: boolean;
  message: string;
  counts: { prs: number; pos: number; inventory: number; vendors: number };
}> {
  try {
    await ensureFirebaseAuth();

    // 1. Write PRs
    const prBatch = writeBatch(db);
    for (const pr of data.prs) {
      const ref = doc(db, 'prs', pr.id || pr.prNumber);
      prBatch.set(ref, {
        ...pr,
        _syncedAt: serverTimestamp()
      }, { merge: true });
    }
    await prBatch.commit();

    // 2. Write POs
    const poBatch = writeBatch(db);
    for (const po of data.pos) {
      const ref = doc(db, 'pos', po.id || po.poNumber);
      poBatch.set(ref, {
        ...po,
        _syncedAt: serverTimestamp()
      }, { merge: true });
    }
    await poBatch.commit();

    // 3. Write Inventory
    const invBatch = writeBatch(db);
    for (const item of data.inventory) {
      const ref = doc(db, 'inventory', item.id);
      invBatch.set(ref, {
        ...item,
        _syncedAt: serverTimestamp()
      }, { merge: true });
    }
    await invBatch.commit();

    // 4. Write Vendors
    const vendorBatch = writeBatch(db);
    for (const vendor of data.vendors) {
      const ref = doc(db, 'vendors', vendor.id);
      vendorBatch.set(ref, {
        ...vendor,
        _syncedAt: serverTimestamp()
      }, { merge: true });
    }
    await vendorBatch.commit();

    // Save sync metadata
    await setDoc(doc(db, '_system_metadata', 'sync_state'), {
      lastSyncTimestamp: serverTimestamp(),
      lastSyncIso: new Date().toISOString(),
      prsCount: data.prs.length,
      posCount: data.pos.length,
      inventoryCount: data.inventory.length,
      vendorsCount: data.vendors.length,
      syncedBy: 'ProcureSync Client'
    }, { merge: true });

    await logSystemAction(
      'System Cloud Sync',
      'Firebase Push',
      `ส่งข้อมูลขึ้น Firestore: PR ${data.prs.length} ใบ, PO ${data.pos.length} ใบ, สต็อก ${data.inventory.length} รายการ, คู่ค้า ${data.vendors.length} ราย`
    );

    return {
      success: true,
      message: `ซิงก์ข้อมูลขึ้น Firebase Firestore สำเร็จเรียบร้อย (${data.prs.length + data.pos.length + data.inventory.length + data.vendors.length} รายการ)`,
      counts: {
        prs: data.prs.length,
        pos: data.pos.length,
        inventory: data.inventory.length,
        vendors: data.vendors.length
      }
    };
  } catch (err: any) {
    console.error('[Firebase Sync Error]', err);
    throw new Error(err.message || 'ไม่สามารถซิงก์ข้อมูลขึ้น Firebase Firestore ได้');
  }
}

/**
 * Pull all data from Firebase Cloud Firestore into local client
 */
export async function pullAllFromFirestore(): Promise<{
  prs: PurchaseRequest[];
  pos: PurchaseOrder[];
  inventory: InventoryItem[];
  vendors: Vendor[];
  totalCount: number;
}> {
  try {
    await ensureFirebaseAuth();

    // Pull PRs
    const prSnapshot = await getDocs(collection(db, 'prs'));
    const prs: PurchaseRequest[] = prSnapshot.docs.map(doc => {
      const d = doc.data();
      delete d._syncedAt;
      return d as PurchaseRequest;
    });

    // Pull POs
    const poSnapshot = await getDocs(collection(db, 'pos'));
    const pos: PurchaseOrder[] = poSnapshot.docs.map(doc => {
      const d = doc.data();
      delete d._syncedAt;
      return d as PurchaseOrder;
    });

    // Pull Inventory
    const invSnapshot = await getDocs(collection(db, 'inventory'));
    const inventory: InventoryItem[] = invSnapshot.docs.map(doc => {
      const d = doc.data();
      delete d._syncedAt;
      return d as InventoryItem;
    });

    // Pull Vendors
    const vendorSnapshot = await getDocs(collection(db, 'vendors'));
    const vendors: Vendor[] = vendorSnapshot.docs.map(doc => {
      const d = doc.data();
      delete d._syncedAt;
      return d as Vendor;
    });

    await logSystemAction(
      'System Cloud Sync',
      'Firebase Pull',
      `ดึงข้อมูลจาก Firestore สำเร็จ: รวม ${prs.length + pos.length + inventory.length + vendors.length} รายการ`
    );

    return {
      prs,
      pos,
      inventory,
      vendors,
      totalCount: prs.length + pos.length + inventory.length + vendors.length
    };
  } catch (err: any) {
    console.error('[Firebase Pull Error]', err);
    throw new Error(err.message || 'ไม่สามารถดึงข้อมูลจาก Firebase Firestore ได้');
  }
}

/**
 * Fetch stats of remote Firebase collections
 */
export async function getFirebaseStats(): Promise<FirebaseCollectionStats> {
  try {
    await ensureFirebaseAuth();
    
    // Quick count from server or snapshot
    const [prSnap, poSnap, invSnap, venSnap, logSnap] = await Promise.all([
      getDocs(collection(db, 'prs')).catch(() => ({ size: 0 })),
      getDocs(collection(db, 'pos')).catch(() => ({ size: 0 })),
      getDocs(collection(db, 'inventory')).catch(() => ({ size: 0 })),
      getDocs(collection(db, 'vendors')).catch(() => ({ size: 0 })),
      getDocs(collection(db, 'audit_logs')).catch(() => ({ size: 0 }))
    ]);

    return {
      prsCount: prSnap.size,
      posCount: poSnap.size,
      inventoryCount: invSnap.size,
      vendorsCount: venSnap.size,
      logsCount: logSnap.size,
      lastChecked: new Date().toLocaleTimeString('th-TH')
    };
  } catch {
    return {
      prsCount: 0,
      posCount: 0,
      inventoryCount: 0,
      vendorsCount: 0,
      logsCount: 0,
      lastChecked: new Date().toLocaleTimeString('th-TH')
    };
  }
}

export { testFirebaseConnection, firebaseConfig };
