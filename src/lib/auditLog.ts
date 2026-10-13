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

export interface SystemActionPayload {
  action: string;
  user?: string;
  entityType?: string;
  entityId?: string;
  details?: string;
  detail?: string;
  [key: string]: any;
}

export async function logSystemAction(
  param1: string | SystemActionPayload,
  param2?: string,
  param3?: any
) {
  try {
    let user = 'System';
    let action = 'ACTION';
    let detail = '';

    if (typeof param1 === 'object' && param1 !== null) {
      action = param1.action || 'ACTION';
      user = param1.user || 'System';
      detail = param1.details || param1.detail || '';
      if (param1.entityType || param1.entityId) {
        detail = `[${param1.entityType || ''}#${param1.entityId || ''}] ${detail}`.trim();
      }
    } else {
      const paramStr = typeof param1 === 'string' ? param1 : 'ACTION';
      action = paramStr || 'ACTION';
      detail = param2 || '';

      if (param3 !== undefined) {
        if (typeof param3 === 'string') {
          user = paramStr;
          action = param2 || 'ACTION';
          detail = param3;
        } else {
          user = 'System';
          action = paramStr;
          detail = typeof param2 === 'string' 
            ? `${param2} ${JSON.stringify(param3)}` 
            : JSON.stringify(param2);
        }
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
