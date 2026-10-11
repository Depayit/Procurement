import { PRTemplate } from '../types';

export const STANDARD_PR_TEMPLATES: PRTemplate[] = [
  {
    id: 'tpl-structural',
    name: 'งานโครงสร้าง คอนกรีตและเหล็กเสริม',
    category: 'งานโครงสร้าง (Structural)',
    description: 'ชุดขอซื้อมาตรฐานสำหรับงานเทคอนกรีตฐานราก เสา คาน และเหล็กเสริม มอก.',
    defaultDepartment: 'โครงการ คอนโดสุขุมวิท 101',
    defaultJustification: 'ขอซื้อวัสดุสำหรับงานเทคอนกรีตและผูกเหล็กโครงสร้างชั้น 1-2 ตามงบประมาณ BOQ งานโครงสร้าง',
    defaultUrgency: 'urgent',
    iconName: 'Building2',
    items: [
      {
        itemCode: 'MAT-CONC-240',
        description: 'คอนกรีตผสมเสร็จ Ready-Mixed Concrete',
        specification: 'กำลังอัด 240 ksc Cube (Slump 10±2.5 cm) ปูนตราช้าง',
        quantity: 35,
        unit: 'คิว',
        unitPrice: 1950,
        remark: 'สั่งส่งวันเสาร์เช้า รอบละ 6 คิว'
      },
      {
        itemCode: 'MAT-STEEL-DB16',
        description: 'เหล็กข้ออ้อย DB16 SD40',
        specification: 'ความยาว 10 เมตร มาตรฐาน มอก. 24-2559 มีใบ Mill Cert',
        quantity: 150,
        unit: 'เส้น',
        unitPrice: 420,
        remark: 'ตรวจสอบมาตรฐานมอก. ก่อนรับเข้าไซต์'
      },
      {
        itemCode: 'MAT-STEEL-RB9',
        description: 'เหล็กเส้นกลม RB9 SR24',
        specification: 'ความยาว 10 เมตร สำหรับทำเหล็กปลอกเสาคาน มอก. 20-2559',
        quantity: 200,
        unit: 'เส้น',
        unitPrice: 135,
        remark: 'ใช้สำหรับดัดเหล็กปลอก'
      },
      {
        itemCode: 'MAT-WIRE-01',
        description: 'ลวดผูกเหล็กเบอร์ 18',
        specification: 'เหนียวนุ่ม ดัดง่าย ไม่เปราะหักง่าย น้ำหนัก 2.5 กก./ขด',
        quantity: 20,
        unit: 'ขด',
        unitPrice: 180,
        remark: 'ผูกเหล็กข้ออ้อย'
      },
      {
        itemCode: 'MAT-WOOD-PLY',
        description: 'ไม้อัดเคลือบฟิล์มดำ 15 มม.',
        specification: 'ขนาด 122 x 244 ซม. เกรดหล่อคอนกรีต 4-6 ครั้ง',
        quantity: 40,
        unit: 'แผ่น',
        unitPrice: 650,
        remark: 'ทำไม้แบบเสาและข้างคาน'
      }
    ]
  },
  {
    id: 'tpl-masonry',
    name: 'งานก่ออิฐ ฉาบปูน และผนังตกแต่ง',
    category: 'งานสถาปัตย์ (Architectural)',
    description: 'วัสดุมาตรฐานสำหรับงานก่อผนังห้อง ฉาบเรียบ และปรับระดับพื้นผิว',
    defaultDepartment: 'โครงการ หมู่บ้านจัดสรร บางนา',
    defaultJustification: 'ขอสั่งซื้อวัสดุก่อฉาบผนังห้องและเตรียมพื้นผิวสำหรับยูนิตเฟส 2',
    defaultUrgency: 'normal',
    iconName: 'Boxes',
    items: [
      {
        itemCode: 'MAT-BLOCK-G4',
        description: 'อิฐมวลเบา Q-Con / SmartBlock',
        specification: 'เกรด G4 หนา 7.5 ซม. ขนาด 20 x 60 ซม. ได้มาตรฐาน มอก.',
        quantity: 2400,
        unit: 'ก้อน',
        unitPrice: 19.5,
        remark: 'สำหรับผนังภายในทุกยูนิต'
      },
      {
        itemCode: 'MAT-MORT-THIN',
        description: 'ปูนก่ออิฐมวลเบา สูตรผสมเสร็จ',
        specification: 'ถุงละ 50 กก. ผสมสารอุ้มน้ำและสารยึดเกาะสูง',
        quantity: 60,
        unit: 'ถุง',
        unitPrice: 130,
        remark: 'ปูนก่อสูตรบาง'
      },
      {
        itemCode: 'MAT-PLAST-FINE',
        description: 'ปูนฉาบละเอียดผนังอิฐมวลเบา',
        specification: 'ถุงละ 50 กก. ฉาบลื่น ผิวเนียน ไม่แตกร้าวลายงา',
        quantity: 120,
        unit: 'ถุง',
        unitPrice: 115,
        remark: 'งานฉาบผิวเรียบ'
      },
      {
        itemCode: 'MAT-MESH-FIBER',
        description: 'ตาข่ายไฟเบอร์เสริมแรงฉาบปูน',
        specification: 'กว้าง 10 ซม. ยาว 50 ม./ม้วน ติดแนวรอยต่อทับหลังและท่อไฟ',
        quantity: 15,
        unit: 'ม้วน',
        unitPrice: 185,
        remark: 'ป้องกันรอยร้าวตามมุมวงกบ'
      },
      {
        itemCode: 'MAT-BOND-LATEX',
        description: 'น้ำยาประสานคอนกรีตและปูนฉาบ',
        specification: 'แกลลอน 5 ลิตร เพิ่มแรงยึดเกาะสูง ชนิดอะคริลิกโมดิฟายด์',
        quantity: 8,
        unit: 'แกลลอน',
        unitPrice: 520,
        remark: 'ทารองพื้นรอยต่อเสา-คาน'
      }
    ]
  },
  {
    id: 'tpl-electrical',
    name: 'งานระบบไฟฟ้าและแสงสว่าง (MEP)',
    category: 'งานระบบ (M&E / Systems)',
    description: 'ชุดขอซื้อท่อร้อยสาย สายไฟ THW อุปกรณ์บ็อกซ์ และตู้โหลดมาตรฐานความปลอดภัย',
    defaultDepartment: 'โครงการ อาคารสำนักงาน พระราม 9',
    defaultJustification: 'ขอซื้ออุปกรณ์เดินท่อร้อยสายไฟและสายไฟหลัก สำหรับระบบจ่ายไฟชั้น 3-4',
    defaultUrgency: 'normal',
    iconName: 'Zap',
    items: [
      {
        itemCode: 'ELE-CBL-THW25',
        description: 'สายไฟฟ้า THW 1x2.5 sq.mm.',
        specification: 'ทองแดงแท้ 450/750V มอก. 11-2553 (สีขาว/ฟ้า/เขียว-เหลือง ม้วนละ 100 ม.)',
        quantity: 12,
        unit: 'ม้วน',
        unitPrice: 1150,
        remark: 'ระบุสี L=ขาว, N=ฟ้า, G=เขียวแถบเหลือง'
      },
      {
        itemCode: 'ELE-CBL-THW40',
        description: 'สายไฟฟ้า THW 1x4 sq.mm.',
        specification: 'ทองแดงแท้ 450/750V มอก. 11-2553 ม้วนละ 100 ม.',
        quantity: 6,
        unit: 'ม้วน',
        unitPrice: 1780,
        remark: 'สำหรับวงจรเครื่องปรับอากาศ'
      },
      {
        itemCode: 'ELE-PIPE-UPVC20',
        description: 'ท่อร้อยสายไฟ uPVC สีขาว 20 มม. (3/4")',
        specification: 'มาตรฐาน JIS C 8430 ปลอดภัย ไม่ลามไฟ ยาว 2.92 ม./ท่อน',
        quantity: 180,
        unit: 'ท่อน',
        unitPrice: 48,
        remark: 'เดินลอยและฝังผนัง'
      },
      {
        itemCode: 'ELE-PANEL-12W',
        description: 'ตู้คอนซูเมอร์ยูนิต 12 ช่อง พร้อม Main Breaker RCBO 50A',
        specification: 'Schneider / ABB ป้องกันไฟดูด ไฟช็อต ไฟเกิน ได้มาตรฐาน IEC 61439',
        quantity: 4,
        unit: 'ชุด',
        unitPrice: 3450,
        remark: 'ติดตั้งยูนิตห้องชุดชั้น 3'
      },
      {
        itemCode: 'ELE-BOX-HANDY',
        description: 'แฮนดี้บ็อกซ์ เหล็กชุบกัลวาไนซ์ 2x4 นิ้ว',
        specification: 'เหล็กหนา 1.0 มม. ชุบสังกะสีกันสนิม มีรูน็อคเอาท์',
        quantity: 150,
        unit: 'ใบ',
        unitPrice: 14,
        remark: 'จุดเต้ารับและสวิตช์'
      }
    ]
  },
  {
    id: 'tpl-plumbing',
    name: 'งานระบบสุขาภิบาลและท่อประปา',
    category: 'งานระบบ (M&E / Systems)',
    description: 'ท่อ PVC น้ำดี-น้ำเสีย ข้อต่อ วาล์ว และอุปกรณ์ติดตั้งครบชุด',
    defaultDepartment: 'โครงการ คอนโดสุขุมวิท 101',
    defaultJustification: 'สั่งซื้อท่อประปาและข้อต่อสำหรับงานเดินท่อสุขาภิบาลห้องน้ำ โซน A',
    defaultUrgency: 'urgent',
    iconName: 'Droplets',
    items: [
      {
        itemCode: 'PLB-PIPE-PVC12',
        description: 'ท่อ PVC สีฟ้า ท่อน้ำดี ชั้น 8.5 ขนาด 1/2" (4 หุน)',
        specification: 'มาตรฐาน มอก. 17-2532 ยาว 4 เมตร/ท่อน ทนแรงดันสูง',
        quantity: 80,
        unit: 'ท่อน',
        unitPrice: 58,
        remark: 'ท่อน้ำดีภายในยูนิต'
      },
      {
        itemCode: 'PLB-PIPE-PVC20',
        description: 'ท่อ PVC สีฟ้า ท่อน้ำดี ชั้น 8.5 ขนาด 3/4" (6 หุน)',
        specification: 'มาตรฐาน มอก. 17-2532 ยาว 4 เมตร/ท่อน',
        quantity: 40,
        unit: 'ท่อน',
        unitPrice: 85,
        remark: 'ท่อประปาเมนเข้ารูนิต'
      },
      {
        itemCode: 'PLB-VALVE-BRASS',
        description: 'บอลวาล์วทองเหลือง ขนาด 1/2" ด้ามโยก',
        specification: 'SANWA ตัวเรือนทองเหลืองแท้ ชุบนิกเกิล ป้องกันการกัดกร่อน',
        quantity: 30,
        unit: 'ตัว',
        unitPrice: 145,
        remark: 'ติดตั้งจุดสต็อปวาล์วหลัก'
      },
      {
        itemCode: 'PLB-GLUE-500G',
        description: 'น้ำยาประสานท่อ PVC ตราช้าง กระป๋อง 500 กรัม',
        specification: 'ชนิดเข้มข้น มีแปรงในตัว ละลายเนื้อท่อได้สนิท ไม่รั่วซึม',
        quantity: 10,
        unit: 'กระป๋อง',
        unitPrice: 165,
        remark: 'ใช้กับงานท่อประปาแรงดัน'
      },
      {
        itemCode: 'PLB-PIPE-SEW2',
        description: 'ท่อ PVC สีเทา/ฟ้า สำหรับท่อน้ำทิ้ง ขนาด 2 นิ้ว ชั้น 8.5',
        specification: 'ยาว 4 เมตร ระบายน้ำทิ้งพื้นและอ่างล้างหน้า',
        quantity: 35,
        unit: 'ท่อน',
        unitPrice: 140,
        remark: 'ท่อน้ำทิ้ง Floor Drain'
      }
    ]
  },
  {
    id: 'tpl-safety-ppe',
    name: 'อุปกรณ์ความปลอดภัยและ PPE ประจำไซต์งาน',
    category: 'ความปลอดภัยหน้างาน (Safety & PPE)',
    description: 'ชุดอุปกรณ์คุ้มครองความปลอดภัยส่วนบุคคล และป้ายเตือนไซต์ก่อสร้าง',
    defaultDepartment: 'โครงการ คอนโดสุขุมวิท 101',
    defaultJustification: 'เบิกจ่ายอุปกรณ์ PPE เพื่อความปลอดภัยของทีมช่างและคนงานใหม่ตามกฎหมายแรงงาน',
    defaultUrgency: 'emergency',
    iconName: 'ShieldCheck',
    items: [
      {
        itemCode: 'SAF-HELMET-WH',
        description: 'หมวกนิรภัยมาตรฐาน มอก. รองใน 6 จุด (สีขาว/เหลือง)',
        specification: 'มอก. 368-2554 ทำจากพลาสติก ABS ทนแรงกระแทก มีสายรัดคาง',
        quantity: 30,
        unit: 'ใบ',
        unitPrice: 185,
        remark: 'วิศวกรและหัวหน้างาน'
      },
      {
        itemCode: 'SAF-BOOTS-STEEL',
        description: 'รองเท้านิรภัยหัวเหล็ก พื้นเหล็กเสริมแผ่นกันตะปู',
        specification: 'มาตรฐาน EN ISO 20345 / มอก. 523-2554 เบอร์ 40-44 หนังแท้กันน้ำ',
        quantity: 20,
        unit: 'คู่',
        unitPrice: 590,
        remark: 'ระบุไซส์ตอนยืนยัน PO'
      },
      {
        itemCode: 'SAF-HARNESS-FULL',
        description: 'ชุดเข็มขัดนิรภัยเต็มตัว (Full Body Harness) พร้อมสายช่วยชีวิต 2 ตะขอ',
        specification: 'มาตรฐาน CE EN361 / EN355 มี Energy Absorber รองรับตกจากที่สูง',
        quantity: 10,
        unit: 'ชุด',
        unitPrice: 1450,
        remark: 'สำหรับช่างทำงานบนนั่งร้าน'
      },
      {
        itemCode: 'SAF-VEST-REFLECT',
        description: 'เสื้อสะท้อนแสงทรงมาตรฐาน แถบสะท้อนแสง 2 นิ้ว',
        specification: 'ผ้าตาข่ายโพลีเอสเตอร์ระบายอากาศ สีเขียวสะท้อนแสงสว่าง',
        quantity: 50,
        unit: 'ตัว',
        unitPrice: 65,
        remark: 'ผู้ปฏิบัติงานทุกคนในไซต์'
      },
      {
        itemCode: 'SAF-TAPE-WARN',
        description: 'เทปกั้นเขต ขาว-แดง (Danger Tape)',
        specification: 'กว้าง 3 นิ้ว ยาว 500 เมตร เหนียว ทนแดด ทนฝน ไม่ขาดง่าย',
        quantity: 8,
        unit: 'ม้วน',
        unitPrice: 160,
        remark: 'กั้นแนวเขตอันตรายและงานยกเครน'
      }
    ]
  },
  {
    id: 'tpl-office-tools',
    name: 'อุปกรณ์เครื่องมือช่างและสำนักงานสนาม',
    category: 'เครื่องมือและสำนักงาน (Site Office & Tools)',
    description: 'เครื่องมือวัดระดับ เลเซอร์ แปลน และวัสดุสิ้นเปลืองสำหรับงานสำนักงานสนาม',
    defaultDepartment: 'งานซ่อมบำรุง ส่วนกลาง',
    defaultJustification: 'จัดซื้อเครื่องมือวัดและอุปกรณ์สำนักงานสนามสำหรับวิศวกรควบคุมงานประจำสัปดาห์',
    defaultUrgency: 'normal',
    iconName: 'Wrench',
    items: [
      {
        itemCode: 'TOOL-LASER-LVL',
        description: 'เครื่องวัดระดับเลเซอร์ 5 เส้น แสงเขียว พร้อมขาตั้ง',
        specification: 'ระยะทำงาน 30 เมตร ความแม่นยำ ±1 มม./5 ม. พร้อมแบตเตอรี่ลิเธียม 2 ก้อน',
        quantity: 2,
        unit: 'ชุด',
        unitPrice: 2850,
        remark: 'ใช้ตรวจสอบแนวดิ่ง-ระดับเสาคาน'
      },
      {
        itemCode: 'TOOL-TAPE-8M',
        description: 'ตลับเมตรหุ้มยางกันกระแทก ความยาว 8 เมตร',
        specification: 'หน้าเทปกว้าง 25 มม. เคลือบไนลอน ตัวเลขชัดเจน มอก. รับรอง',
        quantity: 10,
        unit: 'อัน',
        unitPrice: 195,
        remark: 'แจกวิศวกรและโฟร์แมน'
      },
      {
        itemCode: 'OFF-PAPER-A4',
        description: 'กระดาษถ่ายเอกสาร Double A ขนาด A4 80 แกรม',
        specification: '500 แผ่น/รีม กล่องละ 5 รีม สำหรับพิมพ์เอกสารไซต์งาน',
        quantity: 10,
        unit: 'กล่อง',
        unitPrice: 620,
        remark: 'สำหรับพิมพ์ใบ PR/PO และรายงานประจำวัน'
      },
      {
        itemCode: 'OFF-FIRE-EXT15',
        description: 'ถังดับเพลิงเคมีแห้ง (Dry Chemical) ขนาด 15 ปอนด์',
        specification: 'ดับไฟ Class A, B, C ได้มาตรฐาน มอก. 332-2537 พร้อมเกจวัดแรงดัน',
        quantity: 6,
        unit: 'ถัง',
        unitPrice: 1100,
        remark: 'ติดตั้งประจำตู้คอนเทนเนอร์และจุดเชื่อมโลหะ'
      }
    ]
  }
];

const LOCAL_STORAGE_KEY = 'procuresync_custom_pr_templates';

export function getCustomTemplates(): PRTemplate[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse custom templates:', e);
    return [];
  }
}

export function getAllTemplates(): PRTemplate[] {
  const custom = getCustomTemplates();
  return [...STANDARD_PR_TEMPLATES, ...custom];
}

export function saveCustomTemplate(template: Omit<PRTemplate, 'id' | 'isCustom'>): PRTemplate {
  const customList = getCustomTemplates();
  const newTemplate: PRTemplate = {
    ...template,
    id: `custom-tpl-${Date.now()}`,
    isCustom: true
  };
  customList.push(newTemplate);
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customList));
  } catch (e) {
    console.error('Failed to save custom template:', e);
  }
  return newTemplate;
}

export function deleteCustomTemplate(id: string): void {
  const customList = getCustomTemplates().filter(t => t.id !== id);
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customList));
  } catch (e) {
    console.error('Failed to delete custom template:', e);
  }
}
