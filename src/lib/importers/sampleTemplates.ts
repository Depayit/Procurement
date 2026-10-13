import * as XLSX from 'xlsx';
import type { TargetModule } from './dataClassifier';

export const SAMPLE_INVENTORY_ITEMS = [
  {
    'ชื่อสินค้า': 'ปูนซีเมนต์ปอร์ตแลนด์ ตราช้าง',
    'รหัสพัสดุ (SKU)': 'SKU-CEM-B100',
    'บาร์โค้ด': '8851928001014',
    'หมวดหมู่วัสดุ': 'วัสดุก่อสร้าง',
    'จำนวนสต็อก': 450,
    'หน่วยนับ': 'ถุง',
    'ราคาต่อหน่วย (บาท)': 155.00,
    'เกณฑ์สต็อกขั้นต่ำ': 100,
    'จุดจัดเก็บในคลังกลาง': 'ไซโล 1 (Bay C-01)',
    'โครงการที่จัดสรรเบิกใช้': 'โครงการ คอนโดสุขุมวิท 101, ทุกไซต์งาน'
  },
  {
    'ชื่อสินค้า': 'เหล็กเส้นกลม SR24 9มม. มอก.',
    'รหัสพัสดุ (SKU)': 'SKU-STL-SR24',
    'บาร์โค้ด': '8851928002028',
    'หมวดหมู่วัสดุ': 'วัสดุก่อสร้าง',
    'จำนวนสต็อก': 200,
    'หน่วยนับ': 'เส้น',
    'ราคาต่อหน่วย (บาท)': 135.00,
    'เกณฑ์สต็อกขั้นต่ำ': 80,
    'จุดจัดเก็บในคลังกลาง': 'ลานเก็บ B (Zone B-04)',
    'โครงการที่จัดสรรเบิกใช้': 'โครงการ รถไฟฟ้าสายสีส้ม สัญญา 3'
  },
  {
    'ชื่อสินค้า': 'ท่อร้อยสายไฟ EMT ขนาด 1/2 นิ้ว',
    'รหัสพัสดุ (SKU)': 'SKU-EMT-050',
    'บาร์โค้ด': '8851928003035',
    'หมวดหมู่วัสดุ': 'งานระบบไฟฟ้า',
    'จำนวนสต็อก': 300,
    'หน่วยนับ': 'ท่อน',
    'ราคาต่อหน่วย (บาท)': 165.00,
    'เกณฑ์สต็อกขั้นต่ำ': 60,
    'จุดจัดเก็บในคลังกลาง': 'แร็ค E (Rack E-02)',
    'โครงการที่จัดสรรเบิกใช้': 'โครงการ อาคารสำนักงานพระราม 9'
  }
];

export const SAMPLE_BOQ_PR_ITEMS = [
  {
    'รายการพัสดุที่ขอซื้อ': 'คอนกรีตผสมเสร็จ 280 ksc Cylinder',
    'สเปก/คุณลักษณะ': 'Slump 10±2.5 cm ปูนช้าง งานเสาชั้น 2',
    'จำนวนที่ขอซื้อ': 45,
    'หน่วยนับ': 'คิว',
    'ราคาต่อหน่วยประมาณการ': 2050,
    'ชื่อโครงการ/ไซต์งาน': 'โครงการ คอนโดสุขุมวิท 101',
    'รหัสโครงการ': 'PRJ-SKV101',
    'ชื่อผู้ขอซื้อ': 'สมชาย ช่างก่อสร้าง',
    'ผู้ขายที่เสนอ': 'บริษัท ปูนซิเมนต์ไทย จำกัด (มหาชน)',
    'เหตุผลความจำเป็น': 'งานเทคอนกรีตเสาและคาน ชั้น 2 ตามงวดงาน BOQ'
  },
  {
    'รายการพัสดุที่ขอซื้อ': 'เหล็กข้ออ้อย DB20 SD40',
    'สเปก/คุณลักษณะ': 'ยาว 10 เมตร มอก. มี Mill Sheet',
    'จำนวนที่ขอซื้อ': 120,
    'หน่วยนับ': 'เส้น',
    'ราคาต่อหน่วยประมาณการ': 650,
    'ชื่อโครงการ/ไซต์งาน': 'โครงการ คอนโดสุขุมวิท 101',
    'รหัสโครงการ': 'PRJ-SKV101',
    'ชื่อผู้ขอซื้อ': 'สมชาย ช่างก่อสร้าง',
    'ผู้ขายที่เสนอ': 'บริษัท วัสดุก่อสร้างไทย จำกัด',
    'เหตุผลความจำเป็น': 'เสริมเหล็กโครงสร้างคานรับน้ำหนักชั้น 2'
  }
];

export const SAMPLE_VENDORS = [
  {
    'ชื่อบริษัท / ร้านค้า': 'บริษัท สยามสตีล โพรดักส์ จำกัด',
    'ชื่อผู้ติดต่อ': 'คุณธวัชชัย เกียรติสกุล',
    'เบอร์โทรศัพท์': '02-888-9999',
    'อีเมล': 'sales@siamsteel.co.th',
    'ที่อยู่สำนักงาน': '99 หมู่ 4 ถ.สุขสวัสดิ์ จ.สมุทรปราการ 10130',
    'เงื่อนไขชำระเงิน': 'Credit 45 Days',
    'หมวดหมู่วัสดุที่จำหน่าย': 'เหล็กรูปพรรณ, เหล็กเส้น, ลวดสลิง',
    'เลขประจำตัวผู้เสียภาษี': '0105558012345'
  },
  {
    'ชื่อบริษัท / ร้านค้า': 'บริษัท สหคอนกรีตผสมเสร็จ จำกัด',
    'ชื่อผู้ติดต่อ': 'คุณรัตนา ประเสริฐยิ่ง',
    'เบอร์โทรศัพท์': '02-777-6655',
    'อีเมล': 'contact@sahaconcrete.com',
    'ที่อยู่สำนักงาน': '128 ถ.ร่มเกล้า เขตลาดกระบัง กรุงเทพฯ 10520',
    'เงื่อนไขชำระเงิน': 'Credit 30 Days',
    'หมวดหมู่วัสดุที่จำหน่าย': 'คอนกรีตผสมเสร็จ, มอร์ตาร์',
    'เลขประจำตัวผู้เสียภาษี': '0105559098765'
  }
];

export const SAMPLE_CAD_ENTITIES = [
  {
    'รหัส/แท็ก CAD': 'CAD-BEAM-2B01',
    'รายการวัสดุ/สเปกจากแบบ': 'คาน คสล. 2B01 (คอนกรีต 280 ksc)',
    'เลเยอร์ (Layer)': 'S-BEAM',
    'จำนวนประมาณการ': 18.5,
    'หน่วยนับ': 'คิว',
    'ราคาประเมิน BOQ': 2100,
    'หมายเหตุ/ตำแหน่ง': 'คานชั้น 2 Grid A-D'
  },
  {
    'รหัส/แท็ก CAD': 'CAD-REBAR-DB16',
    'รายการวัสดุ/สเปกจากแบบ': 'เหล็กข้ออ้อย DB16 เสา C1-C8',
    'เลเยอร์ (Layer)': 'S-COL',
    'จำนวนประมาณการ': 240,
    'หน่วยนับ': 'เส้น',
    'ราคาประเมิน BOQ': 420,
    'หมายเหตุ/ตำแหน่ง': 'เสาตอม่อและเสาชั้น 1'
  },
  {
    'รหัส/แท็ก CAD': 'CAD-SLAB-PS',
    'รายการวัสดุ/สเปกจากแบบ': 'แผ่นพื้นสำเร็จรูปท้องเรียบ หนา 5 ซม.',
    'เลเยอร์ (Layer)': 'S-SLAB',
    'จำนวนประมาณการ': 160,
    'หน่วยนับ': 'ตร.ม.',
    'ราคาประเมิน BOQ': 285,
    'หมายเหตุ/ตำแหน่ง': 'พื้นชั้น 2 พื้นที่อาคาร'
  },
  {
    'รหัส/แท็ก CAD': 'CAD-ELEC-EMT-3/4',
    'รายการวัสดุ/สเปกจากแบบ': 'ท่อ EMT 3/4 นิ้ว งานแสงสว่าง',
    'เลเยอร์ (Layer)': 'M-PIPE-EMT',
    'จำนวนประมาณการ': 85,
    'หน่วยนับ': 'ท่อน',
    'ราคาประเมิน BOQ': 195,
    'หมายเหตุ/ตำแหน่ง': 'ระบบไฟฟ้าชั้น 2'
  }
];

/**
 * Generate and trigger download of template file
 */
export function downloadSampleTemplate(module: TargetModule, format: 'xlsx' | 'csv' | 'dxf' | 'json') {
  if (format === 'xlsx' || format === 'csv') {
    let sampleData: Record<string, any>[] = [];
    let sheetName = 'DataTemplate';

    if (module === 'inventory') {
      sheetName = 'วัสดุคลังกลาง';
      sampleData = SAMPLE_INVENTORY_ITEMS;
    } else if (module === 'pr') {
      sheetName = 'รายการขอซื้อBOQ';
      sampleData = SAMPLE_BOQ_PR_ITEMS;
    } else if (module === 'vendors') {
      sheetName = 'ทะเบียนคู่ค้า';
      sampleData = SAMPLE_VENDORS;
    } else {
      sheetName = 'ประวัติใบสั่งซื้อPO';
      sampleData = [
        {
          'เลขที่ PO': 'PO-2026-090',
          'ชื่อผู้ขาย / คู่ค้า': 'บริษัท วัสดุก่อสร้างไทย จำกัด',
          'อ้างอิงเลขที่ PR': 'PR-2026-001',
          'ยอดเงินรวม (บาท)': 125000.00,
          'วันที่ออกเอกสาร': '2026-05-20',
          'กำหนดส่งของ': '2026-05-27',
          'รายละเอียด / หมายเหตุ': 'สั่งซื้อเหล็กเส้นและลวดผูกเหล็ก งวด 2'
        }
      ];
    }

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    if (format === 'csv') {
      const csvOutput = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob(["\uFEFF" + csvOutput], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ProcureSync_Template_${module}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      XLSX.writeFile(wb, `ProcureSync_Template_${module}.xlsx`);
    }
  } else if (format === 'dxf') {
    // Generate valid DXF ASCII file with layers and entities
    const dxfContent = `0
SECTION
2
HEADER
9
$ACADVER
1
AC1027
0
ENDSEC
0
SECTION
2
TABLES
0
TABLE
2
LAYER
0
LAYER
2
S-CONC
70
0
62
3
0
LAYER
2
S-REBAR
70
0
62
1
0
LAYER
2
M-PIPE
70
0
62
4
0
ENDTAB
0
ENDSEC
0
SECTION
2
ENTITIES
0
TEXT
8
S-CONC
10
100.0
20
200.0
30
0.0
40
2.5
1
คอนกรีตผสมเสร็จ 240 ksc Cube (35 คิว)
0
TEXT
8
S-REBAR
10
100.0
220.0
30
0.0
40
2.5
1
เหล็กข้ออ้อย DB16 SD40 (150 เส้น)
0
TEXT
8
M-PIPE
10
100.0
240.0
30
0.0
40
2.5
1
ท่อระบายน้ำ คสล. ขนาด 0.60 ม. (25 ท่อน)
0
ENDSEC
0
EOF`;

    const blob = new Blob([dxfContent], { type: 'application/dxf;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ProcureSync_CAD_Takeoff_Sample.dxf`;
    a.click();
    URL.revokeObjectURL(url);
  } else if (format === 'json') {
    const jsonSample = {
      system: 'ProcureSync ERP',
      module: module,
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      items: [
        {
          sku: 'SKU-SAMPLE-01',
          name: 'หินเบอร์ 1 สำหรับงานคอนกรีต',
          category: 'มวลรวม',
          quantity: 60,
          unit: 'ตัน',
          unitPrice: 380,
          location: 'คลังพัสดุก่อสร้างกลาง (Central WH)',
          binLocation: 'ลานหิน กอง A'
        }
      ]
    };
    const blob = new Blob([JSON.stringify(jsonSample, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ProcureSync_Sample_${module}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
