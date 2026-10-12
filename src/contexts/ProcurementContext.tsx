import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  PurchaseRequest, 
  PurchaseOrder, 
  InventoryItem, 
  ApprovalTask, 
  Vendor,
  POItem,
  POReceipt
} from '../types';
import { logSystemAction } from '../lib/auditLog';

// Storage Keys
const STORAGE_PREFIX = 'procuresync_store_';
const PR_STORAGE_KEY = `${STORAGE_PREFIX}prs`;
const PO_STORAGE_KEY = `${STORAGE_PREFIX}pos`;
const INVENTORY_STORAGE_KEY = `${STORAGE_PREFIX}inventory`;
const VENDOR_STORAGE_KEY = `${STORAGE_PREFIX}vendors`;

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
  { id: '1', code: 'MAT-CEM-01', name: 'ปูนซีเมนต์ปอร์ตแลนด์ (ตราช้าง)', category: 'วัสดุก่อสร้าง', quantity: 450, unit: 'ถุง', minStockLevel: 100, location: 'ไซโล 1', unitPrice: 155 },
  { id: '2', code: 'MAT-STL-24', name: 'เหล็กเส้นกลม SR24', category: 'วัสดุก่อสร้าง', quantity: 15, unit: 'ตัน', minStockLevel: 20, location: 'ลานเก็บ B', unitPrice: 24500 },
  { id: '3', code: 'TOL-DRL-01', name: 'สว่านโรตารี่', category: 'เครื่องมือช่าง', quantity: 2, unit: 'เครื่อง', minStockLevel: 5, location: 'ห้องช่าง', unitPrice: 3850 },
  { id: '4', code: 'SAF-HLM-01', name: 'หมวกนิรภัย', category: 'อุปกรณ์เซฟตี้', quantity: 120, unit: 'ใบ', minStockLevel: 50, location: 'ห้องสโตร์', unitPrice: 280 },
  { id: '5', code: 'MAT-TILE-60', name: 'กระเบื้องแกรนิตโต้ 60x60 ซม.', category: 'วัสดุก่อสร้าง', quantity: 120, unit: 'กล่อง', minStockLevel: 50, location: 'โกดัง A', unitPrice: 425 }
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

  // 3. Derived Approval Tasks dynamically synchronized from PRs
  const approvalTasks: ApprovalTask[] = prs.map(pr => {
    const level = pr.totalAmount > 500000 ? 3 : pr.totalAmount > 50000 ? 2 : 1;
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
      items: poItems
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
      if (item.id === codeOrId || item.code === codeOrId) {
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
  // Reset Utility
  // ==========================================
  const resetToSeedData = () => {
    setPrs(SEED_PRS);
    setPos(SEED_POS);
    setInventory(SEED_INVENTORY);
    setVendors(SEED_VENDORS);
    localStorage.removeItem(PR_STORAGE_KEY);
    localStorage.removeItem(PO_STORAGE_KEY);
    localStorage.removeItem(INVENTORY_STORAGE_KEY);
    localStorage.removeItem(VENDOR_STORAGE_KEY);
  };

  return (
    <ProcurementContext.Provider value={{
      prs,
      pos,
      inventory,
      vendors,
      approvalTasks,
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
