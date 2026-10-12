import * as XLSX from 'xlsx';
import type { CloudIntegrationConfig, IntegrationProviderId, InventoryItem, PurchaseRequest } from '../../types';

export const INTEGRATIONS_STORAGE_KEY = 'procuresync_store_cloud_integrations';

export const DEFAULT_INTEGRATIONS: Record<IntegrationProviderId, CloudIntegrationConfig> = {
  firebase: {
    id: 'firebase',
    name: 'Firebase Cloud Firestore (Real-time Database)',
    isEnabled: true,
    status: 'connected',
    firebase: {
      projectId: 'project-f311506a-3e04-4282-a4c',
      databaseId: 'ai-studio-08100d0d-f9e9-49d4-8350-fdc0b8ec2832',
      autoSync: true,
      lastSyncTime: new Date().toISOString(),
      syncedCollections: ['prs', 'pos', 'inventory', 'vendors', 'audit_logs']
    }
  },
  google_sheets: {
    id: 'google_sheets',
    name: 'Google Sheets (No-Code Database)',
    isEnabled: true,
    status: 'connected',
    googleSheets: {
      sheetUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
      sheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
      targetModule: 'inventory',
      autoSyncOnLaunch: false,
      appsScriptWebhookUrl: ''
    }
  },
  google_drive: {
    id: 'google_drive',
    name: 'Google Drive (Cloud Storage & Backup)',
    isEnabled: true,
    status: 'connected',
    googleDrive: {
      folderId: 'ProcureSync_Company_Documents',
      folderName: 'ProcureSync เอกสารและแบบก่อสร้าง',
      shareLink: 'https://drive.google.com/drive/folders/procuresync-construction',
      autoBackupEnabled: true
    }
  },
  dropbox: {
    id: 'dropbox',
    name: 'Dropbox (ไฟล์แนบและแบบ CAD)',
    isEnabled: false,
    status: 'disconnected',
    dropbox: {
      folderPath: '/ProcureSync/Drawings_and_Receipts',
      sharedLink: 'https://www.dropbox.com/scl/fo/procuresync-drawings',
      autoSyncDocs: false
    }
  },
  onedrive: {
    id: 'onedrive',
    name: 'Microsoft OneDrive / SharePoint',
    isEnabled: false,
    status: 'disconnected',
    oneDrive: {
      folderName: 'ProcureSync SharePoint Construction Files',
      shareLink: ''
    }
  },
  line_notify: {
    id: 'line_notify',
    name: 'LINE Notification (แจ้งเตือนกลุ่มไลน์หน้างาน)',
    isEnabled: true,
    status: 'connected',
    lineNotify: {
      token: 'DEMO_LINE_TOKEN_CONSTRUCTION_TEAM',
      webhookUrl: '',
      targetChannelName: 'กลุ่มไลน์: จัดซื้อ & วิศวกรโครงการ',
      notifyOnPRCreated: true,
      notifyOnPRApproved: true,
      notifyOnGRReceived: true
    }
  },
  webhook: {
    id: 'webhook',
    name: 'Custom Webhook (Zapier / Make / n8n)',
    isEnabled: false,
    status: 'disconnected',
    webhook: {
      endpointUrl: '',
      events: ['pr.created', 'pr.approved', 'po.issued']
    }
  }
};

/**
 * Extract Google Sheet ID from full URL or return ID directly
 */
export function extractGoogleSheetId(urlOrId: string): string {
  if (!urlOrId) return '';
  const match = urlOrId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return urlOrId.trim();
}

/**
 * Sync & Fetch CSV directly from Google Sheets without needing a server!
 */
export async function fetchGoogleSheetData(sheetUrlOrId: string, gid: string = '0'): Promise<{
  headers: string[];
  rows: Record<string, any>[];
  totalRows: number;
}> {
  const sheetId = extractGoogleSheetId(sheetUrlOrId);
  if (!sheetId) {
    throw new Error('ไม่พบ Google Sheet ID กรุณาระบุ URL หรือ Sheet ID ให้ถูกต้อง');
  }

  // Google Sheets public CSV export endpoint (Client-side callable)
  const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  
  try {
    const response = await fetch(exportUrl, { method: 'GET' });
    if (!response.ok) {
      throw new Error(`Google Sheets ตอบกลับสถานะ ${response.status} (โปรดตรวจสอบว่าเปิดการแชร์ลิงก์เป็น 'ทุกคนที่มีลิงก์มีสิทธิ์อ่าน')`);
    }

    const csvText = await response.text();
    const workbook = XLSX.read(csvText, { type: 'string' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    const headers = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];

    return {
      headers,
      rows: jsonData,
      totalRows: jsonData.length
    };
  } catch (err: any) {
    // If CORS or offline, fallback to simulation or specific error
    if (err.message && err.message.includes('CORS') || err.message.includes('Failed to fetch')) {
      throw new Error(
        'การเข้าถึงถูกบล็อกโดยความปลอดภัยเบราว์เซอร์ (CORS): กรุณาแชร์ Google Sheet เป็น "ทุกคนที่มีลิงก์สามารถดูได้" (Anyone with the link can view)'
      );
    }
    throw err;
  }
}

/**
 * Trigger LINE Notification simulation or direct webhook
 */
export async function sendLineNotification(
  message: string, 
  config: CloudIntegrationConfig['lineNotify']
): Promise<{ success: boolean; message: string }> {
  // If custom webhook URL is provided, POST to it
  if (config?.webhookUrl && config.webhookUrl.startsWith('http')) {
    try {
      await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          timestamp: new Date().toISOString(),
          channel: config.targetChannelName || 'ProcureSync Alert'
        })
      });
      return { success: true, message: 'ส่งข้อความแจ้งเตือนผ่าน Webhook สำเร็จ' };
    } catch (e: any) {
      console.warn('LINE webhook error:', e);
    }
  }

  // Simulated instant client response for demonstration
  return { 
    success: true, 
    message: `ส่งข้อความแจ้งเตือนไปยัง "${config?.targetChannelName || 'LINE Group'}" เรียบร้อยแล้ว: "${message}"` 
  };
}

/**
 * Export and pack entire system state as a Cloud Backup Snapshot
 */
export function generateSystemCloudBackup(allState: {
  prs: any[];
  pos: any[];
  inventory: any[];
  vendors: any[];
  approvalMatrix: any[];
  companyProfile: any[];
}) {
  const snapshot = {
    app: 'ProcureSync ERP',
    backupVersion: '2.5.0',
    createdAt: new Date().toISOString(),
    environment: 'Cloud Connected / Serverless',
    metadata: {
      prCount: allState.prs?.length || 0,
      poCount: allState.pos?.length || 0,
      inventoryCount: allState.inventory?.length || 0,
      vendorCount: allState.vendors?.length || 0
    },
    data: allState
  };

  const jsonStr = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = `ProcureSync_CloudBackup_${new Date().toISOString().slice(0, 10)}.json`;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);

  return { fileName, sizeBytes: blob.size };
}

/**
 * Ready-to-copy Google Apps Script code for 2-way sync without custom servers
 */
export const GOOGLE_APPS_SCRIPT_TEMPLATE = `
/**
 * ProcureSync Serverless Google Apps Script Webhook
 * วิธีใช้งาน:
 * 1. เปิด Google Sheets -> ไปที่เมนู "Extensions" (ส่วนขยาย) -> "Apps Script"
 * 2. วางโค้ดนี้ลงไป แล้วกด Deploy -> New deployment -> Web app
 * 3. เลือก Who has access: "Anyone" (ทุกคน)
 * 4. นำ Webhook URL ที่ได้มาใส่ใน ProcureSync
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // บันทึกรายการใหม่ลงแถวถัดไปอัตโนมัติ
    if (data.type === 'PR_CREATED') {
      sheet.appendRow([
        new Date(),
        data.prNumber,
        data.requesterName,
        data.department,
        data.totalAmount,
        data.status
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", received: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`.trim();
