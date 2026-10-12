export type PRStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'PO Created' | 'Cancelled';
export type POStatus = 'Draft' | 'Issued' | 'Sent' | 'Partially Received' | 'Completed' | 'Cancelled';
export type PRUrgency = 'normal' | 'urgent' | 'emergency';

export interface PRItem {
  id: string;
  itemCode?: string;
  description: string;
  specification?: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  remark?: string;
}

export interface SignatureEntry {
  name: string;
  position: string;
  date?: string;
  signed?: boolean;
  comments?: string;
}

export interface PRSignatures {
  requestedBy: SignatureEntry;
  checkedBy?: SignatureEntry;
  budgetCheckedBy?: SignatureEntry;
  approvedBy?: SignatureEntry;
  [key: string]: SignatureEntry | undefined;
}

export interface ApprovalMatrixStep {
  id: string;
  stepNumber: number;
  roleKey: string;           // 'requestedBy' | 'checkedBy' | 'budgetCheckedBy' | 'approvedBy' | custom key
  titleTh: string;           // e.g. 'ผู้ขอซื้อ', 'ผู้ตรวจสอบ', 'ผู้ตรวจสอบงบประมาณ', 'ผู้อนุมัติ'
  titleEn: string;           // e.g. 'Requested By', 'Technical Checked By', 'Budget / Cost Control', 'Approved By'
  defaultName: string;       // e.g. 'สมชาย ช่างก่อสร้าง'
  defaultPosition: string;   // e.g. 'วิศวกรสนาม (Site Engineer)'
  department?: string;       // e.g. 'ฝ่ายปฏิบัติการ / ไซต์งาน'
  minAmount?: number;        // e.g. 0
  maxAmount?: number;        // e.g. 50000, 500000 (undefined = unlimited)
  appliesTo: ('PR' | 'PO')[]; // Document types requiring this step
  isRequired: boolean;
}

export interface PurchaseRequest {
  id: string;
  prNumber: string;
  requesterName: string;
  requesterPosition?: string;
  department: string;
  projectCode?: string;
  requestDate: string;
  requiredDate?: string;
  deliveryLocation?: string;
  urgency?: PRUrgency;
  status: PRStatus;
  justification?: string;
  suggestedVendor?: string;
  contactPhone?: string;
  items: PRItem[];
  includeVat?: boolean;
  vatAmount?: number;
  totalAmount: number; // Grand total including VAT if applicable
  attachmentsCount?: number;
  signatures?: PRSignatures;
  templateCategory?: string;
}

export interface PRTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultDepartment?: string;
  defaultJustification?: string;
  defaultUrgency?: PRUrgency;
  items: Omit<PRItem, 'id'>[];
  iconName?: string;
  isCustom?: boolean;
}

export interface ApprovalTask {
  id: string;
  documentId: string;
  documentType: 'PR' | 'PO';
  requester: string;
  requestDate: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  level: number;
  prData?: PurchaseRequest;
}

export interface InventoryItem {
  id: string;
  code: string;
  sku?: string;               // Master SKU (รหัสพัสดุมาตรฐานคลังพัสดุก่อสร้างกลาง)
  barcode?: string;           // 1D Barcode (Code 128 / EAN สำหรับเครื่องยิงบาร์โค้ด)
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStockLevel: number;
  location: string;           // คลังสินค้า / ตำแหน่งจัดเก็บ
  binLocation?: string;       // โซนจัดเก็บย่อยในคลัง (เช่น Zone A-01 / Rack 2)
  centralWarehouse?: string;  // คลังพัสดุก่อสร้างกลาง (Central Construction Material Hub)
  projectAllocations?: string[]; // โครงการ/ไซต์งานก่อสร้างที่เบิกใช้วัสดุนี้ เช่น ['โครงการ คอนโดสุขุมวิท 101', 'โครงการ โรงพยาบาลบางนา']
  unitPrice?: number;
}

export interface POReceipt {
  id: string;
  date: string;
  quantity: number;
  receivedBy: string;
  isDirectToSite?: boolean;
  deliveryNotes?: string[];
}

export interface POItem extends PRItem {
  receivedQuantity: number;
  receipts?: POReceipt[];
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  prNumber: string;
  prId?: string;
  vendorName: string;
  vendorId?: string;
  poDescription?: string;
  department?: string;
  projectCode?: string;
  totalAmount: number;
  status: POStatus;
  date: string;
  orderDate?: string;
  expectedDeliveryDate?: string;
  deliveryLocation?: string;
  paymentTerms?: string;
  items: POItem[];
  signatures?: PRSignatures;
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  paymentTerms: string;
  rating: number; // out of 5
  onTimeDeliveryRate: number; // percentage
  categories: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Site Engineer' | 'Purchasing Staff' | 'Purchasing Manager' | 'Approver' | 'Inventory Control' | 'Admin' | string;
  status: 'Active' | 'Inactive';
  lastLogin?: string;
  department?: string;
}

export type PermissionKey =
  // Dashboard
  | 'dashboard:view'
  // Purchase Request (PR)
  | 'pr:view'
  | 'pr:create'
  | 'pr:edit'
  | 'pr:delete'
  | 'pr:export'
  // Approval Workflow
  | 'approvals:view'
  | 'approvals:approve_pr'
  | 'approvals:approve_po'
  | 'approvals:reject'
  // Purchase Order (PO)
  | 'po:view'
  | 'po:create'
  | 'po:issue'
  | 'po:cancel'
  | 'po:export'
  // Inventory & Receiving
  | 'inventory:view'
  | 'inventory:receive_gr'
  | 'inventory:qr_scan'
  | 'inventory:adjust_stock'
  // Vendors
  | 'vendors:view'
  | 'vendors:manage'
  | 'vendors:rate'
  // Reports & Analytics
  | 'reports:view'
  | 'reports:export'
  // Users & Roles (Admin focus)
  | 'users:view'
  | 'users:manage_users'
  | 'users:manage_roles'
  | 'users:audit_logs'
  // System Settings
  | 'settings:view'
  | 'settings:manage';

export type PermissionModule = 
  | 'dashboard' 
  | 'pr' 
  | 'approvals' 
  | 'po' 
  | 'inventory' 
  | 'vendors' 
  | 'reports' 
  | 'users' 
  | 'settings';

export interface PermissionDefinition {
  key: PermissionKey;
  module: PermissionModule;
  labelTh: string;
  labelEn: string;
  descTh: string;
  descEn: string;
}

export interface RoleConfig {
  id: string;
  name: string;
  titleTh: string;
  titleEn: string;
  descTh: string;
  descEn: string;
  avatarText: string;
  color: string;
  isSystem: boolean;
  isAdmin?: boolean;
  permissions: PermissionKey[];
  usersCount?: number;
}

export interface CompanyProfile {
  nameTh: string;
  nameEn: string;
  taxId: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
  docFormatPR?: string;
  docFormatPO?: string;
}

