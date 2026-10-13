/**
 * Enterprise Demo Preset Service
 * Provides rich, realistic construction & enterprise procurement datasets
 * for sales presentations, client demos, and 1-click system resets.
 */

import type {
  PurchaseRequest,
  PurchaseOrder,
  InventoryItem,
  Vendor,
  ApprovalMatrixStep,
  CompanyProfile
} from '../types';
import { DEFAULT_APPROVAL_MATRIX } from '../data/defaultApprovalMatrix';

export const ENTERPRISE_DEMO_COMPANY: CompanyProfile = {
  nameTh: 'บริษัท โคนเนอเรจ คอนสตรัคชั่น แอนด์ ซัพพลาย จำกัด',
  nameEn: 'CONERAGE CONSTRUCTION & SUPPLY CO., LTD.',
  taxId: '0105566098765',
  address: 'เลขที่ 888 อาคารโคนเนอเรจ ทาวเวอร์ ชั้น 18 ถนนพระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310',
  phone: '02-098-7654',
  email: 'procurement@conerage.co.th',
  logoUrl: '/pwa-192x192.png',
  website: 'https://conerage.co.th',
  branch: 'สำนักงานใหญ่ (Headquarters)'
};

export const ENTERPRISE_DEMO_PRS: PurchaseRequest[] = [
  {
    id: 'pr-demo-001',
    prNumber: 'PR-2026-001',
    requesterName: 'สมชาย ช่างก่อสร้าง',
    requesterPosition: 'วิศวกรสนาม (Site Engineer)',
    department: 'โครงการ คอนโดไฮด์ สุขุมวิท 101',
    projectCode: 'PRJ-SKV101',
    contactPhone: '081-987-6543',
    deliveryLocation: 'ไซต์งานคอนโดไฮด์ สุขุมวิท 101 (จุดรับวัสดุ ประตู 2)',
    requestDate: '2026-05-18T10:00:00Z',
    requiredDate: '2026-05-25T00:00:00Z',
    urgency: 'urgent',
    status: 'Pending Approval',
    justification: 'ขอสั่งซื้อวัสดุสำหรับงานเทคอนกรีตฐานรากและเสาตอม่อ ชั้นใต้ดินตามแผนงานงวดที่ 2 อ้างอิง BOQ งานโครงสร้าง',
    suggestedVendor: 'บริษัท ปูนซิเมนต์ไทย (เอสซีจี) จำกัด (มหาชน)',
    includeVat: true,
    vatAmount: 24500,
    totalAmount: 374500,
    items: [
      { id: 'item-1', itemCode: 'MAT-CONC-240', description: 'คอนกรีตผสมเสร็จ 240 ksc Cube', specification: 'Slump 10±2.5 cm ปูนตราช้าง สำหรับฐานราก', quantity: 35, unitPrice: 1950, unit: 'คิว', remark: 'นัดส่งรอบเช้า 08:30 น.' },
      { id: 'item-2', itemCode: 'MAT-STEEL-DB16', description: 'เหล็กข้ออ้อย DB16 SD40', specification: 'ความยาว 10 เมตร มอก. 24-2559 มีใบ Mill Cert', quantity: 150, unitPrice: 420, unit: 'เส้น', remark: 'เหล็กเสาตอม่อ' },
      { id: 'item-3', itemCode: 'MAT-STEEL-RB9', description: 'เหล็กเส้นกลม RB9 SR24', specification: 'ความยาว 10 เมตร มอก. 20-2559', quantity: 200, unitPrice: 135, unit: 'เส้น', remark: 'ดัดเหล็กปลอกเสา' },
      { id: 'item-4', itemCode: 'MAT-WIRE-01', description: 'ลวดผูกเหล็กเบอร์ 18', specification: 'น้ำหนัก 2.5 กก./ขด ชุบนุ่มเหนียวพิเศษ', quantity: 20, unitPrice: 180, unit: 'ขด', remark: 'ผูกเหล็กโครงสร้าง' },
      { id: 'item-5', itemCode: 'MAT-WOOD-PLY', description: 'ไม้อัดเคลือบฟิล์มดำ 15 มม.', specification: 'ขนาด 122x244 ซม. เกรดหล่อคอนกรีต 4-6 ครั้ง', quantity: 40, unitPrice: 650, unit: 'แผ่น', remark: 'ทำแบบข้างคาน' }
    ],
    signatures: {
      requestedBy: {
        name: 'สมชาย ช่างก่อสร้าง',
        position: 'วิศวกรสนาม',
        date: '2026-05-18T10:00:00Z',
        signed: true
      },
      checkedBy: {
        name: 'นายอภิสิทธิ์ กลิ่นสุคนธ์',
        position: 'วิศวกรโครงการ (Project Engineer)',
        date: '2026-05-18T14:30:00Z',
        signed: true,
        comments: 'ตรวจสอบรายการสเปกตรงตามแบบวิศวกรรมแล้ว'
      },
      budgetCheckedBy: {
        name: 'นางสาวกัญญา พงษ์ศิริ',
        position: 'เจ้าหน้าที่ควบคุมต้นทุน (Cost Control)',
        date: '2026-05-18T16:00:00Z',
        signed: true,
        comments: 'ยอดสั่งซื้ออยู่ในกรอบงบประมาณ BOQ งานโครงสร้าง'
      }
    }
  },
  {
    id: 'pr-demo-002',
    prNumber: 'PR-2026-002',
    requesterName: 'วิศรุต ควบคุมงาน',
    requesterPosition: 'วิศวกรไฟฟ้า (M&E Engineer)',
    department: 'โครงการ รถไฟฟ้าสายสีส้ม สัญญา 3',
    projectCode: 'PRJ-MRT-OR3',
    contactPhone: '089-123-4567',
    deliveryLocation: 'สถานีรามคำแหง 12 จุดคลังพัสดุชั่วคราว',
    requestDate: '2026-05-19T09:15:00Z',
    requiredDate: '2026-05-28T00:00:00Z',
    urgency: 'normal',
    status: 'Approved',
    justification: 'จัดซื้อสายไฟและท่อร้อยสายไฟ EMT สำหรับงานระบบไฟฟ้าชั่วคราวและระบบไฟส่องสว่างอุโมงค์',
    suggestedVendor: 'บริษัท บางกอกเคเบิ้ล จำกัด',
    includeVat: true,
    vatAmount: 4507.48,
    totalAmount: 68900,
    items: [
      { id: 'item-201', itemCode: 'EL-CABLE-THW', description: 'สายไฟ THW 1x2.5 sq.mm. สีดำ', specification: 'มอก. 11 เล่ม 3-2553 ม้วนละ 100 เมตร ยี่ห้อ BCC/Yazaki', quantity: 15, unitPrice: 980, unit: 'ม้วน', remark: 'งานระบบแสงสว่าง' },
      { id: 'item-202', itemCode: 'EL-PIPE-EMT12', description: 'ท่อร้อยสายไฟ EMT 1/2 นิ้ว', specification: 'มาตรฐาน ANSI C80.1 เกลียวมอก. ยาว 3.05 เมตร', quantity: 120, unitPrice: 165, unit: 'ท่อน', remark: 'เดินท่อผนังชั่วคราว' },
      { id: 'item-203', itemCode: 'EL-BOX-SQ4', description: 'กล่องสี่เหลี่ยม Handy Box 2x4 นิ้ว', specification: 'ชุบสังกะสีหนา 1.2 มม. มีน็อกเอาท์รอบด้าน', quantity: 80, unitPrice: 28, unit: 'ใบ', remark: 'จุดต่อสายไฟ' },
      { id: 'item-204', itemCode: 'EL-BREAKER-30', description: 'เบรกเกอร์กันดูด RCBO 2P 30A', specification: 'Schneider / ABB ตัดกระแสไฟรั่ว 30mA มีปุ่ม Test', quantity: 12, unitPrice: 1250, unit: 'ตัว', remark: 'ตู้คอนโทรลย่อย' }
    ],
    signatures: {
      requestedBy: { name: 'วิศรุต ควบคุมงาน', position: 'วิศวกรไฟฟ้า', date: '2026-05-19T09:15:00Z', signed: true },
      checkedBy: { name: 'นายอภิสิทธิ์ กลิ่นสุคนธ์', position: 'วิศวกรโครงการ', date: '2026-05-19T11:00:00Z', signed: true },
      budgetCheckedBy: { name: 'นางสาวกัญญา พงษ์ศิริ', position: 'Cost Control', date: '2026-05-19T13:40:00Z', signed: true },
      approvedBy: { name: 'นายธนาคาร เจริญกิจ (ผู้อำนวยการฝ่ายจัดซื้อ)', position: 'Procurement Director', date: '2026-05-19T15:20:00Z', signed: true, comments: 'อนุมัติเรียบร้อย ดำเนินการออก PO ได้ทันที' }
    }
  },
  {
    id: 'pr-demo-003',
    prNumber: 'PR-2026-003',
    requesterName: 'เกรียงศักดิ์ ซ่อมบำรุง',
    requesterPosition: 'หัวหน้าช่างกลหนัก (Plant Foreman)',
    department: 'คลังพัสดุกลางและศูนย์ซ่อม ปทุมธานี',
    projectCode: 'CENTRAL-PTN',
    contactPhone: '086-555-8899',
    deliveryLocation: 'ศูนย์ซ่อมเครื่องจักรกลหนัก ปทุมธานี',
    requestDate: '2026-05-20T08:00:00Z',
    requiredDate: '2026-05-21T00:00:00Z',
    urgency: 'emergency',
    status: 'Pending Approval',
    justification: 'เครื่องกำเนิดไฟฟ้า 150 kVA หลักของไซต์งานเกิดปัญหาน้ำมันหล่อลื่นรั่วซึมและไดชาร์จเสียหาย ต้องจัดหาอะไหล่ด่วนที่สุดเพื่อป้องกันงานหยุดชะงัก',
    suggestedVendor: 'บริษัท ยนต์ตระการเครื่องจักรกล จำกัด',
    includeVat: true,
    vatAmount: 8400,
    totalAmount: 128400,
    items: [
      { id: 'item-301', itemCode: 'MCH-GEN-ALT', description: 'Alternator ชุดไดชาร์จ 24V 60A', specification: 'สำหรับเครื่องยนต์ Cummins 6BT5.9 แท้ศูนย์', quantity: 1, unitPrice: 38500, unit: 'ชุด', remark: 'ด่วนมาก ขอส่งวันนี้' },
      { id: 'item-302', itemCode: 'MCH-OIL-15W40', description: 'น้ำมันเครื่องดีเซล SAE 15W-40 CI-4 (ถัง 200 ลิตร)', specification: 'แบรนด์ Shell Rimula R4 / PTT Dynamic', quantity: 2, unitPrice: 28500, unit: 'ถัง', remark: 'เปลี่ยนถ่ายทั้งระบบ' },
      { id: 'item-303', itemCode: 'MCH-FIL-SET', description: 'ชุดไส้กรองน้ำมันเครื่องและไส้กรองโซล่าแท้', specification: 'ครบเซ็ต 4 ชิ้น ตรงรุ่น Cummins 6BT', quantity: 3, unitPrice: 4800, unit: 'ชุด', remark: 'สำรองคลัง 2 ชุด' }
    ],
    signatures: {
      requestedBy: { name: 'เกรียงศักดิ์ ซ่อมบำรุง', position: 'หัวหน้าช่างกลหนัก', date: '2026-05-20T08:00:00Z', signed: true }
    }
  },
  {
    id: 'pr-demo-004',
    prNumber: 'PR-2026-004',
    requesterName: 'ประสิทธิ์ มงคล',
    requesterPosition: 'โฟร์แมนโครงสร้าง (Structural Foreman)',
    department: 'โครงการ อาคารศูนย์การแพทย์ บางนา',
    projectCode: 'PRJ-MED-BN',
    contactPhone: '084-321-9988',
    deliveryLocation: 'ไซต์อาคารศูนย์การแพทย์ บางนา ลานลงเหล็กโซน A',
    requestDate: '2026-05-15T11:00:00Z',
    requiredDate: '2026-05-22T00:00:00Z',
    urgency: 'normal',
    status: 'PO Created',
    justification: 'จัดซื้อเหล็กข้ออ้อย DB20 และ DB25 สำหรับงานหล่อคานสะพานเชื่อมอาคาร',
    suggestedVendor: 'บริษัท ทาทา สตีล (ประเทศไทย) จำกัด (มหาชน)',
    includeVat: true,
    vatAmount: 31532.71,
    totalAmount: 482000,
    items: [
      { id: 'item-401', itemCode: 'MAT-STEEL-DB20', description: 'เหล็กข้ออ้อย DB20 SD40 ยาว 10 เมตร', specification: 'มอก. 24-2559 มีใบรับรองสารเคมีและแรงดึง', quantity: 350, unitPrice: 650, unit: 'เส้น', remark: 'งานคานสะพานเชื่อม' },
      { id: 'item-402', itemCode: 'MAT-STEEL-DB25', description: 'เหล็กข้ออ้อย DB25 SD40 ยาว 12 เมตร', specification: 'มอก. 24-2559 เกรดงานต้านแผ่นดินไหว', quantity: 200, unitPrice: 1115, unit: 'เส้น', remark: 'งานเสาตอม่อหลัก' }
    ]
  },
  {
    id: 'pr-demo-005',
    prNumber: 'PR-2026-005',
    requesterName: 'อารียา สุขสมบัติ',
    requesterPosition: 'สถาปนิกสนาม (Site Architect)',
    department: 'โครงการ คอนโดไฮด์ สุขุมวิท 101',
    projectCode: 'PRJ-SKV101',
    contactPhone: '087-444-2211',
    deliveryLocation: 'ห้องตัวอย่าง ชั้น 2 อาคารคอนโดไฮด์ สุขุมวิท 101',
    requestDate: '2026-05-20T14:00:00Z',
    requiredDate: '2026-05-30T00:00:00Z',
    urgency: 'normal',
    status: 'Draft',
    justification: 'จัดหาสีทาภายนอกระบบกันซึมและอะคริลิกยืดหยุ่นสูงสำหรับงานตกแต่งผนังส่วน Façade',
    suggestedVendor: 'บริษัท ทีโอเอ เพ้นท์ (ประเทศไทย) จำกัด (มหาชน)',
    includeVat: true,
    vatAmount: 3545.79,
    totalAmount: 54200,
    items: [
      { id: 'item-501', itemCode: 'COL-EXT-WHITE', description: 'สีทาภายนอก TOA 7 in 1 สีขาว Super White (ถัง 5 แกลลอน)', specification: 'อะคริลิกยืดหยุ่นปกปิดรอยแตกลายงา กันน้ำซึม 100%', quantity: 15, unitPrice: 2850, unit: 'ถัง', remark: 'งานผนังส่วนหน้า' },
      { id: 'item-502', itemCode: 'COL-PRIMER', description: 'น้ำยารองพื้นปูนเก่า TOA Contact Primer (ถัง 5 แกลลอน)', specification: 'สูตรน้ำมัน แทรกซึมลึก เสริมการยึดเกาะ', quantity: 6, unitPrice: 1900, unit: 'ถัง', remark: 'ทารองพื้นรอบแรก' }
    ]
  }
];

export const ENTERPRISE_DEMO_POS: PurchaseOrder[] = [
  {
    id: 'po-demo-001',
    poNumber: 'PO-2026-001',
    prNumber: 'PR-2026-004',
    vendorName: 'บริษัท ทาทา สตีล (ประเทศไทย) จำกัด (มหาชน)',
    vendorId: 'ven-001',
    poDescription: 'สั่งซื้อเหล็กข้ออ้อย DB20 และ DB25 สำหรับงานโครงสร้างคานสะพานเชื่อมอาคารศูนย์การแพทย์',
    department: 'โครงการ อาคารศูนย์การแพทย์ บางนา',
    projectCode: 'PRJ-MED-BN',
    totalAmount: 482000,
    status: 'Issued',
    date: '2026-05-16T10:00:00Z',
    orderDate: '2026-05-16',
    deliveryDate: '2026-05-24',
    paymentTerms: 'เครดิตเทอม 30 วัน นับจากวันตรวจรับของครบ',
    shippingAddress: 'ไซต์งานอาคารศูนย์การแพทย์ บางนา ซอยวัดด่าน ถนนศรีนครินทร์ สมุทรปราการ',
    taxId: '0105566098765',
    contactPerson: 'คุณอรรถพล (ผู้จัดการฝ่ายขายโครงการ)',
    contactPhone: '02-710-9999',
    items: [
      { id: 'poi-1', itemCode: 'MAT-STEEL-DB20', description: 'เหล็กข้ออ้อย DB20 SD40 ยาว 10 เมตร', specification: 'มอก. 24-2559 มีใบรับรองสารเคมีและแรงดึง', quantity: 350, unitPrice: 650, unit: 'เส้น', receivedQuantity: 0 },
      { id: 'poi-2', itemCode: 'MAT-STEEL-DB25', description: 'เหล็กข้ออ้อย DB25 SD40 ยาว 12 เมตร', specification: 'มอก. 24-2559 เกรดงานต้านแผ่นดินไหว', quantity: 200, unitPrice: 1115, unit: 'เส้น', receivedQuantity: 0 }
    ]
  },
  {
    id: 'po-demo-002',
    poNumber: 'PO-2026-002',
    prNumber: 'PR-2026-002',
    vendorName: 'บริษัท บางกอกเคเบิ้ล จำกัด',
    vendorId: 'ven-002',
    poDescription: 'สั่งซื้อสายไฟ THW และท่อร้อยสายไฟ EMT งานระบบไฟฟ้าอุโมงค์สัญญา 3',
    department: 'โครงการ รถไฟฟ้าสายสีส้ม สัญญา 3',
    projectCode: 'PRJ-MRT-OR3',
    totalAmount: 68900,
    status: 'Partially Received',
    date: '2026-05-19T16:00:00Z',
    orderDate: '2026-05-19',
    deliveryDate: '2026-05-26',
    paymentTerms: 'เครดิตเทอม 45 วัน',
    shippingAddress: 'สถานีรามคำแหง 12 จุดคลังพัสดุชั่วคราว',
    taxId: '0105566098765',
    contactPerson: 'คุณธวัชชัย (ผู้ประสานงานฝ่ายจัดส่ง)',
    contactPhone: '02-384-0069',
    items: [
      { id: 'poi-201', itemCode: 'EL-CABLE-THW', description: 'สายไฟ THW 1x2.5 sq.mm. สีดำ (ม้วน 100 ม.)', specification: 'มอก. 11 เล่ม 3-2553 ยี่ห้อ BCC แท้', quantity: 15, unitPrice: 980, unit: 'ม้วน', receivedQuantity: 15 },
      { id: 'poi-202', itemCode: 'EL-PIPE-EMT12', description: 'ท่อร้อยสายไฟ EMT 1/2 นิ้ว ยาว 3.05 ม.', specification: 'มาตรฐาน ANSI C80.1 ชุบสังกะสี', quantity: 120, unitPrice: 165, unit: 'ท่อน', receivedQuantity: 60 },
      { id: 'poi-203', itemCode: 'EL-BOX-SQ4', description: 'กล่องสี่เหลี่ยม Handy Box 2x4 นิ้ว', specification: 'เหล็กชุบสังกะสีหนา 1.2 มม.', quantity: 80, unitPrice: 28, unit: 'ใบ', receivedQuantity: 80 },
      { id: 'poi-204', itemCode: 'EL-BREAKER-30', description: 'เบรกเกอร์กันดูด RCBO 2P 30A 30mA', specification: 'Schneider แท้ มีปุ่มทดสอบ Trip', quantity: 12, unitPrice: 1250, unit: 'ตัว', receivedQuantity: 0 }
    ]
  },
  {
    id: 'po-demo-003',
    poNumber: 'PO-2026-003',
    prNumber: 'PR-2026-DEMO-OLD',
    vendorName: 'บริษัท ไทยวัสดุภัณฑ์ ก่อสร้าง จำกัด',
    vendorId: 'ven-003',
    poDescription: 'จัดซื้อหมวกนิรภัยและรองเท้าเซฟตี้สำหรับพนักงานใหม่และผู้เข้าตรวจงาน',
    department: 'คลังพัสดุกลางและศูนย์ซ่อม ปทุมธานี',
    projectCode: 'CENTRAL-PTN',
    totalAmount: 28500,
    status: 'Completed',
    date: '2026-05-10T11:00:00Z',
    orderDate: '2026-05-10',
    deliveryDate: '2026-05-14',
    paymentTerms: 'ชำระเงินสด / โอนเมื่อตรวจรับครบ',
    shippingAddress: 'คลังพัสดุกลาง ปทุมธานี',
    taxId: '0105566098765',
    contactPerson: 'คุณเพ็ญศรี (ฝ่ายขาย)',
    contactPhone: '02-901-2345',
    items: [
      { id: 'poi-301', itemCode: 'PPE-HELMET-W', description: 'หมวกนิรภัย มอก. รองในปรับหมุน สีขาว', specification: 'มอก. 368-2554 รองใน 6 จุด พร้อมสายรัดคาง', quantity: 50, unitPrice: 220, unit: 'ใบ', receivedQuantity: 50 },
      { id: 'poi-302', itemCode: 'PPE-SHOES-42', description: 'รองเท้าหัวเหล็กพื้นเคฟลาร์ เบอร์ 42', specification: 'หนังแท้ ทนน้ำมัน รับแรงกระแทก 200J', quantity: 25, unitPrice: 700, unit: 'คู่', receivedQuantity: 25 }
    ]
  }
];

export const ENTERPRISE_DEMO_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-demo-001',
    code: 'MAT-CONC-240',
    sku: 'CON-C240-STD',
    barcode: '8859123400018',
    name: 'คอนกรีตผสมเสร็จ 240 ksc Cube (ปูนช้าง)',
    category: 'งานโครงสร้าง (Structural)',
    quantity: 120,
    unit: 'คิว',
    minStockLevel: 30,
    minQuantity: 30,
    location: 'คลังพัสดุไซต์งานคอนโดไฮด์ สุขุมวิท 101',
    binLocation: 'Zone Batching Plant A',
    centralWarehouse: 'คลังปูนมอร์ตาร์และคอนกรีต สุขุมวิท',
    projectAllocations: ['โครงการ คอนโดไฮด์ สุขุมวิท 101', 'โครงการ อาคารศูนย์การแพทย์ บางนา'],
    unitPrice: 1950
  },
  {
    id: 'inv-demo-002',
    code: 'MAT-STEEL-DB16',
    sku: 'STL-DB16-SD40',
    barcode: '8859123400025',
    name: 'เหล็กข้ออ้อย DB16 SD40 ยาว 10 ม. (มอก. 24-2559)',
    category: 'งานโครงสร้าง (Structural)',
    quantity: 420,
    unit: 'เส้น',
    minStockLevel: 100,
    minQuantity: 100,
    location: 'คลังพัสดุกลาง ปทุมธานี',
    binLocation: 'Rack S-01 (ลานเหล็กกลาง)',
    centralWarehouse: 'ศูนย์กระจายเหล็กเส้นและข้ออ้อย ปทุมธานี',
    projectAllocations: ['โครงการ รถไฟฟ้าสายสีส้ม สัญญา 3', 'โครงการ อาคารศูนย์การแพทย์ บางนา'],
    unitPrice: 420
  },
  {
    id: 'inv-demo-003',
    code: 'MAT-STEEL-DB20',
    sku: 'STL-DB20-SD40',
    barcode: '8859123400032',
    name: 'เหล็กข้ออ้อย DB20 SD40 ยาว 10 ม. (มอก. 24-2559)',
    category: 'งานโครงสร้าง (Structural)',
    quantity: 8,
    unit: 'เส้น',
    minStockLevel: 50,
    minQuantity: 50,
    location: 'ไซต์งานอาคารศูนย์การแพทย์ บางนา',
    binLocation: 'Rack S-03',
    centralWarehouse: 'ศูนย์กระจายเหล็กเส้นและข้ออ้อย ปทุมธานี',
    projectAllocations: ['โครงการ อาคารศูนย์การแพทย์ บางนา'],
    unitPrice: 650
  },
  {
    id: 'inv-demo-004',
    code: 'MAT-WIRE-01',
    sku: 'WIR-BW18-25KG',
    barcode: '8859123400049',
    name: 'ลวดผูกเหล็กเบอร์ 18 (ขดละ 2.5 กิโลกรัม)',
    category: 'งานโครงสร้าง (Structural)',
    quantity: 65,
    unit: 'ขด',
    minStockLevel: 20,
    minQuantity: 20,
    location: 'คลังพัสดุไซต์งานคอนโดไฮด์ สุขุมวิท 101',
    binLocation: 'Shelf A-04',
    centralWarehouse: 'คลังพัสดุกลาง ปทุมธานี',
    projectAllocations: ['โครงการ คอนโดไฮด์ สุขุมวิท 101'],
    unitPrice: 180
  },
  {
    id: 'inv-demo-005',
    code: 'MAT-WOOD-PLY',
    sku: 'WOD-PLY-15MM',
    barcode: '8859123400056',
    name: 'ไม้อัดเคลือบฟิล์มดำ 15 มม. (เกรดงานหล่อ 4-6 ครั้ง)',
    category: 'งานแบบหล่อ (Formwork)',
    quantity: 5,
    unit: 'แผ่น',
    minStockLevel: 30,
    minQuantity: 30,
    location: 'คลังพัสดุไซต์งานคอนโดไฮด์ สุขุมวิท 101',
    binLocation: 'Zone F-02 (กองไม้แบบ)',
    centralWarehouse: 'คลังพัสดุกลาง ปทุมธานี',
    projectAllocations: ['โครงการ คอนโดไฮด์ สุขุมวิท 101'],
    unitPrice: 650
  },
  {
    id: 'inv-demo-006',
    code: 'EL-CABLE-THW',
    sku: 'ELC-THW-25-BK',
    barcode: '8859123400063',
    name: 'สายไฟ THW 1x2.5 sq.mm. สีดำ ม้วน 100 เมตร (BCC)',
    category: 'งานระบบไฟฟ้า (Electrical)',
    quantity: 45,
    unit: 'ม้วน',
    minStockLevel: 10,
    minQuantity: 10,
    location: 'สถานีรามคำแหง 12 จุดคลังพัสดุชั่วคราว',
    binLocation: 'Rack E-12',
    centralWarehouse: 'คลังอุปกรณ์ระบบไฟฟ้า มีนบุรี',
    projectAllocations: ['โครงการ รถไฟฟ้าสายสีส้ม สัญญา 3'],
    unitPrice: 980
  },
  {
    id: 'inv-demo-007',
    code: 'EL-PIPE-EMT12',
    sku: 'ELP-EMT-12-3M',
    barcode: '8859123400070',
    name: 'ท่อร้อยสายไฟ EMT 1/2 นิ้ว ยาว 3.05 ม. มาตรฐาน ANSI',
    category: 'งานระบบไฟฟ้า (Electrical)',
    quantity: 260,
    unit: 'ท่อน',
    minStockLevel: 50,
    minQuantity: 50,
    location: 'สถานีรามคำแหง 12 จุดคลังพัสดุชั่วคราว',
    binLocation: 'Rack E-02',
    centralWarehouse: 'คลังอุปกรณ์ระบบไฟฟ้า มีนบุรี',
    projectAllocations: ['โครงการ รถไฟฟ้าสายสีส้ม สัญญา 3'],
    unitPrice: 165
  },
  {
    id: 'inv-demo-008',
    code: 'PLUMB-PVC-4IN',
    sku: 'PLB-PVC-485-4',
    barcode: '8859123400087',
    name: 'ท่อ PVC ตราช้าง ชั้น 8.5 ขนาด 4 นิ้ว ยาว 4 เมตร',
    category: 'งานสุขาภิบาลและประปา (Sanitary)',
    quantity: 85,
    unit: 'ท่อน',
    minStockLevel: 25,
    minQuantity: 25,
    location: 'คลังพัสดุกลาง ปทุมธานี',
    binLocation: 'Zone P-01 (ลานท่อ PVC)',
    centralWarehouse: 'คลังพัสดุกลาง ปทุมธานี',
    projectAllocations: ['โครงการ คอนโดไฮด์ สุขุมวิท 101', 'โครงการ อาคารศูนย์การแพทย์ บางนา'],
    unitPrice: 420
  },
  {
    id: 'inv-demo-009',
    code: 'COL-EXT-WHITE',
    sku: 'COL-TOA-7IN1-W',
    barcode: '8859123400094',
    name: 'สีทาภายนอก TOA 7 in 1 ซูเปอร์ไวท์ ถัง 5 แกลลอน',
    category: 'งานสถาปัตยกรรมและสี (Finishing)',
    quantity: 32,
    unit: 'ถัง',
    minStockLevel: 10,
    minQuantity: 10,
    location: 'คลังพัสดุไซต์งานคอนโดไฮด์ สุขุมวิท 101',
    binLocation: 'Room C-01 (ห้องเคมีภัณฑ์แอร์คอนดิชัน)',
    centralWarehouse: 'คลังเคมีภัณฑ์และสี สุวรรณภูมิ',
    projectAllocations: ['โครงการ คอนโดไฮด์ สุขุมวิท 101'],
    unitPrice: 2850
  },
  {
    id: 'inv-demo-010',
    code: 'PPE-HELMET-W',
    sku: 'PPE-HLM-WHITE',
    barcode: '8859123400100',
    name: 'หมวกนิรภัย มอก. สีขาว รองในปรับหมุน 6 จุด',
    category: 'อุปกรณ์ความปลอดภัย (Safety PPE)',
    quantity: 75,
    unit: 'ใบ',
    minStockLevel: 20,
    minQuantity: 20,
    location: 'คลังพัสดุกลาง ปทุมธานี',
    binLocation: 'Locker PPE-01',
    centralWarehouse: 'คลังพัสดุกลาง ปทุมธานี',
    projectAllocations: ['ทุกโครงการก่อสร้าง'],
    unitPrice: 220
  },
  {
    id: 'inv-demo-011',
    code: 'PPE-VEST-ORG',
    sku: 'PPE-VST-ORG-R',
    barcode: '8859123400117',
    name: 'เสื้อกั๊กสะท้อนแสงสีส้มมาตรฐาน EN471 แถบสะท้อนแสง 3M',
    category: 'อุปกรณ์ความปลอดภัย (Safety PPE)',
    quantity: 4,
    unit: 'ตัว',
    minStockLevel: 25,
    minQuantity: 25,
    location: 'สถานีรามคำแหง 12 จุดคลังพัสดุชั่วคราว',
    binLocation: 'Locker PPE-02',
    centralWarehouse: 'คลังพัสดุกลาง ปทุมธานี',
    projectAllocations: ['โครงการ รถไฟฟ้าสายสีส้ม สัญญา 3'],
    unitPrice: 150
  },
  {
    id: 'inv-demo-012',
    code: 'EQP-DRILL-BOSCH',
    sku: 'EQP-BSH-GBH226',
    barcode: '8859123400124',
    name: 'สว่านโรตารี่ 3 ระบบ Bosch GBH 2-26 DFR 800W',
    category: 'เครื่องมือช่างและอุปกรณ์กล (Tools)',
    quantity: 14,
    unit: 'ชุด',
    minStockLevel: 5,
    minQuantity: 5,
    location: 'ศูนย์ซ่อมเครื่องจักรกลหนัก ปทุมธานี',
    binLocation: 'Tool Room T-05',
    centralWarehouse: 'ศูนย์ซ่อมเครื่องจักรกลหนัก ปทุมธานี',
    projectAllocations: ['ทุกโครงการก่อสร้าง'],
    unitPrice: 5890
  }
];

export const ENTERPRISE_DEMO_VENDORS: Vendor[] = [
  {
    id: 'ven-001',
    name: 'บริษัท ปูนซิเมนต์ไทย (เอสซีจี) จำกัด (มหาชน)',
    contactPerson: 'คุณเกรียงไกร ชัยมงคล (Key Account Manager)',
    phone: '02-586-3333',
    email: 'scgconstruction@scg.com',
    address: '1 ถนนปูนซิเมนต์ไทย บางซื่อ กรุงเทพฯ 10800',
    taxId: '0107537000987',
    category: 'วัสดุก่อสร้างและโครงสร้างหลัก',
    rating: 4.9,
    creditTermDays: 30,
    paymentMethod: 'โอนเงินเข้าบัญชี (Transfer)',
    bankAccount: 'ธนาคารกรุงเทพ 101-9-88776-6'
  },
  {
    id: 'ven-002',
    name: 'บริษัท ทาทา สตีล (ประเทศไทย) จำกัด (มหาชน)',
    contactPerson: 'คุณอรรถพล กิตติรัตน์ (Sales Director)',
    phone: '02-710-9999',
    email: 'sales.th@tatasteel.com',
    address: '555 อาคารรสา ทาวเวอร์ 2 ชั้น 20 ถนนพหลโยธิน จตุจักร กรุงเทพฯ 10900',
    taxId: '0107545000123',
    category: 'เหล็กเส้นและผลิตภัณฑ์เหล็กโครงสร้าง',
    rating: 4.8,
    creditTermDays: 45,
    paymentMethod: 'โอนเงินเข้าบัญชี (Transfer)',
    bankAccount: 'ธนาคารกสิกรไทย 002-1-44556-7'
  },
  {
    id: 'ven-003',
    name: 'บริษัท บางกอกเคเบิ้ล จำกัด',
    contactPerson: 'คุณธวัชชัย วงศ์สวัสดิ์ (Head of Projects)',
    phone: '02-384-0069',
    email: 'project.sales@bangkokcable.com',
    address: '187 ถนนราชดำริ แขวงลุมพินี เขตปทุมวัน กรุงเทพฯ 10330',
    taxId: '0105508002345',
    category: 'สายไฟฟ้าและอุปกรณ์ระบบไฟฟ้า',
    rating: 4.7,
    creditTermDays: 45,
    paymentMethod: 'เช็คสั่งจ่ายล่วงหน้า / โอนเงิน',
    bankAccount: 'ธนาคารไทยพาณิชย์ 045-3-11223-4'
  },
  {
    id: 'ven-004',
    name: 'บริษัท ทีโอเอ เพ้นท์ (ประเทศไทย) จำกัด (มหาชน)',
    contactPerson: 'คุณมนัส ศรีวิไล (ฝ่ายขายโครงการพาณิชย์)',
    phone: '02-335-5555',
    email: 'commercial@toagroup.com',
    address: '31/2 หมู่ 3 ถนนบางนา-ตราด กม.23 บางเสาธง สมุทรปราการ 10570',
    taxId: '0107560000342',
    category: 'สีทาอาคารและเคมีภัณฑ์ก่อสร้าง',
    rating: 4.8,
    creditTermDays: 30,
    paymentMethod: 'โอนเงินเข้าบัญชี (Transfer)',
    bankAccount: 'ธนาคารกรุงไทย 015-6-77889-0'
  },
  {
    id: 'ven-005',
    name: 'บริษัท ไทยวัสดุภัณฑ์ ก่อสร้าง จำกัด',
    contactPerson: 'คุณเพ็ญศรี ปานแก้ว (ผู้จัดการทั่วไป)',
    phone: '02-901-2345',
    email: 'contact@thaiwatsadu-supply.com',
    address: '99/1 ถนนรังสิต-ปทุมธานี ตำบลบางพูน อำเภอเมือง ปทุมธานี 12000',
    taxId: '0135558004567',
    category: 'เครื่องมือช่างและอุปกรณ์ความปลอดภัย PPE',
    rating: 4.6,
    creditTermDays: 15,
    paymentMethod: 'เงินสด / โอนทันที',
    bankAccount: 'ธนาคารทหารไทยธนชาต 123-2-99887-1'
  }
];

export interface FullSystemSnapshot {
  version: string;
  exportedAt: string;
  companyProfile: CompanyProfile;
  prs: PurchaseRequest[];
  pos: PurchaseOrder[];
  inventory: InventoryItem[];
  vendors: Vendor[];
  approvalMatrix: ApprovalMatrixStep[];
}

/**
 * Returns full enterprise demo state payload
 */
export function getFullEnterpriseDemoState(): FullSystemSnapshot {
  return {
    version: '3.0.0-enterprise-demo',
    exportedAt: new Date().toISOString(),
    companyProfile: ENTERPRISE_DEMO_COMPANY,
    prs: ENTERPRISE_DEMO_PRS,
    pos: ENTERPRISE_DEMO_POS,
    inventory: ENTERPRISE_DEMO_INVENTORY,
    vendors: ENTERPRISE_DEMO_VENDORS,
    approvalMatrix: DEFAULT_APPROVAL_MATRIX
  };
}

/**
 * Returns a clean, empty state ready for real production deployment
 */
export function getCleanEmptyState(): FullSystemSnapshot {
  return {
    version: '3.0.0-clean-production',
    exportedAt: new Date().toISOString(),
    companyProfile: {
      nameTh: 'บริษัท [ชื่อบริษัทของคุณ] จำกัด',
      nameEn: '[YOUR COMPANY NAME] CO., LTD.',
      taxId: '0000000000000',
      address: 'กรุณาระบุที่อยู่สำนักงานใหญ่หรือสาขาที่นี่',
      phone: '02-000-0000',
      email: 'contact@yourcompany.com',
      logoUrl: '/pwa-192x192.png'
    },
    prs: [],
    pos: [],
    inventory: [],
    vendors: [],
    approvalMatrix: DEFAULT_APPROVAL_MATRIX
  };
}
