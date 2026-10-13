import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  PurchaseRequest, 
  PurchaseOrder, 
  InventoryItem, 
  ApprovalTask, 
  Vendor,
  POItem,
  POReceipt,
  ApprovalMatrixStep,
  CompanyProfile,
  ImportHistoryRecord,
  ImportMergeMode,
  ImportTargetModule,
  CloudIntegrationConfig,
  IntegrationProviderId
} from '../types';
import { logSystemAction } from '../lib/auditLog';
import { DEFAULT_APPROVAL_MATRIX } from '../data/defaultApprovalMatrix';
import { 
  DEFAULT_INTEGRATIONS, 
  INTEGRATIONS_STORAGE_KEY, 
  fetchGoogleSheetData, 
  sendLineNotification, 
  generateSystemCloudBackup 
} from '../lib/integrations/cloudSync';
import { 
  pushAllToFirestore, 
  pullAllFromFirestore, 
  testFirebaseConnection 
} from '../lib/firebaseSync';

// Storage Keys
const STORAGE_PREFIX = 'procuresync_store_';
const PR_STORAGE_KEY = `${STORAGE_PREFIX}prs`;
const PO_STORAGE_KEY = `${STORAGE_PREFIX}pos`;
const INVENTORY_STORAGE_KEY = `${STORAGE_PREFIX}inventory`;
const VENDOR_STORAGE_KEY = `${STORAGE_PREFIX}vendors`;
const APPROVAL_MATRIX_STORAGE_KEY = `${STORAGE_PREFIX}approval_matrix`;
const COMPANY_PROFILE_STORAGE_KEY = `${STORAGE_PREFIX}company_profile`;
const IMPORT_HISTORY_STORAGE_KEY = `${STORAGE_PREFIX}import_history`;

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  nameTh: 'บริษัท โคนเนอเรจ สโตร์ จำกัด',
  nameEn: 'CONERAGE STORE CO., LTD.',
  taxId: '0105566012345',
  address: '888 อาคารเอ็มไพร์ทาวเวอร์ ชั้น 24 ถนนสาทรใต้ แขวงยานนาวา เขตสาทร กรุงเทพฯ 10120',
  phone: '02-123-4567',
  email: 'contact@coneragestore.com',
  logoUrl: '',
  docFormatPR: 'PR-YYYY-XXX',
  docFormatPO: 'PO-YYYY-XXX',
};

// Seed Data
const SEED_PRS: PurchaseRequest[] = [
  {
    id: 'pr-1',
    prNumber: 'PR-2025-001',
    requesterName: 'สมชาย ช่างก่อสร้าง',
    requesterPosition: 'วิศวกรสนาม (Site Engineer)',
    department: 'โครงการ คอนโดสุขุมวิท 101',
    projectCode: 'PRJ-SKV101',
    contactPhone: '081-987-6543',
    deliveryLocation: 'ไซต์งานคอนโดสุขุมวิท 101 ประตู 2',
    requestDate: '2025-05-18T10:00:00Z',
    requiredDate: '2025-05-25T00:00:00Z',
    urgency: 'urgent',
    status: 'Pending Approval',
    justification: 'ขอสั่งซื้อวัสดุสำหรับงานเทคอนกรีตฐานรากและเสาตอม่อ ชั้นใต้ดินตามแผนงานงวดที่ 2 อ้างอิง BOQ งานโครงสร้าง',
    suggestedVendor: 'บริษัท ปูนซิเมนต์ไทย จำกัด (มหาชน)',
    includeVat: true,
    vatAmount: 24500,
    totalAmount: 374500,
    items: [
      { id: '1', itemCode: 'MAT-CONC-240', description: 'คอนกรีตผสมเสร็จ 240 ksc Cube', specification: 'Slump 10±2.5 cm ปูนช้าง สำหรับฐานราก', quantity: 35, unitPrice: 1950, unit: 'คิว', remark: 'ส่งวันเสาร์เช้า' },
      { id: '2', itemCode: 'MAT-STEEL-DB16', description: 'เหล็กข้ออ้อย DB16 SD40', specification: 'ความยาว 10 เมตร มอก. 24-2559 มีใบ Mill Cert', quantity: 150, unitPrice: 420, unit: 'เส้น', remark: 'เหล็กเสาตอม่อ' },
      { id: '3', itemCode: 'MAT-STEEL-RB9', description: 'เหล็กเส้นกลม RB9 SR24', specification: 'ความยาว 10 เมตร มอก. 20-2559', quantity: 200, unitPrice: 135, unit: 'เส้น', remark: 'ดัดเหล็กปลอก' },
      { id: '4', itemCode: 'MAT-WIRE-01', description: 'ลวดผูกเหล็กเบอร์ 18', specification: 'น้ำหนัก 2.5 กก./ขด นุ่มเหนียว', quantity: 20, unitPrice: 180, unit: 'ขด', remark: 'ผูกเหล็กโครงสร้าง' },
      { id: '5', itemCode: 'MAT-WOOD-PLY', description: 'ไม้อัดเคลือบฟิล์มดำ 15 มม.', specification: '122x244 ซม. เกรดงานหล่อคอนกรีต 4-6 ครั้ง', quantity: 40, unitPrice: 650, unit: 'แผ่น', remark: 'ทำแบบข้างคาน' }
    ],
    signatures: {
      requestedBy: {
        name: 'สมชาย ช่างก่อสร้าง',
        position: 'วิศวกรสนาม',
        date: '2025-05-18T10:00:00Z',
        signed: true
      },
      checkedBy: {
        name: 'นายอภิสิทธิ์ กลิ่นสุคนธ์',
        position: 'วิศวกรโครงการ (Project Engineer)',
        date: '2025-05-18T14:30:00Z',
        signed: true,
        comments: 'ตรวจสอบสเปกวัสดุตรงตามแบบวิศวกรรมแล้ว'
      },
      budgetCheckedBy: {
        name: 'นางสาวกัญญา พงษ์ศิริ',
        position: 'เจ้าหน้าที่ควบคุมต้นทุน (Cost Control)',
        date: '2025-05-18T16:00:00Z',
        signed: true,
        comments: 'ยอดสั่งซื้ออยู่ในกรอบงบประมาณ BOQ งานโครงสร้าง'
      }
    }
  },
  {
    id: 'pr-2',
    prNumber: 'PR-2025-002',
    requesterName: 'วิศรุต ควบคุมงาน',
    requesterPosition: 'วิศวกรไฟฟ้า (M&E Engineer)',
    department: 'โครงการ รถไฟฟ้าสายสีส้ม สัญญา 3',
    projectCode: 'PRJ-ORANGE03',
    contactPhone: '089-111-2233',
    deliveryLocation: 'สถานีรามคำแหง 12 โกดังเก็บอุปกรณ์ M&E',
    requestDate: '2025-05-19T09:00:00Z',
    requiredDate: '2025-05-26T00:00:00Z',
    urgency: 'normal',
    status: 'Approved',
    justification: 'สั่งซื้อสายไฟและท่อร้อยสายไฟ EMT สำหรับงานเดินระบบไฟฟ้าแสงสว่างและเต้ารับชั้นชานชาลา',
    suggestedVendor: 'โฮมสแควร์ เซ็นเตอร์',
    includeVat: true,
    vatAmount: 14000,
    totalAmount: 214000,
    items: [
      { id: '1', itemCode: 'ELE-CBL-THW-2.5', description: 'สายไฟ THW 1x2.5 sq.mm.', specification: 'มอก. 11-2553 สีดำ ยาว 100 เมตร/ม้วน ยี่ห้อบางกอกเคเบิ้ล', quantity: 25, unitPrice: 850, unit: 'ม้วน', remark: 'ระบบแสงสว่าง' },
      { id: '2', itemCode: 'ELE-PIP-EMT-1/2', description: 'ท่อร้อยสายไฟ EMT 1/2 นิ้ว', specification: 'หนา 1.07 มม. มอก. 770-2533 ยาว 3 เมตร ยี่ห้อพานาโซนิค', quantity: 150, unitPrice: 165, unit: 'ท่อน', remark: 'เดินลอยใต้เพดาน' }
    ],
    signatures: {
      requestedBy: { name: 'วิศรุต ควบคุมงาน', position: 'วิศวกรไฟฟ้า', date: '2025-05-19T09:00:00Z', signed: true },
      approvedBy: { name: 'นายธีรภัทร บริหารงาน', position: 'ผู้จัดการโครงการ', date: '2025-05-19T17:00:00Z', signed: true, comments: 'อนุมัติเรียบร้อย' }
    }
  },
  {
    id: 'pr-3',
    prNumber: 'PR-2025-003',
    requesterName: 'ณภัทร สถาปัตย์',
    requesterPosition: 'วิศวกรตกแต่งภายใน',
    department: 'โครงการ หมู่บ้านจัดสรร พระราม 2',
    projectCode: 'PRJ-RAMA2',
    contactPhone: '086-444-5566',
    deliveryLocation: 'บ้านตัวอย่างหลังที่ 5 ซอย 3',
    requestDate: '2025-05-19T11:30:00Z',
    requiredDate: '2025-05-24T00:00:00Z',
    urgency: 'normal',
    status: 'PO Created',
    justification: 'สั่งซื้อกระเบื้องปูพื้นสำหรับบ้านตัวอย่าง',
    suggestedVendor: 'ดีดี อินเตอร์เทรดวัสดุ',
    includeVat: true,
    vatAmount: 5560,
    totalAmount: 85000,
    items: [
      { id: '5', itemCode: 'MAT-TILE-60', description: 'กระเบื้องแกรนิตโต้ 60x60 ซม.', specification: 'ผิวด้าน กันลื่น R10', quantity: 200, unitPrice: 425, unit: 'กล่อง' }
    ]
  }
];

const SEED_POS: PurchaseOrder[] = [
  {
    id: 'po1',
    poNumber: 'PO-2025-089',
    prNumber: 'PR-2025-003',
    prId: 'pr-3',
    vendorName: 'ดีดี อินเตอร์เทรดวัสดุ',
    vendorId: 'v3',
    poDescription: 'กระเบื้องปูพื้นสำหรับบ้านตัวอย่าง พระราม 2',
    department: 'โครงการ หมู่บ้านจัดสรร พระราม 2',
    totalAmount: 85000,
    status: 'Partially Received',
    date: '2025-05-19',
    expectedDeliveryDate: '2025-05-24',
    deliveryLocation: 'บ้านตัวอย่างหลังที่ 5 ซอย 3',
    paymentTerms: 'Credit 30 Days',
    items: [
      {
        id: '5',
        itemCode: 'MAT-TILE-60',
        description: 'กระเบื้องแกรนิตโต้ 60x60 ซม.',
        quantity: 200,
        unitPrice: 425,
        unit: 'กล่อง',
        receivedQuantity: 120,
        receipts: [
          {
            id: 'rcpt-1',
            date: '2025-05-21',
            quantity: 120,
            receivedBy: 'ณภัทร สถาปัตย์',
            isDirectToSite: true,
            deliveryNotes: ['ส่งงวดแรก 120 กล่อง ครบถ้วนตามสภาพดี']
          }
        ]
      }
    ]
  }
];

const SEED_INVENTORY: InventoryItem[] = [
  { 
    id: '1', 
    code: 'MAT-CEM-01', 
    sku: 'SKU-CEM-B100', 
    barcode: '8851928001014', 
    name: 'ปูนซีเมนต์ปอร์ตแลนด์ (ตราช้าง)', 
    category: 'วัสดุก่อสร้าง', 
    quantity: 450, 
    unit: 'ถุง', 
    minStockLevel: 100, 
    location: 'คลังพัสดุก่อสร้างกลาง (Central WH)', 
    binLocation: 'ไซโล 1 (Bay C-01)', 
    centralWarehouse: 'คลังพัสดุก่อสร้างกลาง (Central Material Hub)', 
    projectAllocations: ['โครงการ คอนโดสุขุมวิท 101', 'โครงการ โรงพยาบาลบางนา', 'โครงการ อาคารสำนักงานพระราม 9'], 
    unitPrice: 155 
  },
  { 
    id: '2', 
    code: 'MAT-STL-24', 
    sku: 'SKU-STL-SR24', 
    barcode: '8851928002028', 
    name: 'เหล็กเส้นกลม SR24 (มอก.)', 
    category: 'วัสดุก่อสร้าง', 
    quantity: 15, 
    unit: 'ตัน', 
    minStockLevel: 20, 
    location: 'คลังพัสดุก่อสร้างกลาง (Central WH)', 
    binLocation: 'ลานเก็บ B (Zone B-04)', 
    centralWarehouse: 'คลังพัสดุก่อสร้างกลาง (Central Material Hub)', 
    projectAllocations: ['โครงการ คอนโดสุขุมวิท 101', 'โครงการ สะพานข้ามแยกรามคำแหง'], 
    unitPrice: 24500 
  },
  { 
    id: '3', 
    code: 'TOL-DRL-01', 
    sku: 'SKU-TOL-DRL01', 
    barcode: '8851928003035', 
    name: 'สว่านโรตารี่ 800W 3 ระบบ', 
    category: 'เครื่องมือช่าง', 
    quantity: 12, 
    unit: 'เครื่อง', 
    minStockLevel: 5, 
    location: 'คลังพัสดุก่อสร้างกลาง (Central WH)', 
    binLocation: 'ห้องช่าง (Shelf T-12)', 
    centralWarehouse: 'คลังพัสดุก่อสร้างกลาง (Central Material Hub)', 
    projectAllocations: ['ทีมช่างงานระบบ MEP', 'โครงการ คอนโดสุขุมวิท 101'], 
    unitPrice: 3850 
  },
  { 
    id: '4', 
    code: 'SAF-HLM-01', 
    sku: 'SKU-SAF-HLM01', 
    barcode: '8851928004042', 
    name: 'หมวกนิรภัย มอก. รองใน 6 จุด ปรับหมุน', 
    category: 'อุปกรณ์เซฟตี้', 
    quantity: 120, 
    unit: 'ใบ', 
    minStockLevel: 50, 
    location: 'คลังพัสดุก่อสร้างกลาง (Central WH)', 
    binLocation: 'สโตร์กลาง (Rack S-03)', 
    centralWarehouse: 'คลังพัสดุก่อสร้างกลาง (Central Material Hub)', 
    projectAllocations: ['วิศวกรและคนงานทุกไซต์งาน', 'ฝ่ายความปลอดภัย จป.'], 
    unitPrice: 280 
  },
  { 
    id: '5', 
    code: 'MAT-TILE-60', 
    sku: 'SKU-MAT-TL60', 
    barcode: '8851928005059', 
    name: 'กระเบื้องแกรนิตโต้ 60x60 ซม. นาโนไวท์', 
    category: 'วัสดุก่อสร้าง', 
    quantity: 120, 
    unit: 'กล่อง', 
    minStockLevel: 50, 
    location: 'คลังพัสดุก่อสร้างกลาง (Central WH)', 
    binLocation: 'โกดัง A (Pallet P-09)', 
    centralWarehouse: 'คลังพัสดุก่อสร้างกลาง (Central Material Hub)', 
    projectAllocations: ['โครงการ คอนโดสุขุมวิท 101', 'โครงการ บ้านเดี่ยวราชพฤกษ์'], 
    unitPrice: 425 
  }
];

const SEED_VENDORS: Vendor[] = [
  {
    id: 'v1',
    name: 'บริษัท วัสดุก่อสร้างไทย จำกัด',
    contactPerson: 'คุณสมชาย ใจดี',
    email: 'somchai@thaibuildmat.com',
    phone: '02-123-4567',
    address: '123 ถ.สุขุมวิท กรุงเทพฯ 10110',
    paymentTerms: 'Credit 30 Days',
    rating: 4.8,
    onTimeDeliveryRate: 95,
    categories: ['ปูนซีเมนต์', 'เหล็กเส้น']
  },
  {
    id: 'v2',
    name: 'โฮมสแควร์ เซ็นเตอร์',
    contactPerson: 'คุณสมหญิง มากมี',
    email: 'sales@homesquare.co.th',
    phone: '02-987-6543',
    address: '456 ถ.บางนา-ตราด สมุทรปราการ 10540',
    paymentTerms: 'Cash on Delivery',
    rating: 4.2,
    onTimeDeliveryRate: 88,
    categories: ['เครื่องมือช่าง', 'สี']
  },
  {
    id: 'v3',
    name: 'ดีดี อินเตอร์เทรดวัสดุ',
    contactPerson: 'คุณวิชัย ค้าส่ง',
    email: 'wichai@ddtrade.com',
    phone: '081-234-5678',
    address: '789 ถ.พระราม 2 กรุงเทพฯ 10150',
    paymentTerms: 'Credit 45 Days',
    rating: 4.6,
    onTimeDeliveryRate: 92,
    categories: ['กระเบื้อง', 'สุขภัณฑ์']
  },
  {
    id: 'v4',
    name: 'บริษัท ปูนซิเมนต์ไทย จำกัด (มหาชน)',
    contactPerson: 'ฝ่ายขายโครงการใหญ่',
    email: 'corporate@scg.com',
    phone: '02-586-3333',
    address: '1 ถ.ปูนซิเมนต์ไทย บางซื่อ กรุงเทพฯ 10800',
    paymentTerms: 'Credit 60 Days',
    rating: 4.9,
    onTimeDeliveryRate: 98,
    categories: ['คอนกรีต', 'ปูนซีเมนต์', 'กระเบื้องหลังคา']
  }
];

interface ProcurementContextType {
  // State
  prs: PurchaseRequest[];
  pos: PurchaseOrder[];
  inventory: InventoryItem[];
  vendors: Vendor[];
  approvalTasks: ApprovalTask[];

  // PR Actions
  createPR: (prData: Omit<PurchaseRequest, 'id' | 'prNumber' | 'status'>, submitForApproval?: boolean) => PurchaseRequest;
  updatePR: (id: string, updates: Partial<PurchaseRequest>) => void;
  deletePR: (id: string) => void;
  submitPRForApproval: (id: string) => void;

  // Approval Actions
  approvePR: (prId: string, approverName: string, approverRole: string, comments?: string) => void;
  rejectPR: (prId: string, approverName: string, approverRole: string, reason: string) => void;

  // PO Actions
  createPOFromPR: (
    prId: string, 
    vendorName: string, 
    expectedDeliveryDate?: string, 
    paymentTerms?: string,
    poDescription?: string
  ) => PurchaseOrder;
  updatePO: (id: string, updates: Partial<PurchaseOrder>) => void;
  deletePO: (id: string) => void;
  receivePOGoods: (
    poId: string, 
    receiptItems: { itemId: string; quantity: number }[], 
    receiverName: string, 
    location?: string,
    note?: string
  ) => void;

  // Inventory Actions
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => InventoryItem;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  transactInventory: (
    codeOrId: string, 
    deltaQty: number, 
    type: 'IN' | 'OUT' | 'ADJUST', 
    note?: string,
    location?: string
  ) => boolean;

  // Approval Matrix State & Actions
  approvalMatrix: ApprovalMatrixStep[];
  updateApprovalMatrix: (matrix: ApprovalMatrixStep[]) => void;
  updateApprovalStep: (stepId: string, updates: Partial<ApprovalMatrixStep>) => void;
  addApprovalStep: (step: Omit<ApprovalMatrixStep, 'id' | 'stepNumber'>) => void;
  removeApprovalStep: (stepId: string) => void;
  resetApprovalMatrix: () => void;

  // Company Profile & Branding
  companyProfile: CompanyProfile;
  updateCompanyProfile: (profile: Partial<CompanyProfile>) => void;
  resetCompanyProfile: () => void;

  // Data Import Actions & History
  importHistory: ImportHistoryRecord[];
  addImportHistoryRecord: (record: Omit<ImportHistoryRecord, 'id' | 'timestamp'>) => void;
  clearImportHistory: () => void;
  bulkImportInventory: (
    items: Omit<InventoryItem, 'id'>[],
    mode?: ImportMergeMode
  ) => { added: number; updated: number; total: number };
  bulkImportVendors: (
    newVendors: Omit<Vendor, 'id'>[],
    mode?: ImportMergeMode
  ) => { added: number; updated: number; total: number };
  bulkImportPRs: (
    newPRs: Omit<PurchaseRequest, 'id'>[]
  ) => { added: number; total: number };
  bulkImportPOs: (
    newPOs: Omit<PurchaseOrder, 'id'>[]
  ) => { added: number; total: number };

  // Cloud Integrations & Serverless Sync
  integrations: Record<IntegrationProviderId, CloudIntegrationConfig>;
  updateIntegrationConfig: (id: IntegrationProviderId, updates: Partial<CloudIntegrationConfig>) => void;
  syncGoogleSheetsData: (targetModule?: 'inventory' | 'pr' | 'vendors') => Promise<{ success: boolean; rowsCount: number; message: string }>;
  backupSystemToCloud: () => { fileName: string; sizeBytes: number };
  testLineAlert: (customMessage?: string) => Promise<{ success: boolean; message: string }>;
  syncToFirebase: () => Promise<{ success: boolean; message: string; counts: { prs: number; pos: number; inventory: number; vendors: number } }>;
  pullFromFirebase: () => Promise<{ success: boolean; message: string; totalCount: number }>;
  testFirebase: () => Promise<{ success: boolean; latencyMs?: number; projectId: string; databaseId?: string; error?: string }>;

  // Reset/Utility
  resetToSeedData: () => void;
}

const ProcurementContext = createContext<ProcurementContextType | undefined>(undefined);

export const ProcurementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial State from localStorage with safe fallback to Seed Data
  const [prs, setPrs] = useState<PurchaseRequest[]>(() => {
    try {
      const saved = localStorage.getItem(PR_STORAGE_KEY);
      return saved ? JSON.parse(saved) : SEED_PRS;
    } catch {
      return SEED_PRS;
    }
  });

  const [pos, setPos] = useState<PurchaseOrder[]>(() => {
    try {
      const saved = localStorage.getItem(PO_STORAGE_KEY);
      return saved ? JSON.parse(saved) : SEED_POS;
    } catch {
      return SEED_POS;
    }
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(INVENTORY_STORAGE_KEY);
      return saved ? JSON.parse(saved) : SEED_INVENTORY;
    } catch {
      return SEED_INVENTORY;
    }
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    try {
      const saved = localStorage.getItem(VENDOR_STORAGE_KEY);
      return saved ? JSON.parse(saved) : SEED_VENDORS;
    } catch {
      return SEED_VENDORS;
    }
  });

  const [approvalMatrix, setApprovalMatrix] = useState<ApprovalMatrixStep[]>(() => {
    try {
      const saved = localStorage.getItem(APPROVAL_MATRIX_STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_APPROVAL_MATRIX;
    } catch {
      return DEFAULT_APPROVAL_MATRIX;
    }
  });

  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => {
    try {
      const saved = localStorage.getItem(COMPANY_PROFILE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.nameEn && parsed.nameEn.includes('PROCURESYNC')) {
          parsed.nameEn = DEFAULT_COMPANY_PROFILE.nameEn;
          parsed.nameTh = DEFAULT_COMPANY_PROFILE.nameTh;
          parsed.email = DEFAULT_COMPANY_PROFILE.email;
        }
        return { ...DEFAULT_COMPANY_PROFILE, ...parsed };
      }
      return DEFAULT_COMPANY_PROFILE;
    } catch {
      return DEFAULT_COMPANY_PROFILE;
    }
  });

  const [importHistory, setImportHistory] = useState<ImportHistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem(IMPORT_HISTORY_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [integrations, setIntegrations] = useState<Record<IntegrationProviderId, CloudIntegrationConfig>>(() => {
    try {
      const saved = localStorage.getItem(INTEGRATIONS_STORAGE_KEY);
      return saved ? { ...DEFAULT_INTEGRATIONS, ...JSON.parse(saved) } : DEFAULT_INTEGRATIONS;
    } catch {
      return DEFAULT_INTEGRATIONS;
    }
  });

  // 2. Persist to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(PR_STORAGE_KEY, JSON.stringify(prs));
    } catch (e) {
      console.warn('Failed to save PRs to localStorage:', e);
    }
  }, [prs]);

  useEffect(() => {
    try {
      localStorage.setItem(PO_STORAGE_KEY, JSON.stringify(pos));
    } catch (e) {
      console.warn('Failed to save POs to localStorage:', e);
    }
  }, [pos]);

  useEffect(() => {
    try {
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
    } catch (e) {
      console.warn('Failed to save Inventory to localStorage:', e);
    }
  }, [inventory]);

  useEffect(() => {
    try {
      localStorage.setItem(VENDOR_STORAGE_KEY, JSON.stringify(vendors));
    } catch (e) {
      console.warn('Failed to save Vendors to localStorage:', e);
    }
  }, [vendors]);

  useEffect(() => {
    try {
      localStorage.setItem(APPROVAL_MATRIX_STORAGE_KEY, JSON.stringify(approvalMatrix));
    } catch (e) {
      console.warn('Failed to save Approval Matrix to localStorage:', e);
    }
  }, [approvalMatrix]);

  useEffect(() => {
    try {
      localStorage.setItem(COMPANY_PROFILE_STORAGE_KEY, JSON.stringify(companyProfile));
    } catch (e) {
      console.warn('Failed to save Company Profile to localStorage:', e);
    }
  }, [companyProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(IMPORT_HISTORY_STORAGE_KEY, JSON.stringify(importHistory));
    } catch (e) {
      console.warn('Failed to save Import History to localStorage:', e);
    }
  }, [importHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(INTEGRATIONS_STORAGE_KEY, JSON.stringify(integrations));
    } catch (e) {
      console.warn('Failed to save Integrations to localStorage:', e);
    }
  }, [integrations]);

  // 3. Derived Approval Tasks dynamically synchronized from PRs and Approval Matrix
  const approvalTasks: ApprovalTask[] = prs.map(pr => {
    // Dynamic level calculation based on organization's Approval Matrix
    const applicableSteps = approvalMatrix.filter(s => s.appliesTo.includes('PR'));
    const matchedSteps = applicableSteps.filter(s => {
      const minOk = s.minAmount === undefined || pr.totalAmount >= s.minAmount;
      const maxOk = s.maxAmount === undefined || pr.totalAmount <= s.maxAmount;
      return minOk && maxOk;
    });
    const level = Math.max(1, matchedSteps.length);
    const taskStatus = pr.status === 'Approved' 
      ? 'Approved' 
      : pr.status === 'Rejected' 
        ? 'Rejected' 
        : 'Pending';

    return {
      id: `task-${pr.id}`,
      documentId: pr.prNumber,
      documentType: 'PR',
      requester: pr.requesterName,
      requestDate: pr.requestDate,
      amount: pr.totalAmount,
      status: taskStatus,
      level,
      prData: pr
    };
  });

  // ==========================================
  // PR Methods
  // ==========================================
  const createPR = (
    prData: Omit<PurchaseRequest, 'id' | 'prNumber' | 'status'>,
    submitForApproval = true
  ): PurchaseRequest => {
    const year = new Date().getFullYear();
    const count = prs.length + 1;
    const prNumber = `PR-${year}-${String(count).padStart(3, '0')}`;
    const id = `pr-${Date.now()}`;
    const status = submitForApproval ? 'Pending Approval' : 'Draft';

    const newPR: PurchaseRequest = {
      ...prData,
      id,
      prNumber,
      status
    };

    setPrs(prev => [newPR, ...prev]);

    logSystemAction(
      'CREATE_PR',
      `สร้างใบขอซื้อเลขที่ ${prNumber} มูลค่า ${newPR.totalAmount.toLocaleString()} บาท`,
      { prNumber, amount: newPR.totalAmount, requester: newPR.requesterName }
    );

    return newPR;
  };

  const updatePR = (id: string, updates: Partial<PurchaseRequest>) => {
    setPrs(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePR = (id: string) => {
    setPrs(prev => prev.filter(p => p.id !== id));
  };

  const submitPRForApproval = (id: string) => {
    setPrs(prev => prev.map(p => {
      if (p.id === id) {
        logSystemAction('SUBMIT_PR', `ส่งใบขอซื้อ ${p.prNumber} เพื่อรอการพิจารณาอนุมัติ`);
        return { ...p, status: 'Pending Approval' };
      }
      return p;
    }));
  };

  // ==========================================
  // Approval Methods
  // ==========================================
  const approvePR = (prId: string, approverName: string, approverRole: string, comments?: string) => {
    setPrs(prev => prev.map(p => {
      if (p.id === prId || p.prNumber === prId) {
        const updated: PurchaseRequest = {
          ...p,
          status: 'Approved',
          signatures: {
            ...p.signatures,
            requestedBy: p.signatures?.requestedBy || { name: p.requesterName, position: p.requesterPosition || 'ผู้ขอซื้อ', date: p.requestDate, signed: true },
            approvedBy: {
              name: approverName,
              position: approverRole,
              date: new Date().toISOString(),
              signed: true,
              comments: comments || 'อนุมัติผ่านระบบเรียบร้อยแล้ว'
            }
          }
        };

        logSystemAction(
          'APPROVE_PR',
          `อนุมัติใบขอซื้อ ${p.prNumber} โดย ${approverName} (${approverRole})`,
          { prNumber: p.prNumber, approver: approverName, comments }
        );

        return updated;
      }
      return p;
    }));
  };

  const rejectPR = (prId: string, approverName: string, approverRole: string, reason: string) => {
    setPrs(prev => prev.map(p => {
      if (p.id === prId || p.prNumber === prId) {
        const updated: PurchaseRequest = {
          ...p,
          status: 'Rejected',
          signatures: {
            ...p.signatures,
            requestedBy: p.signatures?.requestedBy || { name: p.requesterName, position: p.requesterPosition || 'ผู้ขอซื้อ', date: p.requestDate, signed: true },
            approvedBy: {
              name: approverName,
              position: approverRole,
              date: new Date().toISOString(),
              signed: false,
              comments: `ปฏิเสธ: ${reason}`
            }
          }
        };

        logSystemAction(
          'REJECT_PR',
          `ปฏิเสธใบขอซื้อ ${p.prNumber}: ${reason}`,
          { prNumber: p.prNumber, approver: approverName, reason }
        );

        return updated;
      }
      return p;
    }));
  };

  // ==========================================
  // PO Methods (Linked with PR & Inventory)
  // ==========================================
  const createPOFromPR = (
    prId: string, 
    vendorName: string, 
    expectedDeliveryDate?: string, 
    paymentTerms = 'Credit 30 Days',
    poDescription?: string
  ): PurchaseOrder => {
    const targetPR = prs.find(p => p.id === prId || p.prNumber === prId);
    if (!targetPR) {
      throw new Error(`ไม่พบเอกสาร PR เลขที่ ${prId}`);
    }

    const year = new Date().getFullYear();
    const count = pos.length + 1;
    const poNumber = `PO-${year}-${String(count).padStart(3, '0')}`;
    const id = `po-${Date.now()}`;

    // Transfer items with initial receivedQuantity = 0
    const poItems: POItem[] = targetPR.items.map(item => ({
      ...item,
      receivedQuantity: 0,
      receipts: []
    }));

    const newPO: PurchaseOrder = {
      id,
      poNumber,
      prNumber: targetPR.prNumber,
      prId: targetPR.id,
      vendorName,
      poDescription: poDescription || targetPR.justification || `ใบสั่งซื้อสำหรับโครงการ ${targetPR.department}`,
      department: targetPR.department,
      projectCode: targetPR.projectCode,
      totalAmount: targetPR.totalAmount,
      status: 'Sent',
      date: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: expectedDeliveryDate || targetPR.requiredDate,
      deliveryLocation: targetPR.deliveryLocation,
      paymentTerms,
      items: poItems,
      signatures: targetPR.signatures ? {
        ...targetPR.signatures,
        requestedBy: targetPR.signatures.requestedBy || {
          name: targetPR.requesterName,
          position: targetPR.requesterPosition || 'ผู้ขอซื้อ',
          date: targetPR.requestDate,
          signed: true
        }
      } : {
        requestedBy: {
          name: 'ฝ่ายจัดซื้อและพัสดุ (Buyer)',
          position: 'เจ้าหน้าที่จัดซื้อ',
          date: new Date().toISOString(),
          signed: true
        }
      }
    };

    // Update PO state
    setPos(prev => [newPO, ...prev]);

    // Update PR state to 'PO Created'
    setPrs(prev => prev.map(p => p.id === targetPR.id ? { ...p, status: 'PO Created' } : p));

    logSystemAction(
      'CREATE_PO',
      `สร้างใบสั่งซื้อ ${poNumber} จาก ${targetPR.prNumber} ส่งมอบให้ ${vendorName}`,
      { poNumber, prNumber: targetPR.prNumber, vendor: vendorName, amount: newPO.totalAmount }
    );

    return newPO;
  };

  const updatePO = (id: string, updates: Partial<PurchaseOrder>) => {
    setPos(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePO = (id: string) => {
    setPos(prev => prev.filter(p => p.id !== id));
  };

  /**
   * CRITICAL LINKAGE: Receiving goods in PO updates Inventory stock!
   */
  const receivePOGoods = (
    poId: string, 
    receiptItems: { itemId: string; quantity: number }[], 
    receiverName: string, 
    location = 'คลังหลักหน้างาน',
    note?: string
  ) => {
    const targetPO = pos.find(p => p.id === poId || p.poNumber === poId);
    if (!targetPO) return;

    const receiptDate = new Date().toISOString().split('T')[0];

    // 1. Update PO items and receipts
    const updatedItems: POItem[] = targetPO.items.map(poItem => {
      const match = receiptItems.find(r => r.itemId === poItem.id);
      if (!match || match.quantity <= 0) return poItem;

      const newReceived = (poItem.receivedQuantity || 0) + match.quantity;
      const newReceipt: POReceipt = {
        id: `rcpt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        date: receiptDate,
        quantity: match.quantity,
        receivedBy: receiverName,
        deliveryNotes: note ? [note] : undefined
      };

      return {
        ...poItem,
        receivedQuantity: newReceived,
        receipts: [...(poItem.receipts || []), newReceipt]
      };
    });

    // Determine if fully or partially received
    const allCompleted = updatedItems.every(i => (i.receivedQuantity || 0) >= i.quantity);
    const newStatus = allCompleted ? 'Completed' : 'Partially Received';

    setPos(prev => prev.map(p => p.id === targetPO.id ? {
      ...p,
      status: newStatus,
      items: updatedItems
    } : p));

    // 2. AUTOMATIC STOCK INCREMENT IN INVENTORY!
    setInventory(prevInventory => {
      const nextInventory = [...prevInventory];

      receiptItems.forEach(r => {
        if (r.quantity <= 0) return;
        const poItem = targetPO.items.find(i => i.id === r.itemId);
        if (!poItem) return;

        // Find existing inventory item by itemCode or description
        const existingIdx = nextInventory.findIndex(inv => 
          (poItem.itemCode && inv.code === poItem.itemCode) ||
          inv.name.toLowerCase() === poItem.description.toLowerCase()
        );

        if (existingIdx >= 0) {
          // Increment stock
          nextInventory[existingIdx] = {
            ...nextInventory[existingIdx],
            quantity: nextInventory[existingIdx].quantity + r.quantity,
            unitPrice: poItem.unitPrice || nextInventory[existingIdx].unitPrice
          };
        } else {
          // Create new stock entry
          const newCode = poItem.itemCode || `MAT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
          nextInventory.push({
            id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            code: newCode,
            name: poItem.description,
            category: 'วัสดุก่อสร้าง',
            quantity: r.quantity,
            unit: poItem.unit || 'หน่วย',
            minStockLevel: Math.ceil(r.quantity * 0.2),
            location,
            unitPrice: poItem.unitPrice
          });
        }
      });

      return nextInventory;
    });

    logSystemAction(
      'RECEIVE_GOODS',
      `ตรวจรับพัสดุสำหรับใบสั่งซื้อ ${targetPO.poNumber} สำเร็จ (${newStatus}) ยอดคลังสินค้าได้รับการปรับปรุงอัตโนมัติ`,
      { poNumber: targetPO.poNumber, receiver: receiverName, status: newStatus }
    );
  };

  // ==========================================
  // Inventory Methods
  // ==========================================
  const addInventoryItem = (item: Omit<InventoryItem, 'id'>): InventoryItem => {
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`
    };
    setInventory(prev => [newItem, ...prev]);
    return newItem;
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const transactInventory = (
    codeOrId: string, 
    deltaQty: number, 
    type: 'IN' | 'OUT' | 'ADJUST', 
    note?: string,
    location?: string
  ): boolean => {
    let success = false;

    setInventory(prev => prev.map(item => {
      if (item.id === codeOrId || item.code === codeOrId || item.sku === codeOrId || item.barcode === codeOrId) {
        let newQty = item.quantity;
        if (type === 'IN') {
          newQty += deltaQty;
        } else if (type === 'OUT') {
          if (item.quantity < deltaQty) {
            alert(`จำนวนสินค้าคงเหลือไม่เพียงพอ (คงเหลือ ${item.quantity} ${item.unit})`);
            return item;
          }
          newQty -= deltaQty;
        } else if (type === 'ADJUST') {
          newQty = deltaQty;
        }

        success = true;
        logSystemAction(
          'INVENTORY_TRANSACT',
          `ทำรายการสต็อก ${type}: ${item.name} (${item.code}) จำนวน ${deltaQty} ${item.unit} ยอดคงเหลือใหม่ ${newQty} ${item.unit}`,
          { code: item.code, type, deltaQty, newQty, note }
        );

        return {
          ...item,
          quantity: newQty,
          location: location || item.location
        };
      }
      return item;
    }));

    return success;
  };

  // ==========================================
  // Approval Matrix Actions
  // ==========================================
  const updateApprovalMatrix = (matrix: ApprovalMatrixStep[]) => {
    const formatted = matrix.map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setApprovalMatrix(formatted);
    logSystemAction(
      'UPDATE_APPROVAL_MATRIX',
      'ปรับปรุงตารางสายการอนุมัติ (Approval Matrix)',
      { stepsCount: formatted.length }
    );
  };

  const updateApprovalStep = (stepId: string, updates: Partial<ApprovalMatrixStep>) => {
    setApprovalMatrix(prev => prev.map(s => s.id === stepId ? { ...s, ...updates } : s));
  };

  const addApprovalStep = (step: Omit<ApprovalMatrixStep, 'id' | 'stepNumber'>) => {
    setApprovalMatrix(prev => {
      const newStep: ApprovalMatrixStep = {
        ...step,
        id: `step-${Date.now()}`,
        stepNumber: prev.length + 1
      };
      return [...prev, newStep];
    });
  };

  const removeApprovalStep = (stepId: string) => {
    setApprovalMatrix(prev => {
      const filtered = prev.filter(s => s.id !== stepId);
      return filtered.map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    });
  };

  const resetApprovalMatrix = () => {
    setApprovalMatrix(DEFAULT_APPROVAL_MATRIX);
    try {
      localStorage.removeItem(APPROVAL_MATRIX_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to reset Approval Matrix:', e);
    }
  };

  // ==========================================
  // Company Profile Actions
  // ==========================================
  const updateCompanyProfile = (updates: Partial<CompanyProfile>) => {
    setCompanyProfile(prev => {
      const next = { ...prev, ...updates };
      logSystemAction({
        action: 'UPDATE_COMPANY_PROFILE',
        entityType: 'SETTINGS',
        entityId: 'company_profile',
        details: 'อัปเดตข้อมูลและตราสัญลักษณ์บริษัท (Company Profile & Logo)'
      });
      return next;
    });
  };

  const resetCompanyProfile = () => {
    setCompanyProfile(DEFAULT_COMPANY_PROFILE);
    try {
      localStorage.removeItem(COMPANY_PROFILE_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to reset Company Profile:', e);
    }
    logSystemAction({
      action: 'RESET_COMPANY_PROFILE',
      entityType: 'SETTINGS',
      entityId: 'company_profile',
      details: 'คืนค่าข้อมูลบริษัทและตราสัญลักษณ์เริ่มต้น'
    });
  };

  // ==========================================
  // Data Import & Integration Actions
  // ==========================================
  const addImportHistoryRecord = (record: Omit<ImportHistoryRecord, 'id' | 'timestamp'>) => {
    const newRecord: ImportHistoryRecord = {
      ...record,
      id: `IMP-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    setImportHistory(prev => [newRecord, ...prev].slice(0, 50));
  };

  const clearImportHistory = () => {
    setImportHistory([]);
    try {
      localStorage.removeItem(IMPORT_HISTORY_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear import history:', e);
    }
  };

  const bulkImportInventory = (
    newItems: Omit<InventoryItem, 'id'>[],
    mode: ImportMergeMode = 'merge'
  ): { added: number; updated: number; total: number } => {
    let addedCount = 0;
    let updatedCount = 0;

    setInventory(prev => {
      if (mode === 'replace') {
        const replaced = newItems.map((item, idx) => ({
          ...item,
          id: `inv-${Date.now()}-${idx + 1}`
        }));
        addedCount = replaced.length;
        return replaced;
      }

      if (mode === 'append') {
        const appended = newItems.map((item, idx) => ({
          ...item,
          id: `inv-${Date.now()}-${idx + 1}`
        }));
        addedCount = appended.length;
        return [...prev, ...appended];
      }

      // Default: 'merge' mode (match on code or sku)
      const currentMap = new Map<string, InventoryItem>();
      prev.forEach(item => {
        const key = (item.code || item.sku || '').trim().toLowerCase();
        if (key) currentMap.set(key, { ...item });
      });

      const updatedList: InventoryItem[] = [...prev];

      newItems.forEach((item, idx) => {
        const key = (item.code || item.sku || '').trim().toLowerCase();
        if (key && currentMap.has(key)) {
          // Merge with existing
          const existing = currentMap.get(key)!;
          const targetIndex = updatedList.findIndex(x => x.id === existing.id);
          if (targetIndex >= 0) {
            updatedList[targetIndex] = {
              ...updatedList[targetIndex],
              ...item,
              id: existing.id,
              // Add quantity if new item quantity is positive
              quantity: (updatedList[targetIndex].quantity || 0) + (item.quantity > 0 ? item.quantity : 0),
              name: item.name || updatedList[targetIndex].name,
              category: item.category || updatedList[targetIndex].category,
              unit: item.unit || updatedList[targetIndex].unit,
              location: item.location || updatedList[targetIndex].location,
              binLocation: item.binLocation || updatedList[targetIndex].binLocation,
              unitPrice: item.unitPrice !== undefined && item.unitPrice > 0 ? item.unitPrice : updatedList[targetIndex].unitPrice,
            };
            updatedCount++;
          }
        } else {
          // Add new item
          const created: InventoryItem = {
            ...item,
            id: `inv-${Date.now()}-${idx + 1}`,
            centralWarehouse: item.centralWarehouse || 'คลังพัสดุก่อสร้างกลาง (Central Material Hub)',
            projectAllocations: item.projectAllocations && item.projectAllocations.length > 0 
              ? item.projectAllocations 
              : ['โครงการ คอนโดสุขุมวิท 101', 'ไซต์งานทั่วไป']
          };
          updatedList.push(created);
          if (key) currentMap.set(key, created);
          addedCount++;
        }
      });

      return updatedList;
    });

    logSystemAction({
      action: 'BULK_IMPORT_INVENTORY',
      entityType: 'INVENTORY',
      entityId: `BATCH-${Date.now()}`,
      details: `นำเข้าพัสดุ ${newItems.length} รายการ (โหมด: ${mode}, เพิ่มใหม่: ${addedCount}, อัปเดตเดิม: ${updatedCount})`
    });

    return { added: addedCount, updated: updatedCount, total: newItems.length };
  };

  const bulkImportVendors = (
    newVendors: Omit<Vendor, 'id'>[],
    mode: ImportMergeMode = 'merge'
  ): { added: number; updated: number; total: number } => {
    let addedCount = 0;
    let updatedCount = 0;

    setVendors(prev => {
      if (mode === 'replace') {
        const replaced = newVendors.map((v, idx) => ({
          ...v,
          id: `v-${Date.now()}-${idx + 1}`
        }));
        addedCount = replaced.length;
        return replaced;
      }

      if (mode === 'append') {
        const appended = newVendors.map((v, idx) => ({
          ...v,
          id: `v-${Date.now()}-${idx + 1}`
        }));
        addedCount = appended.length;
        return [...prev, ...appended];
      }

      // Default: 'merge' mode (match on name or email)
      const updatedList = [...prev];
      newVendors.forEach((vendor, idx) => {
        const matchIndex = updatedList.findIndex(v => 
          (vendor.name && v.name.trim().toLowerCase() === vendor.name.trim().toLowerCase()) ||
          (vendor.email && v.email && v.email.trim().toLowerCase() === vendor.email.trim().toLowerCase())
        );

        if (matchIndex >= 0) {
          updatedList[matchIndex] = {
            ...updatedList[matchIndex],
            ...vendor,
            id: updatedList[matchIndex].id,
            rating: vendor.rating || updatedList[matchIndex].rating,
            onTimeDeliveryRate: vendor.onTimeDeliveryRate || updatedList[matchIndex].onTimeDeliveryRate,
            categories: Array.from(new Set([...(updatedList[matchIndex].categories || []), ...(vendor.categories || [])]))
          };
          updatedCount++;
        } else {
          updatedList.push({
            ...vendor,
            id: `v-${Date.now()}-${idx + 1}`
          });
          addedCount++;
        }
      });

      return updatedList;
    });

    logSystemAction({
      action: 'BULK_IMPORT_VENDORS',
      entityType: 'VENDOR',
      entityId: `BATCH-${Date.now()}`,
      details: `นำเข้าทะเบียนคู่ค้า ${newVendors.length} ราย (โหมด: ${mode}, เพิ่มใหม่: ${addedCount}, อัปเดต: ${updatedCount})`
    });

    return { added: addedCount, updated: updatedCount, total: newVendors.length };
  };

  const bulkImportPRs = (
    newPRs: Omit<PurchaseRequest, 'id'>[]
  ): { added: number; total: number } => {
    const createdList: PurchaseRequest[] = newPRs.map((pr, idx) => {
      const generatedPrNum = pr.prNumber && pr.prNumber.trim().length > 0 
        ? pr.prNumber 
        : `PR-${new Date().getFullYear()}-${String(prs.length + idx + 1).padStart(3, '0')}`;
      
      const calculatedTotal = pr.totalAmount && pr.totalAmount > 0
        ? pr.totalAmount
        : (pr.items || []).reduce((sum, it) => sum + (it.quantity * it.unitPrice), 0);

      return {
        ...pr,
        id: `pr-imp-${Date.now()}-${idx + 1}`,
        prNumber: generatedPrNum,
        status: pr.status || 'Draft',
        requestDate: pr.requestDate || new Date().toISOString(),
        totalAmount: calculatedTotal,
        items: (pr.items || []).map((it, itemIdx) => ({
          ...it,
          id: it.id || `item-${itemIdx + 1}`
        }))
      };
    });

    setPrs(prev => [...createdList, ...prev]);

    logSystemAction({
      action: 'BULK_IMPORT_PR',
      entityType: 'PR',
      entityId: `BATCH-${Date.now()}`,
      details: `นำเข้าใบขอซื้อ/BOQ ${createdList.length} รายการ`
    });

    return { added: createdList.length, total: newPRs.length };
  };

  const bulkImportPOs = (
    newPOs: Omit<PurchaseOrder, 'id'>[]
  ): { added: number; total: number } => {
    const createdList: PurchaseOrder[] = newPOs.map((po, idx) => {
      const generatedPoNum = po.poNumber && po.poNumber.trim().length > 0
        ? po.poNumber
        : `PO-${new Date().getFullYear()}-${String(pos.length + idx + 1).padStart(3, '0')}`;

      const calculatedTotal = po.totalAmount && po.totalAmount > 0
        ? po.totalAmount
        : (po.items || []).reduce((sum, it) => sum + (it.quantity * it.unitPrice), 0);

      return {
        ...po,
        id: `po-imp-${Date.now()}-${idx + 1}`,
        poNumber: generatedPoNum,
        prNumber: po.prNumber || 'PR-IMPORT',
        status: po.status || 'Draft',
        date: po.date || new Date().toISOString(),
        totalAmount: calculatedTotal,
        items: (po.items || []).map((it, itemIdx) => ({
          ...it,
          id: it.id || `item-${itemIdx + 1}`,
          receivedQuantity: it.receivedQuantity || 0
        }))
      };
    });

    setPos(prev => [...createdList, ...prev]);

    logSystemAction({
      action: 'BULK_IMPORT_PO',
      entityType: 'PO',
      entityId: `BATCH-${Date.now()}`,
      details: `นำเข้าใบสั่งซื้อ PO ${createdList.length} รายการ`
    });

    return { added: createdList.length, total: newPOs.length };
  };

  // ==========================================
  // Cloud Integrations & Serverless Sync Actions
  // ==========================================
  const updateIntegrationConfig = (id: IntegrationProviderId, updates: Partial<CloudIntegrationConfig>) => {
    setIntegrations(prev => {
      const current = prev[id] || DEFAULT_INTEGRATIONS[id];
      const updated = {
        ...current,
        ...updates
      };
      logSystemAction({
        action: 'UPDATE_INTEGRATION_CONFIG',
        entityType: 'SETTINGS',
        entityId: id,
        details: `อัปเดตการตั้งค่าปลั๊กอิน: ${updated.name} (เปิดใช้งาน: ${updated.isEnabled ? 'ใช่' : 'ปิด'})`
      });
      return {
        ...prev,
        [id]: updated
      };
    });
  };

  const syncGoogleSheetsData = async (
    targetMod: 'inventory' | 'pr' | 'vendors' = 'inventory'
  ): Promise<{ success: boolean; rowsCount: number; message: string }> => {
    const config = integrations.google_sheets?.googleSheets;
    const sheetUrl = config?.sheetUrl || config?.sheetId;
    if (!sheetUrl) {
      throw new Error('ยังไม่ได้ระบุ Google Sheet URL หรือ Sheet ID');
    }

    const { headers, rows, totalRows } = await fetchGoogleSheetData(sheetUrl);

    // Map rows into system
    if (targetMod === 'inventory') {
      const mappedItems = rows.map((r, idx) => ({
        code: String(r['รหัสพัสดุ'] || r['รหัส'] || r['SKU'] || r['code'] || `SKU-GS-${idx + 1}`),
        sku: String(r['SKU'] || r['รหัสพัสดุ'] || `SKU-GS-${idx + 1}`),
        barcode: String(r['บาร์โค้ด'] || r['barcode'] || `885${1000000000 + idx}`),
        name: String(r['ชื่อสินค้า'] || r['รายการ'] || r['name'] || 'วัสดุจาก Google Sheets'),
        category: String(r['หมวดหมู่'] || r['category'] || 'วัสดุก่อสร้าง'),
        quantity: Number(r['จำนวนสต็อก'] || r['จำนวน'] || r['quantity'] || 0),
        unit: String(r['หน่วยนับ'] || r['หน่วย'] || r['unit'] || 'หน่วย'),
        minStockLevel: Number(r['เกณฑ์สต็อกขั้นต่ำ'] || r['ขั้นต่ำ'] || 0),
        location: String(r['คลังสินค้า'] || r['จุดจัดเก็บ'] || 'คลังพัสดุก่อสร้างกลาง (Central WH)'),
        binLocation: String(r['จุดจัดเก็บในคลังกลาง'] || r['binLocation'] || 'Zone GS-01'),
        centralWarehouse: 'คลังพัสดุก่อสร้างกลาง (Central Material Hub)',
        projectAllocations: ['โครงการ คอนโดสุขุมวิท 101', 'ทุกไซต์งาน'],
        unitPrice: Number(r['ราคาต่อหน่วย'] || r['ราคา'] || 0)
      }));

      bulkImportInventory(mappedItems, 'merge');
    }

    const now = new Date().toISOString();
    updateIntegrationConfig('google_sheets', {
      lastSync: now,
      status: 'connected',
      errorMessage: undefined
    });

    logSystemAction({
      action: 'SYNC_GOOGLE_SHEETS',
      entityType: 'INTEGRATION',
      entityId: 'google_sheets',
      details: `ซิงค์ข้อมูลจาก Google Sheets เข้าสู่ ${targetMod} สำเร็จ ${totalRows} แถว`
    });

    return {
      success: true,
      rowsCount: totalRows,
      message: `ซิงค์ข้อมูลสำเร็จ ${totalRows} แถวจาก Google Sheets`
    };
  };

  const backupSystemToCloud = (): { fileName: string; sizeBytes: number } => {
    const result = generateSystemCloudBackup({
      prs,
      pos,
      inventory,
      vendors,
      approvalMatrix: approvalMatrix as any,
      companyProfile: [companyProfile] as any
    });

    const now = new Date().toISOString();
    updateIntegrationConfig('google_drive', {
      lastSync: now,
      status: 'connected'
    });

    logSystemAction({
      action: 'BACKUP_TO_CLOUD',
      entityType: 'BACKUP',
      entityId: result.fileName,
      details: `สร้างก้อน Snapshot สำรองข้อมูลระบบทั้งหมด (${result.fileName})`
    });

    return result;
  };

  const testLineAlert = async (customMessage?: string): Promise<{ success: boolean; message: string }> => {
    const config = integrations.line_notify?.lineNotify;
    const msg = customMessage || `📢 [ProcureSync Alert] ทดสอบการแจ้งเตือนระบบจัดซื้อหน้างาน ยอดคงเหลือพัสดุและ PR พร้อมใช้งาน`;
    const res = await sendLineNotification(msg, config);

    const now = new Date().toISOString();
    updateIntegrationConfig('line_notify', {
      lastSync: now,
      status: 'connected'
    });

    return res;
  };

  // ==========================================
  // Firebase Cloud Firestore Synchronizations
  // ==========================================
  const syncToFirebase = async (): Promise<{
    success: boolean;
    message: string;
    counts: { prs: number; pos: number; inventory: number; vendors: number };
  }> => {
    const res = await pushAllToFirestore({ prs, pos, inventory, vendors });
    const now = new Date().toISOString();
    updateIntegrationConfig('firebase', {
      lastSync: now,
      status: 'connected',
      firebase: {
        ...integrations.firebase?.firebase,
        lastSyncTime: now
      }
    });
    return res;
  };

  const pullFromFirebase = async (): Promise<{
    success: boolean;
    message: string;
    totalCount: number;
  }> => {
    const res = await pullAllFromFirestore();
    if (res.prs && res.prs.length > 0) setPrs(res.prs);
    if (res.pos && res.pos.length > 0) setPos(res.pos);
    if (res.inventory && res.inventory.length > 0) setInventory(res.inventory);
    if (res.vendors && res.vendors.length > 0) setVendors(res.vendors);

    const now = new Date().toISOString();
    updateIntegrationConfig('firebase', {
      lastSync: now,
      status: 'connected',
      firebase: {
        ...integrations.firebase?.firebase,
        lastSyncTime: now
      }
    });

    return {
      success: true,
      message: `ดึงข้อมูลสำเร็จ ${res.totalCount} รายการจาก Firebase Firestore`,
      totalCount: res.totalCount
    };
  };

  const testFirebase = async (): Promise<{
    success: boolean;
    latencyMs?: number;
    projectId: string;
    databaseId?: string;
    error?: string;
  }> => {
    const res = await testFirebaseConnection();
    updateIntegrationConfig('firebase', {
      status: res.success ? 'connected' : 'error',
      errorMessage: res.error,
      lastSync: new Date().toISOString()
    });
    return res;
  };

  // ==========================================
  // Reset Utility
  // ==========================================
  const resetToSeedData = () => {
    setPrs(SEED_PRS);
    setPos(SEED_POS);
    setInventory(SEED_INVENTORY);
    setVendors(SEED_VENDORS);
    setApprovalMatrix(DEFAULT_APPROVAL_MATRIX);
    setCompanyProfile(DEFAULT_COMPANY_PROFILE);
    setImportHistory([]);
    localStorage.removeItem(PR_STORAGE_KEY);
    localStorage.removeItem(PO_STORAGE_KEY);
    localStorage.removeItem(INVENTORY_STORAGE_KEY);
    localStorage.removeItem(VENDOR_STORAGE_KEY);
    localStorage.removeItem(APPROVAL_MATRIX_STORAGE_KEY);
    localStorage.removeItem(COMPANY_PROFILE_STORAGE_KEY);
    localStorage.removeItem(IMPORT_HISTORY_STORAGE_KEY);
  };

  return (
    <ProcurementContext.Provider value={{
      prs,
      pos,
      inventory,
      vendors,
      approvalTasks,
      approvalMatrix,
      updateApprovalMatrix,
      updateApprovalStep,
      addApprovalStep,
      removeApprovalStep,
      resetApprovalMatrix,
      companyProfile,
      updateCompanyProfile,
      resetCompanyProfile,
      importHistory,
      addImportHistoryRecord,
      clearImportHistory,
      bulkImportInventory,
      bulkImportVendors,
      bulkImportPRs,
      bulkImportPOs,
      integrations,
      updateIntegrationConfig,
      syncGoogleSheetsData,
      backupSystemToCloud,
      testLineAlert,
      syncToFirebase,
      pullFromFirebase,
      testFirebase,
      createPR,
      updatePR,
      deletePR,
      submitPRForApproval,
      approvePR,
      rejectPR,
      createPOFromPR,
      updatePO,
      deletePO,
      receivePOGoods,
      addInventoryItem,
      updateInventoryItem,
      transactInventory,
      resetToSeedData
    }}>
      {children}
    </ProcurementContext.Provider>
  );
};

export function useProcurement() {
  const context = useContext(ProcurementContext);
  if (!context) {
    throw new Error('useProcurement must be used within a ProcurementProvider');
  }
  return context;
}
