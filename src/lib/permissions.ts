import type { PermissionKey, PermissionModule, PermissionDefinition, RoleConfig } from '../types';

export const MODULE_INFO: Record<PermissionModule, { labelTh: string; labelEn: string; iconName: string; descTh: string; descEn: string }> = {
  dashboard: {
    labelTh: 'แดชบอร์ดภาพรวม',
    labelEn: 'Executive Dashboard',
    iconName: 'LayoutDashboard',
    descTh: 'ภาพรวมสถานะจัดซื้อ ตัวชี้วัด KPI และความเคลื่อนไหวล่าสุด',
    descEn: 'Procurement overview, KPI metrics, and recent activity'
  },
  pr: {
    labelTh: 'ใบขอซื้อ (PR)',
    labelEn: 'Purchase Request (PR)',
    iconName: 'ShoppingCart',
    descTh: 'การสร้าง ติดตาม และจัดการใบขอซื้อวัสดุ/อุปกรณ์โครงการ',
    descEn: 'Create, track, and manage project material requisition slips'
  },
  approvals: {
    labelTh: 'ระบบอนุมัติเอกสาร',
    labelEn: 'Approval Workflow',
    iconName: 'ClipboardCheck',
    descTh: 'กระบวนการพิจารณาอนุมัติ ตรวจสอบวงเงิน และส่งกลับแก้ไข',
    descEn: 'Review, threshold verification, approve, and return PR/PO'
  },
  po: {
    labelTh: 'ใบสั่งซื้อ (PO)',
    labelEn: 'Purchase Order (PO)',
    iconName: 'FileText',
    descTh: 'การแปลง PR เป็น PO ออกใบสั่งซื้อ บันทึกส่งคู่ค้า และควบคุมสัญญา',
    descEn: 'Convert approved PRs to POs, issue orders, and contract tracking'
  },
  inventory: {
    labelTh: 'คลังพัสดุและตรวจรับ (GR)',
    labelEn: 'Inventory & Receiving (GR)',
    iconName: 'Package',
    descTh: 'ตรวจรับสินค้า (Goods Receipt), สแกน QR และเช็กสต็อกคงเหลือ',
    descEn: 'Goods receipt entry, QR verification, and stock movements'
  },
  vendors: {
    labelTh: 'ทะเบียนคู่ค้าและผู้ขาย',
    labelEn: 'Vendor Management',
    iconName: 'Store',
    descTh: 'จัดการข้อมูลบริษัทคู่ค้า เงื่อนไขการชำระเงิน และคะแนนประเมิน',
    descEn: 'Supplier directory, credit terms, and performance rating'
  },
  reports: {
    labelTh: 'รายงานและการวิเคราะห์',
    labelEn: 'Reports & Analytics',
    iconName: 'BarChart3',
    descTh: 'รายงานค่าใช้จ่าย สถิติการจัดซื้อ และการส่งออกข้อมูล Excel/PDF',
    descEn: 'Spending analytics, procurement efficiency, and data export'
  },
  users: {
    labelTh: 'ผู้ใช้งานและกำหนดสิทธิ์',
    labelEn: 'Users & Roles (RBAC)',
    iconName: 'Users',
    descTh: 'การบริหารจัดการบัญชีผู้ใช้ กำหนดบทบาท และตรวจสอบ Audit Trail',
    descEn: 'User administration, role permission matrix, and audit trail logs'
  },
  settings: {
    labelTh: 'ตั้งค่าระบบ',
    labelEn: 'System Settings',
    iconName: 'Settings',
    descTh: 'ข้อมูลบริษัท การแจ้งเตือน PWA ภาษา และความปลอดภัย',
    descEn: 'Company profile, PWA settings, notifications, and security'
  }
};

export const PERMISSIONS_LIST: PermissionDefinition[] = [
  // Dashboard
  {
    key: 'dashboard:view',
    module: 'dashboard',
    labelTh: 'ดูแดชบอร์ดภาพรวมและสถิติ',
    labelEn: 'View Executive Dashboard',
    descTh: 'เข้าถึงหน้าแดชบอร์ด ดูสรุปงบประมาณ ยอดสั่งซื้อ และกิจกรรมล่าสุด',
    descEn: 'Access main dashboard, spend summaries, and real-time feeds'
  },

  // Purchase Request (PR)
  {
    key: 'pr:view',
    module: 'pr',
    labelTh: 'ดูรายการใบขอซื้อ (PR)',
    labelEn: 'View Purchase Requests',
    descTh: 'ดูรายการและรายละเอียดใบขอซื้อทั้งหมดในระบบ',
    descEn: 'View all PR records and their detailed specifications'
  },
  {
    key: 'pr:create',
    module: 'pr',
    labelTh: 'สร้างใบขอซื้อใหม่ (PR)',
    labelEn: 'Create Purchase Request',
    descTh: 'เปิดใบขอซื้อ ระบุรายการวัสดุ และส่งขออนุมัติในระบบ',
    descEn: 'Initiate new requisition, add items, and submit for approval'
  },
  {
    key: 'pr:edit',
    module: 'pr',
    labelTh: 'แก้ไขใบขอซื้อ',
    labelEn: 'Edit Purchase Request',
    descTh: 'แก้ไขข้อมูล รายการวัสดุ หรือแนบเอกสารเพิ่มเติมใน PR ที่ยังไม่อนุมัติ',
    descEn: 'Modify item lists or attachments on pending PRs'
  },
  {
    key: 'pr:delete',
    module: 'pr',
    labelTh: 'ยกเลิกหรือลบใบขอซื้อ',
    labelEn: 'Cancel/Delete Purchase Request',
    descTh: 'ยกเลิกหรือลบใบขอซื้อที่ไม่อนุมัติหรือไม่ต้องการดำเนินการต่อ',
    descEn: 'Cancel or remove draft/rejected PR entries'
  },
  {
    key: 'pr:export',
    module: 'pr',
    labelTh: 'พิมพ์และดาวน์โหลด PDF (PR)',
    labelEn: 'Print & Export PR Document',
    descTh: 'ดาวน์โหลดแบบฟอร์มใบขอซื้อมาตรฐานหรือพิมพ์ออกเครื่องพิมพ์',
    descEn: 'Generate standard PR form PDF and direct print'
  },

  // Approval Workflow
  {
    key: 'approvals:view',
    module: 'approvals',
    labelTh: 'ดูรายการรออนุมัติและประวัติ',
    labelEn: 'View Approval Tasks & History',
    descTh: 'เข้าดูเอกสารในคิวรออนุมัติและบันทึกประวัติการอนุมัติย้อนหลัง',
    descEn: 'Inspect pending approval queues and historical decision records'
  },
  {
    key: 'approvals:approve_pr',
    module: 'approvals',
    labelTh: 'อนุมัติใบขอซื้อ (Approve PR)',
    labelEn: 'Approve Purchase Request',
    descTh: 'ลงนามพิจารณาอนุมัติใบขอซื้อเพื่อส่งต่อไปยังฝ่ายจัดซื้อ',
    descEn: 'Sign-off and endorse PRs to transition to purchasing workflow'
  },
  {
    key: 'approvals:approve_po',
    module: 'approvals',
    labelTh: 'อนุมัติใบสั่งซื้อ (Approve PO)',
    labelEn: 'Approve Purchase Order',
    descTh: 'อนุมัติวงเงินและข้อตกลงในใบสั่งซื้อก่อนส่งออกไปยังคู่ค้า',
    descEn: 'Grant executive authorization on issued purchase orders'
  },
  {
    key: 'approvals:reject',
    module: 'approvals',
    labelTh: 'ปฏิเสธหรือส่งกลับแก้ไข',
    labelEn: 'Reject or Return for Revision',
    descTh: 'ตีกลับเอกสารพร้อมระบุเหตุผลเพื่อขอให้ผู้เปิดรายการแก้ไข',
    descEn: 'Decline or send documents back to requester with remarks'
  },

  // Purchase Order (PO)
  {
    key: 'po:view',
    module: 'po',
    labelTh: 'ดูรายการใบสั่งซื้อ (PO)',
    labelEn: 'View Purchase Orders',
    descTh: 'ดูรายการใบสั่งซื้อ ติดตามสถานะการส่งมอบ และยอดเงินทั้งหมด',
    descEn: 'Browse all PO documents, delivery progress, and payment terms'
  },
  {
    key: 'po:create',
    module: 'po',
    labelTh: 'สร้างใบสั่งซื้อ (PO จาก PR)',
    labelEn: 'Create Purchase Order',
    descTh: 'แปลง PR ที่ผ่านการอนุมัติแล้วมาสร้างใบสั่งซื้อ และเลือกคู่ค้า',
    descEn: 'Convert approved requisition into formal supplier purchase order'
  },
  {
    key: 'po:issue',
    module: 'po',
    labelTh: 'บันทึกส่งใบสั่งซื้อให้คู่ค้า (Issue PO)',
    labelEn: 'Issue PO to Supplier',
    descTh: 'เปลี่ยนสถานะเป็นส่งใบสั่งซื้อ พร้อมบันทึกหลักฐานการสั่งการ',
    descEn: 'Mark PO as officially issued and dispatched to vendor'
  },
  {
    key: 'po:cancel',
    module: 'po',
    labelTh: 'ยกเลิกใบสั่งซื้อ',
    labelEn: 'Cancel Purchase Order',
    descTh: 'ยกเลิกคำสั่งซื้อเมื่อเกิดการเปลี่ยนแปลงหรือยกเลิกสัญญากับคู่ค้า',
    descEn: 'Cancel active purchase order with audit reasons'
  },
  {
    key: 'po:export',
    module: 'po',
    labelTh: 'พิมพ์และดาวน์โหลด PDF (PO)',
    labelEn: 'Print & Export PO Document',
    descTh: 'สร้างไฟล์เอกสารใบสั่งซื้ออย่างเป็นทางการพร้อมเงื่อนไขชำระเงิน',
    descEn: 'Generate official PO printouts with terms and signature sections'
  },

  // Inventory & Receiving (GR)
  {
    key: 'inventory:view',
    module: 'inventory',
    labelTh: 'ดูสต็อกพัสดุและรายการคงเหลือ',
    labelEn: 'View Inventory & Stock Levels',
    descTh: 'ดูรายการพัสดุ ยอดคงเหลือ ยอดจอง และรายการใกล้หมดสต็อก',
    descEn: 'Monitor material catalog, available counts, and reorder warnings'
  },
  {
    key: 'inventory:receive_gr',
    module: 'inventory',
    labelTh: 'บันทึกตรวจรับพัสดุเข้าคลัง (Goods Receipt)',
    labelEn: 'Goods Receipt Entry (GR)',
    descTh: 'บันทึกจำนวนของที่มาส่งจริง เทียบกับใบสั่งซื้อ และเพิ่มสต็อก',
    descEn: 'Log delivered quantities against PO and update inventory'
  },
  {
    key: 'inventory:qr_scan',
    module: 'inventory',
    labelTh: 'สแกน QR Code ตรวจรับและเช็กสต็อก',
    labelEn: 'QR Code Scanning Verification',
    descTh: 'ใช้กล้องสแกน QR Code เพื่อตรวจสอบพัสดุหรือรับเข้าหน้างานทันที',
    descEn: 'Use camera scanner for fast QR lookup and site delivery check-in'
  },
  {
    key: 'inventory:adjust_stock',
    module: 'inventory',
    labelTh: 'ปรับปรุงยอดสต็อก (Stock Adjustment)',
    labelEn: 'Stock Adjustment & Catalog Management',
    descTh: 'แก้ไขจำนวนสต็อกเมื่อตรวจนับ หรือเพิ่ม/แก้ไขรายการพัสดุใหม่',
    descEn: 'Manually calibrate physical count variance or modify item catalog'
  },

  // Vendors
  {
    key: 'vendors:view',
    module: 'vendors',
    labelTh: 'ดูทะเบียนคู่ค้าและผู้จัดจำหน่าย',
    labelEn: 'View Vendor Directory',
    descTh: 'ค้นหาและดูข้อมูลติดต่อ เครดิตเทอม และประวัติการจัดซื้อของคู่ค้า',
    descEn: 'Browse supplier catalog, contact info, and transaction records'
  },
  {
    key: 'vendors:manage',
    module: 'vendors',
    labelTh: 'เพิ่มและแก้ไขข้อมูลคู่ค้า',
    labelEn: 'Add & Edit Vendor Profiles',
    descTh: 'บันทึกคู่ค้ารายใหม่ อัปเดตข้อมูลภาษี และที่อยู่จัดส่ง',
    descEn: 'Register new suppliers, update tax ID, and address records'
  },
  {
    key: 'vendors:rate',
    module: 'vendors',
    labelTh: 'บันทึกการประเมินผลคู่ค้า (Rating)',
    labelEn: 'Evaluate & Rate Vendors',
    descTh: 'ให้คะแนนคุณภาพสินค้า ความตรงต่อเวลา และการบริการ',
    descEn: 'Score supplier performance on quality, timeliness, and support'
  },

  // Reports
  {
    key: 'reports:view',
    module: 'reports',
    labelTh: 'ดูรายงานสรุปและการวิเคราะห์',
    labelEn: 'View Spend Reports & Analytics',
    descTh: 'เข้าดูรายงานค่าใช้จ่ายจัดซื้อ ประสิทธิภาพการส่งมอบ และงบโครงการ',
    descEn: 'Inspect financial procurement reports and budget utilization'
  },
  {
    key: 'reports:export',
    module: 'reports',
    labelTh: 'ส่งออกข้อมูลรายงาน (Excel / PDF)',
    labelEn: 'Export Reports (Excel / PDF)',
    descTh: 'ดาวน์โหลดข้อมูลรายงานไปประมวลผลต่อใน Excel หรือจัดพิมพ์รายงาน',
    descEn: 'Export analytical datasets for accounting and management review'
  },

  // Users & Roles (RBAC - Admin Focus)
  {
    key: 'users:view',
    module: 'users',
    labelTh: 'ดูรายชื่อผู้ใช้งานและบทบาท',
    labelEn: 'View Users Directory',
    descTh: 'ดูรายชื่อพนักงาน แผนก บทบาทหน้าที่ และสถานะการใช้งาน',
    descEn: 'Browse employee list, assigned departments, and roles'
  },
  {
    key: 'users:manage_users',
    module: 'users',
    labelTh: 'จัดการผู้ใช้งาน (เพิ่ม/แก้ไข/ระงับ)',
    labelEn: 'Manage User Accounts',
    descTh: 'สร้างบัญชีผู้ใช้ใหม่ เปลี่ยนบทบาท หรือระงับการเข้าถึงระบบ',
    descEn: 'Create accounts, assign positions, and suspend access'
  },
  {
    key: 'users:manage_roles',
    module: 'users',
    labelTh: 'กำหนดสิทธิ์ของแต่ละบทบาท (Role Matrix)',
    labelEn: 'Configure Roles & Permission Matrix',
    descTh: 'สิทธิ์ระดับสูงสำหรับแอดมิน: เปิด/ปิดสิทธิ์ของแต่ละตำแหน่งอย่างละเอียด',
    descEn: 'Administrative power: configure granular permissions per role'
  },
  {
    key: 'users:audit_logs',
    module: 'users',
    labelTh: 'ดูประวัติการใช้งานระบบ (Audit Trail Logs)',
    labelEn: 'View System Audit Trail Logs',
    descTh: 'ตรวจสอบประวัติกิจกรรม ใครทำอะไร ที่ไหน เมื่อไหร่ เพื่อความโปร่งใส',
    descEn: 'Inspect comprehensive activity timeline for compliance & security'
  },

  // System Settings
  {
    key: 'settings:view',
    module: 'settings',
    labelTh: 'ดูการตั้งค่าระบบและข้อมูลบริษัท',
    labelEn: 'View System Settings',
    descTh: 'ดูข้อมูลบริษัท การตั้งค่าภาษา และความพร้อมใช้งานของระบบ',
    descEn: 'View organization details, language options, and app status'
  },
  {
    key: 'settings:manage',
    module: 'settings',
    labelTh: 'แก้ไขการตั้งค่าระบบ (System Configuration)',
    labelEn: 'Modify System Configuration',
    descTh: 'เปลี่ยนข้อมูลบริษัท ตั้งค่าการแจ้งเตือน สำรองข้อมูล หรือจัดการแคช',
    descEn: 'Update company profile, notification preferences, and backup'
  }
];

export const ALL_PERMISSION_KEYS: PermissionKey[] = PERMISSIONS_LIST.map(p => p.key);

export const DEFAULT_ROLES_CONFIG: RoleConfig[] = [
  {
    id: 'role-admin',
    name: 'Admin',
    titleTh: 'ผู้ดูแลระบบสูงสุด (System Admin)',
    titleEn: 'System Administrator',
    descTh: 'เข้าถึงทุกระบบ 100% มีอำนาจสูงสุดในการกำหนดสิทธิ์ทุกตำแหน่ง จัดการผู้ใช้งาน และตรวจสอบ Audit Logs',
    descEn: 'Full system superuser: manages users, configures role permissions, and oversees security',
    avatarText: 'AD',
    color: 'bg-indigo-600 text-white',
    isSystem: true,
    isAdmin: true,
    permissions: [...ALL_PERMISSION_KEYS],
    usersCount: 1
  },
  {
    id: 'role-purchasing-manager',
    name: 'Purchasing Manager',
    titleTh: 'ผู้จัดการฝ่ายจัดซื้อ (Purchasing Manager)',
    titleEn: 'Purchasing Manager',
    descTh: 'บริหารงานจัดซื้อ ตรวจสอบและอนุมัติ PR/PO บริหารคู่ค้า และดูรายงานวิเคราะห์งบประมาณทั้งหมด',
    descEn: 'Oversees procurement, approves PR & PO, manages suppliers, and views financial reports',
    avatarText: 'PM',
    color: 'bg-amber-600 text-white',
    isSystem: true,
    permissions: [
      'dashboard:view',
      'pr:view', 'pr:create', 'pr:edit', 'pr:export',
      'approvals:view', 'approvals:approve_pr', 'approvals:approve_po', 'approvals:reject',
      'po:view', 'po:create', 'po:issue', 'po:cancel', 'po:export',
      'inventory:view',
      'vendors:view', 'vendors:manage', 'vendors:rate',
      'reports:view', 'reports:export',
      'users:view',
      'settings:view'
    ],
    usersCount: 1
  },
  {
    id: 'role-purchasing-staff',
    name: 'Purchasing Staff',
    titleTh: 'เจ้าหน้าที่จัดซื้อ (Buyer / Procurement Staff)',
    titleEn: 'Purchasing Staff / Buyer',
    descTh: 'เปิดใบขอซื้อ ออกใบสั่งซื้อ (PO) จาก PR ที่อนุมัติ ส่งให้ผู้ขาย และประสานงานตรวจรับพัสดุ',
    descEn: 'Creates PRs, converts approved PRs to POs, dispatches to suppliers, and supports receiving',
    avatarText: 'PS',
    color: 'bg-blue-600 text-white',
    isSystem: true,
    permissions: [
      'dashboard:view',
      'pr:view', 'pr:create', 'pr:export',
      'approvals:view',
      'po:view', 'po:create', 'po:issue', 'po:export',
      'inventory:view', 'inventory:receive_gr', 'inventory:qr_scan',
      'vendors:view', 'vendors:rate',
      'reports:view'
    ],
    usersCount: 3
  },
  {
    id: 'role-approver',
    name: 'Approver',
    titleTh: 'ผู้อนุมัติโครงการ (Approver / Project Director)',
    titleEn: 'Project Director / Approver',
    descTh: 'พิจารณาอนุมัติใบขอซื้อ (PR) และใบสั่งซื้อ (PO) ตามงบประมาณ ปฏิเสธ หรือขอข้อมูลเพิ่มเติม',
    descEn: 'Evaluates and signs off on high-value PRs and POs against project budget thresholds',
    avatarText: 'AP',
    color: 'bg-violet-600 text-white',
    isSystem: true,
    permissions: [
      'dashboard:view',
      'pr:view', 'pr:export',
      'approvals:view', 'approvals:approve_pr', 'approvals:approve_po', 'approvals:reject',
      'po:view', 'po:export',
      'reports:view', 'reports:export'
    ],
    usersCount: 2
  },
  {
    id: 'role-site-engineer',
    name: 'Site Engineer',
    titleTh: 'วิศวกรสนาม (Site Engineer / Requester)',
    titleEn: 'Site Engineer / Field Requester',
    descTh: 'เปิดใบขอซื้อวัสดุ (PR) สำหรับหน้างาน ติดตามสถานะอนุมัติ ตรวจเช็กสต็อก และสแกน QR พัสดุ',
    descEn: 'Submits site material requisitions, tracks approval status, checks stock, and scans QR tags',
    avatarText: 'SE',
    color: 'bg-cyan-600 text-white',
    isSystem: true,
    permissions: [
      'dashboard:view',
      'pr:view', 'pr:create', 'pr:edit', 'pr:export',
      'approvals:view',
      'inventory:view', 'inventory:qr_scan',
      'vendors:view'
    ],
    usersCount: 4
  },
  {
    id: 'role-inventory-control',
    name: 'Inventory Control',
    titleTh: 'ผู้ดูแลคลังพัสดุ (Inventory Control / Storekeeper)',
    titleEn: 'Inventory Controller / Storekeeper',
    descTh: 'บันทึกรับของเข้าคลัง (Goods Receipt) สแกน QR Code ตรวจสอบสินค้า ควบคุมและปรับปรุงสต็อก',
    descEn: 'Manages warehouse, logs goods receipt, performs QR inspection, and adjusts stock balances',
    avatarText: 'IC',
    color: 'bg-emerald-600 text-white',
    isSystem: true,
    permissions: [
      'dashboard:view',
      'pr:view',
      'po:view',
      'inventory:view', 'inventory:receive_gr', 'inventory:qr_scan', 'inventory:adjust_stock',
      'reports:view'
    ],
    usersCount: 4
  }
];

export function getPermissionsByModule(): Record<PermissionModule, PermissionDefinition[]> {
  const grouped: Record<PermissionModule, PermissionDefinition[]> = {
    dashboard: [],
    pr: [],
    approvals: [],
    po: [],
    inventory: [],
    vendors: [],
    reports: [],
    users: [],
    settings: []
  };

  PERMISSIONS_LIST.forEach(perm => {
    grouped[perm.module].push(perm);
  });

  return grouped;
}
