import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface AuditLogEntry {
  id?: string;
  time: string;
  user: string;
  action: string;
  detail: string;
  ip: string;
}

export async function logSystemAction(userOrAction: string, actionOrDetail: string, detailOrMeta?: any) {
  try {
    let user = 'System';
    let action = userOrAction;
    let detail = actionOrDetail;

    if (detailOrMeta !== undefined) {
      if (typeof detailOrMeta === 'string') {
        user = userOrAction;
        action = actionOrDetail;
        detail = detailOrMeta;
      } else {
        user = 'System';
        action = userOrAction;
        detail = typeof actionOrDetail === 'string' 
          ? `${actionOrDetail} ${JSON.stringify(detailOrMeta)}` 
          : JSON.stringify(actionOrDetail);
      }
    }

    const logsRef = collection(db, 'audit_logs');
    await addDoc(logsRef, {
      user,
      action,
      detail,
      ip: '192.168.1.' + Math.floor(Math.random() * 255), // Mock IP for demonstration
      timestamp: serverTimestamp(),
      time: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log action:', error);
  }
}

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  try {
    const logsRef = collection(db, 'audit_logs');
    const q = query(logsRef, orderBy('timestamp', 'desc'), limit(50));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        user: data.user,
        action: data.action,
        detail: data.detail,
        ip: data.ip,
        time: data.time ? new Date(data.time).toLocaleString('th-TH') : new Date().toLocaleString('th-TH')
      };
    });
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return [];
  }
}
