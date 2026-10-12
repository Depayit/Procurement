import type { InventoryItem, Vendor, PurchaseRequest, PurchaseOrder, PRItem } from '../../types';

export type TargetModule = 'inventory' | 'pr' | 'vendors' | 'po';

export interface ModuleFieldDefinition {
  key: string;
  labelTh: string;
  labelEn: string;
  required: boolean;
  type: 'string' | 'number' | 'date' | 'array';
  aliases: string[]; // Thai & English synonyms for auto-mapping
}

export const MODULE_DEFINITIONS: Record<TargetModule, {
  nameTh: string;
  nameEn: string;
  descriptionTh: string;
  icon: string;
  fields: ModuleFieldDefinition[];
}> = {
  inventory: {
    nameTh: 'คลังพัสดุและสินค้ากลาง (Central Inventory & Master SKUs)',
    nameEn: 'Central Inventory & Material Master',
    descriptionTh: 'นำเข้ารายการวัสดุก่อสร้าง รหัส SKU สต็อกคงเหลือ จุดจัดเก็บในคลังกลาง และราคาประเมิน',
    icon: 'Package',
    fields: [
      { key: 'name', labelTh: 'ชื่อสินค้า / รายการวัสดุ', labelEn: 'Item Name', required: true, type: 'string', aliases: ['ชื่อ', 'ชื่อสินค้า', 'รายการ', 'รายการวัสดุ', 'พัสดุ', 'item', 'name', 'description', 'material', 'รายการวัสดุ/สเปกจากแบบ'] },
      { key: 'sku', labelTh: 'รหัสพัสดุ / Master SKU', labelEn: 'Master SKU', required: false, type: 'string', aliases: ['sku', 'รหัส', 'รหัสสินค้า', 'รหัสพัสดุ', 'code', 'itemcode', 'item_code', 'รหัส/แท็ก cad'] },
      { key: 'barcode', labelTh: 'บาร์โค้ด (1D Barcode)', labelEn: 'Barcode', required: false, type: 'string', aliases: ['barcode', 'บาร์โค้ด', 'รหัสแท่ง', 'ean', 'upc'] },
      { key: 'category', labelTh: 'หมวดหมู่วัสดุ', labelEn: 'Category', required: false, type: 'string', aliases: ['หมวด', 'หมวดหมู่', 'กลุ่ม', 'category', 'type', 'เลเยอร์ (layer)'] },
      { key: 'quantity', labelTh: 'จำนวนสต็อก', labelEn: 'Quantity', required: true, type: 'number', aliases: ['จำนวน', 'คงเหลือ', 'สต็อก', 'qty', 'quantity', 'stock', 'จำนวนประมาณการ'] },
      { key: 'unit', labelTh: 'หน่วยนับ', labelEn: 'Unit', required: true, type: 'string', aliases: ['หน่วย', 'หน่วยนับ', 'unit', 'uom'] },
      { key: 'unitPrice', labelTh: 'ราคาต่อหน่วย (บาท)', labelEn: 'Unit Price', required: false, type: 'number', aliases: ['ราคา', 'ราคาต่อหน่วย', 'ราคาประเมิน', 'price', 'unitprice', 'unit_price', 'cost', 'ราคาประเมิน boq'] },
      { key: 'minStockLevel', labelTh: 'เกณฑ์สต็อกขั้นต่ำ', labelEn: 'Min Stock Level', required: false, type: 'number', aliases: ['ขั้นต่ำ', 'จุดสั่งซื้อ', 'min', 'minstock', 'safetystock'] },
      { key: 'binLocation', labelTh: 'จุดจัดเก็บ/แร็ค (Bin Location)', labelEn: 'Bin Location', required: false, type: 'string', aliases: ['ตำแหน่ง', 'จุดจัดเก็บ', 'ชั้นเก็บ', 'โซน', 'bin', 'location', 'rack'] },
      { key: 'projectAllocations', labelTh: 'โครงการที่จัดสรรเบิกใช้', labelEn: 'Project Allocations', required: false, type: 'array', aliases: ['โครงการ', 'ไซต์งาน', 'project', 'site'] }
    ]
  },
  pr: {
    nameTh: 'ใบขอซื้อและรายการ BOQ โครงการ (PR & BOQ Takeoff)',
    nameEn: 'Purchase Requisition & BOQ Items',
    descriptionTh: 'นำเข้ารายการวัสดุเพื่อสร้างใบขอซื้อ (PR) หรือเชื่อมกับรายการประมาณราคา BOQ ไซต์งาน',
    icon: 'ShoppingCart',
    fields: [
      { key: 'description', labelTh: 'รายการพัสดุที่ขอซื้อ', labelEn: 'Item Description', required: true, type: 'string', aliases: ['รายการ', 'ชื่อรายการ', 'รายละเอียด', 'description', 'item', 'รายการวัสดุ/สเปกจากแบบ', 'รายการสินค้า/บริการ'] },
      { key: 'specification', labelTh: 'สเปก / คุณลักษณะเฉพาะ', labelEn: 'Specification', required: false, type: 'string', aliases: ['สเปก', 'คุณลักษณะ', 'ยี่ห้อ/รุ่น', 'specification', 'spec'] },
      { key: 'quantity', labelTh: 'จำนวนที่ขอซื้อ', labelEn: 'Quantity', required: true, type: 'number', aliases: ['จำนวน', 'ยอดขอซื้อ', 'qty', 'quantity', 'จำนวนประมาณการ'] },
      { key: 'unit', labelTh: 'หน่วยนับ', labelEn: 'Unit', required: true, type: 'string', aliases: ['หน่วย', 'หน่วยนับ', 'unit', 'uom'] },
      { key: 'unitPrice', labelTh: 'ราคาต่อหน่วยประมาณการ', labelEn: 'Estimated Unit Price', required: false, type: 'number', aliases: ['ราคา', 'ราคาประมาณการ', 'price', 'unitprice', 'ราคาประเมิน boq', 'ราคาต่อหน่วย'] },
      { key: 'department', labelTh: 'ชื่อโครงการ / ไซต์งาน', labelEn: 'Project / Department', required: false, type: 'string', aliases: ['โครงการ', 'แผนก', 'ไซต์งาน', 'project', 'department', 'site'] },
      { key: 'projectCode', labelTh: 'รหัสโครงการ (Project Code)', labelEn: 'Project Code', required: false, type: 'string', aliases: ['รหัสโครงการ', 'projectcode', 'project_code'] },
      { key: 'requesterName', labelTh: 'ชื่อผู้ขอซื้อ / วิศวกร', labelEn: 'Requester Name', required: false, type: 'string', aliases: ['ผู้ขอ', 'ผู้ขอซื้อ', 'วิศวกร', 'requester', 'engineer'] },
      { key: 'suggestedVendor', labelTh: 'ผู้ขาย / ซัพพลายเออร์ที่เสนอ', labelEn: 'Suggested Vendor', required: false, type: 'string', aliases: ['ผู้ขาย', 'ร้านค้า', 'ซัพพลายเออร์', 'vendor', 'supplier', 'ซัพพลายเออร์/ผู้ขาย'] },
      { key: 'justification', labelTh: 'เหตุผลความจำเป็น / อ้างอิง BOQ', labelEn: 'Justification / BOQ Ref', required: false, type: 'string', aliases: ['เหตุผล', 'วัตถุประสงค์', 'boq', 'justification', 'หมายเหตุ'] }
    ]
  },
  vendors: {
    nameTh: 'ทะเบียนคู่ค้าและผู้รับเหมา (Vendors & Subcontractors)',
    nameEn: 'Vendor & Supplier Directory',
    descriptionTh: 'นำเข้ารายชื่อบริษัทคู่ค้า ผู้รับเหมา ข้อมูลติดต่อ เลขผู้เสียภาษี และเงื่อนไขการค้า',
    icon: 'Store',
    fields: [
      { key: 'name', labelTh: 'ชื่อบริษัท / ร้านค้า', labelEn: 'Vendor Name', required: true, type: 'string', aliases: ['ชื่อ', 'ชื่อบริษัท', 'ร้านค้า', 'คู่ค้า', 'vendor', 'company', 'name', 'ซัพพลายเออร์/ผู้ขาย'] },
      { key: 'contactPerson', labelTh: 'ชื่อผู้ติดต่อ', labelEn: 'Contact Person', required: false, type: 'string', aliases: ['ผู้ติดต่อ', 'ตัวแทน', 'contact', 'contactperson', 'contact_person'] },
      { key: 'phone', labelTh: 'เบอร์โทรศัพท์', labelEn: 'Phone Number', required: false, type: 'string', aliases: ['เบอร์โทร', 'โทร', 'โทรศัพท์', 'phone', 'tel', 'mobile'] },
      { key: 'email', labelTh: 'อีเมล (Email)', labelEn: 'Email', required: false, type: 'string', aliases: ['อีเมล', 'เมล', 'email', 'mail'] },
      { key: 'address', labelTh: 'ที่อยู่สำนักงาน / โรงงาน', labelEn: 'Address', required: false, type: 'string', aliases: ['ที่อยู่', 'address', 'location'] },
      { key: 'paymentTerms', labelTh: 'เงื่อนไขชำระเงิน (Credit Terms)', labelEn: 'Payment Terms', required: false, type: 'string', aliases: ['เครดิต', 'เงื่อนไขการชำระเงิน', 'payment', 'paymentterms', 'terms', 'credit'] },
      { key: 'categories', labelTh: 'หมวดหมู่วัสดุที่จำหน่าย', labelEn: 'Product Categories', required: false, type: 'array', aliases: ['หมวดสินค้า', 'ประเภทวัสดุ', 'category', 'categories'] },
      { key: 'taxId', labelTh: 'เลขประจำตัวผู้เสียภาษี (13 หลัก)', labelEn: 'Tax ID', required: false, type: 'string', aliases: ['tax', 'taxid', 'เลขผู้เสียภาษี', 'เลขประจำตัวผู้เสียภาษี'] }
    ]
  },
  po: {
    nameTh: 'ใบสั่งซื้อและประวัติการจัดซื้อ (Purchase Orders - PO)',
    nameEn: 'Purchase Order History',
    descriptionTh: 'นำเข้าประวัติใบสั่งซื้อเก่าหรือเอกสาร PO ที่ออกให้คู่ค้าเพื่อบันทึกประวัติและรอตรวจรับของ',
    icon: 'FileText',
    fields: [
      { key: 'poNumber', labelTh: 'เลขที่ใบสั่งซื้อ (PO No.)', labelEn: 'PO Number', required: true, type: 'string', aliases: ['เลขที่ po', 'ponumber', 'po_number', 'po_no', 'เลขที่'] },
      { key: 'vendorName', labelTh: 'ชื่อผู้ขาย / คู่ค้า', labelEn: 'Vendor Name', required: true, type: 'string', aliases: ['ผู้ขาย', 'คู่ค้า', 'vendor', 'vendorname', 'supplier'] },
      { key: 'prNumber', labelTh: 'อ้างอิงเลขที่ PR', labelEn: 'PR Reference', required: false, type: 'string', aliases: ['อ้างอิง pr', 'prnumber', 'pr_number', 'pr_no'] },
      { key: 'totalAmount', labelTh: 'ยอดเงินรวม (บาท)', labelEn: 'Total Amount', required: true, type: 'number', aliases: ['ยอดรวม', 'จำนวนเงิน', 'total', 'amount', 'totalamount'] },
      { key: 'orderDate', labelTh: 'วันที่ออกเอกสาร', labelEn: 'Order Date', required: false, type: 'date', aliases: ['วันที่', 'วันออกเอกสาร', 'date', 'orderdate'] },
      { key: 'expectedDeliveryDate', labelTh: 'กำหนดส่งของ', labelEn: 'Expected Delivery Date', required: false, type: 'date', aliases: ['กำหนดส่ง', 'วันส่งมอบ', 'deliverydate', 'expecteddeliverydate'] },
      { key: 'poDescription', labelTh: 'รายละเอียด / หมายเหตุ', labelEn: 'Description', required: false, type: 'string', aliases: ['รายละเอียด', 'หมายเหตุ', 'description', 'remark'] }
    ]
  }
};

/**
 * Intelligent module detector based on raw headers & values
 */
export function detectTargetModule(headers: string[], rows: Record<string, any>[]): TargetModule {
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  const headerText = normalizedHeaders.join(' ');

  let scores = {
    inventory: 0,
    pr: 0,
    vendors: 0,
    po: 0
  };

  // Check Vendor signals
  if (/tax|email|contact|phone|ผู้ติดต่อ|เบอร์โทร|โทรศัพท์|คู่ค้า|ผู้รับเหมา|เครดิต|payment/.test(headerText)) {
    scores.vendors += 4;
  }

  // Check PO signals
  if (/po|ponumber|orderdate|กำหนดส่ง|เลขที่ po|ยอดเงิน/.test(headerText)) {
    scores.po += 4;
  }

  // Check Inventory signals
  if (/sku|barcode|สต็อก|คงเหลือ|คลัง|จุดจัดเก็บ|bin|location|minstock|ขั้นต่ำ/.test(headerText)) {
    scores.inventory += 4;
  }

  // Check PR & BOQ signals
  if (/pr|boq|ขอซื้อ|วิศวกร|สเปก|justification|ผู้ขอ/.test(headerText)) {
    scores.pr += 4;
  }

  // Check header alias overlap
  Object.entries(MODULE_DEFINITIONS).forEach(([modKey, modDef]) => {
    modDef.fields.forEach(field => {
      field.aliases.forEach(alias => {
        if (normalizedHeaders.some(h => h.includes(alias.toLowerCase()))) {
          scores[modKey as TargetModule] += 1;
        }
      });
    });
  });

  // Pick highest score, default to inventory
  let maxScore = -1;
  let detected: TargetModule = 'inventory';

  (Object.keys(scores) as TargetModule[]).forEach(k => {
    if (scores[k] > maxScore) {
      maxScore = scores[k];
      detected = k;
    }
  });

  return detected;
}

export const classifyDataSet = detectTargetModule;

/**
 * Auto-map file headers to module fields
 */
export function autoMapColumns(headers: string[], targetModule: TargetModule): Record<string, string> {
  const mapping: Record<string, string> = {};
  const fields = MODULE_DEFINITIONS[targetModule].fields;

  fields.forEach(field => {
    // 1. Exact match on field.key or label
    const exactMatch = headers.find(h => 
      h.toLowerCase() === field.key.toLowerCase() ||
      h.toLowerCase() === field.labelTh.toLowerCase() ||
      h.toLowerCase() === field.labelEn.toLowerCase()
    );

    if (exactMatch) {
      mapping[field.key] = exactMatch;
      return;
    }

    // 2. Alias match
    const aliasMatch = headers.find(h => {
      const lower = h.toLowerCase().trim();
      return field.aliases.some(alias => lower === alias.toLowerCase() || lower.includes(alias.toLowerCase()));
    });

    if (aliasMatch) {
      mapping[field.key] = aliasMatch;
    }
  });

  return mapping;
}

/**
 * Clean & normalize rows according to mapping and module rules
 */
export function normalizeImportedRows(
  rawRows: Record<string, any>[],
  mapping: Record<string, string>,
  targetModule: TargetModule
): { validRows: any[]; errorRows: { row: any; errors: string[] }[] } {
  const fields = MODULE_DEFINITIONS[targetModule].fields;
  const validRows: any[] = [];
  const errorRows: { row: any; errors: string[] }[] = [];

  rawRows.forEach((rawRow, idx) => {
    const item: Record<string, any> = {};
    const errors: string[] = [];

    fields.forEach(field => {
      const sourceCol = mapping[field.key];
      let val = sourceCol !== undefined ? rawRow[sourceCol] : undefined;

      // Type parsing
      if (field.type === 'number') {
        if (val !== undefined && val !== null && val !== '') {
          const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/,/g, '').trim());
          item[field.key] = isNaN(num) ? 0 : num;
        } else {
          item[field.key] = field.required ? 0 : 0;
        }
      } else if (field.type === 'array') {
        if (Array.isArray(val)) {
          item[field.key] = val;
        } else if (typeof val === 'string' && val.trim()) {
          item[field.key] = val.split(/[,;|•]/).map(s => s.trim()).filter(Boolean);
        } else {
          item[field.key] = [];
        }
      } else {
        item[field.key] = val !== undefined && val !== null ? String(val).trim() : '';
      }

      // Check required
      if (field.required && (item[field.key] === '' || item[field.key] === undefined || item[field.key] === null)) {
        errors.push(`ขาดฟิลด์บังคับ: ${field.labelTh}`);
      }
    });

    // Provide sensible ERP defaults for construction domain
    if (targetModule === 'inventory') {
      if (!item.unit) item.unit = 'หน่วย';
      if (!item.sku) item.sku = item.code || `SKU-IMP-${Math.floor(1000 + Math.random() * 9000)}`;
      if (!item.location) item.location = 'คลังพัสดุก่อสร้างกลาง (Central WH)';
      if (!item.binLocation) item.binLocation = 'จุดจัดเก็บทั่วไป (General Bin)';
      if (!item.category) item.category = 'วัสดุก่อสร้างทั่วไป';
      if (!item.centralWarehouse) item.centralWarehouse = 'คลังพัสดุก่อสร้างกลาง (Central Material Hub)';
      if (!item.projectAllocations || item.projectAllocations.length === 0) {
        item.projectAllocations = ['โครงการ คอนโดสุขุมวิท 101', 'ทุกไซต์งาน'];
      }
    } else if (targetModule === 'pr') {
      if (!item.unit) item.unit = 'หน่วย';
      if (!item.department) item.department = 'โครงการ คอนโดสุขุมวิท 101';
      if (!item.requesterName) item.requesterName = 'สมชาย ช่างก่อสร้าง';
    } else if (targetModule === 'vendors') {
      if (!item.paymentTerms) item.paymentTerms = 'Credit 30 Days';
      if (!item.rating) item.rating = 4.5;
      if (!item.onTimeDeliveryRate) item.onTimeDeliveryRate = 95;
    }

    if (errors.length > 0) {
      errorRows.push({ row: rawRow, errors });
    } else {
      validRows.push(item);
    }
  });

  return { validRows, errorRows };
}
