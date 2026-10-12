import React from 'react';
import { 
  CheckCircle2, 
  ShoppingCart, 
  ClipboardCheck, 
  Package, 
  FileText, 
  Store, 
  BarChart3, 
  Users, 
  QrCode, 
  Camera, 
  Printer, 
  ArrowRight, 
  Layers, 
  HelpCircle, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  Search, 
  Settings,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { cn } from '../lib/utils';

interface StandardManualDocumentProps {
  id?: string;
  className?: string;
}

/**
 * Standard Corporate User Manual & Standard Operating Procedure (SOP) Document.
 * Formatted strictly according to enterprise documentation standards:
 * - A4 Portrait proportions (210mm x 297mm)
 * - Page breaks, running headers, document control blocks, and balanced typography
 * - Formatted for crystal clear readability on both screen and laser print/PDF export
 */
export function StandardManualDocument({ 
  id = 'standard-manual-doc',
  className 
}: StandardManualDocumentProps) {
  const currentDateStr = '13 ตุลาคม 2569';
  const docCode = 'SOP-PROC-2026-001';
  const docRev = 'Rev. 3.0';

  return (
    <div 
      id={id}
      className={cn(
        "standard-manual-doc bg-slate-100 py-6 text-slate-900 select-text font-sans",
        "print:bg-white print:p-0 print:m-0 print:w-full",
        className
      )}
      style={{
        boxSizing: 'border-box',
        colorScheme: 'light',
        fontFamily: "'Sarabun', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        lineHeight: 1.5,
        wordBreak: 'normal',
        overflowWrap: 'break-word',
      }}
    >

      {/* =========================================================================
          PAGE 1: หน้าปกและบันทึกการควบคุมเอกสาร (Cover & Document Control Sheet)
         ========================================================================= */}
      <div className="standard-manual-page bg-white w-[794px] min-h-[1123px] mx-auto p-12 mb-8 shadow-lg border border-slate-300 flex flex-col justify-between print:w-full print:min-h-0 print:shadow-none print:border-none print:p-8 print:m-0 print:page-break-always">
        
        {/* Top Header Branding */}
        <div>
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded bg-indigo-700 text-white flex items-center justify-center font-bold text-xl font-mono border border-indigo-900 shadow-xs">
                PS
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900 leading-tight">
                  บริษัท พรอคเคียวซิงค์ คอนสตรัคชั่น แอนด์ เอ็นจิเนียริ่ง จำกัด
                </h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                  PROCURESYNC CONSTRUCTION & ENGINEERING CO., LTD.
                </p>
                <p className="text-[9.5px] text-slate-500 mt-0.5">
                  ระบบบริหารงานจัดซื้อและคลังพัสดุก่อสร้างระดับองค์กร (Enterprise Procurement ERP)
                </p>
              </div>
            </div>

            <div className="text-right border border-slate-300 rounded bg-slate-50 p-2 text-[10px] space-y-0.5">
              <div><span className="text-slate-500">รหัสเอกสาร:</span> <strong className="font-mono text-indigo-700">{docCode}</strong></div>
              <div><span className="text-slate-500">การแก้ไขครั้งที่:</span> <strong className="font-mono">{docRev}</strong></div>
              <div><span className="text-slate-500">วันที่บังคับใช้:</span> <strong>{currentDateStr}</strong></div>
              <div><span className="text-slate-500">สถานะ:</span> <strong className="text-emerald-700">เอกสารควบคุม (Controlled)</strong></div>
            </div>
          </div>

          {/* Main Title Banner */}
          <div className="mt-12 text-center py-10 px-6 border-y-2 border-slate-800 bg-slate-50/70">
            <span className="inline-block px-3 py-1 rounded bg-indigo-100 text-indigo-800 font-bold text-xs uppercase tracking-wider mb-3">
              Standard Operating Procedure (SOP) & User Manual
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-snug">
              คู่มือมาตรฐานการปฏิบัติงานและคำอธิบายระบบ<br />
              การจัดซื้อและบริหารคลังสินค้าแบบครบวงจร
            </h2>
            <p className="text-xs text-slate-600 mt-3 max-w-xl mx-auto leading-relaxed">
              ครอบคลุม 10 โมดูลงาน: ขอซื้อ (PR) • อนุมัติงบประมาณ (Approval) • สั่งซื้อ (PO) • ตรวจรับพัสดุหน้างาน • 
              คลังพัสดุก่อสร้างกลาง (Hub) & บาร์โค้ด SKU • คู่ค้า • นำเข้าข้อมูล (Data Hub) • เชื่อมต่อคลาวด์ & LINE • สิทธิ์ผู้ใช้ • รายงาน
            </p>
          </div>

          {/* Document Sign-off / Control Matrix */}
          <div className="mt-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-700" />
              บันทึกการจัดทำ ตรวจทาน และอนุมัติเอกสาร (Document Authorization Matrix)
            </h3>
            <div className="border border-slate-300 rounded overflow-hidden text-[10.5px]">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                    <th className="py-2 px-3 w-1/3 border-r border-slate-300">จัดทำโดย (Prepared By)</th>
                    <th className="py-2 px-3 w-1/3 border-r border-slate-300">ตรวจทานโดย (Reviewed By)</th>
                    <th className="py-2 px-3 w-1/3">อนุมัติโดย (Approved By)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="h-20 bg-white">
                    <td className="p-3 border-r border-slate-300 align-bottom">
                      <div className="text-indigo-800 font-serif italic text-sm mb-1">สมปอง จัดซื้อ</div>
                      <div className="font-semibold text-slate-800 text-[10px]">นายสมปอง จัดซื้อ</div>
                      <div className="text-slate-500 text-[9px]">วิศวกรพัฒนาระบบจัดซื้อ</div>
                    </td>
                    <td className="p-3 border-r border-slate-300 align-bottom">
                      <div className="text-indigo-800 font-serif italic text-sm mb-1">วิชาญ คุมต้นทุน</div>
                      <div className="font-semibold text-slate-800 text-[10px]">นายวิชาญ คุมต้นทุน</div>
                      <div className="text-slate-500 text-[9px]">ผู้จัดการฝ่าย Cost Control</div>
                    </td>
                    <td className="p-3 align-bottom">
                      <div className="text-indigo-800 font-serif italic text-sm mb-1">กฤษฎา บริหาร</div>
                      <div className="font-semibold text-slate-800 text-[10px]">นายกฤษฎา บริหาร</div>
                      <div className="text-slate-500 text-[9px]">รองกรรมการผู้จัดการ (VP Operations)</div>
                    </td>
                  </tr>
                  <tr className="bg-slate-50/70 text-[9.5px] text-slate-600">
                    <td className="py-1 px-2 border-r border-slate-300">วันที่: {currentDateStr}</td>
                    <td className="py-1 px-2 border-r border-slate-300">วันที่: {currentDateStr}</td>
                    <td className="py-1 px-2">วันที่: {currentDateStr}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="mt-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-indigo-700" />
              สารบัญเอกสาร (Table of Contents)
            </h3>
            <div className="border border-slate-300 rounded p-4 bg-slate-50/50 space-y-1.5 text-[11px]">
              <div className="flex justify-between items-baseline border-b border-dotted border-slate-300 pb-1">
                <span><strong>หมวดที่ 1:</strong> วัตถุประสงค์ ขอบเขต และผังภาพความเชื่อมโยงระบบทั้งวงจร (End-to-End Workflow)</span>
                <span className="font-mono font-bold text-indigo-700">หน้า 2</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-dotted border-slate-300 pb-1">
                <span><strong>หมวดที่ 2:</strong> ขั้นตอนการปฏิบัติงานระบบขอซื้อ (PR) และระบบการอนุมัติ (Approval Matrix)</span>
                <span className="font-mono font-bold text-indigo-700">หน้า 3</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-dotted border-slate-300 pb-1">
                <span><strong>หมวดที่ 3:</strong> ขั้นตอนการปฏิบัติงานระบบสั่งซื้อ (PO) และการตรวจรับสินค้าหน้างาน (Receiving)</span>
                <span className="font-mono font-bold text-indigo-700">หน้า 4</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-dotted border-slate-300 pb-1">
                <span><strong>หมวดที่ 4:</strong> คลังพัสดุก่อสร้างกลาง (Hub), บาร์โค้ด Master SKU และเทคโนโลยีสแกนกล้อง QR Code</span>
                <span className="font-mono font-bold text-indigo-700">หน้า 5</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-dotted border-slate-300 pb-1">
                <span><strong>หมวดที่ 5:</strong> ทะเบียนคู่ค้า (Vendors), ศูนย์นำเข้าข้อมูลอัจฉริยะ (Data Import Hub) และรายงาน (Reports)</span>
                <span className="font-mono font-bold text-indigo-700">หน้า 6</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-dotted border-slate-300 pb-1">
                <span><strong>หมวดที่ 6:</strong> การจัดการสิทธิ์ผู้ใช้งาน (RBAC 25 สิทธิ์), การเชื่อมต่อคลาวด์ & LINE และพจนานุกรมปุ่ม</span>
                <span className="font-mono font-bold text-indigo-700">หน้า 7</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span><strong>หมวดที่ 7:</strong> คำถามที่พบบ่อย (FAQ & Troubleshooting) และประวัติการปรับปรุงเอกสาร (Revision Log Rev. 3.0)</span>
                <span className="font-mono font-bold text-indigo-700">หน้า 8</span>
              </div>
            </div>
          </div>
        </div>

        {/* Running Footer */}
        <div className="pt-4 border-t border-slate-300 flex justify-between items-center text-[9.5px] text-slate-500">
          <div>เอกสารควบคุมภายใน (Internal Controlled Document) - ห้ามทำซ้ำหรือแจกจ่ายโดยไม่ได้รับอนุญาต</div>
          <div className="font-mono font-bold text-slate-700">หน้า 1 จาก 8</div>
        </div>

      </div>


      {/* =========================================================================
          PAGE 2: หมวดที่ 1: วัตถุประสงค์ ขอบเขต และผังความเชื่อมโยงระบบทั้งวงจร
         ========================================================================= */}
      <div className="standard-manual-page bg-white w-[794px] min-h-[1123px] mx-auto p-12 mb-8 shadow-lg border border-slate-300 flex flex-col justify-between print:w-full print:min-h-0 print:shadow-none print:border-none print:p-8 print:m-0 print:page-break-always">
        <div>
          {/* Running Page Header */}
          <div className="flex justify-between items-center border-b border-slate-300 pb-2 mb-6 text-[10px] text-slate-500">
            <div>ProcureSync Enterprise System | <strong className="text-slate-800">{docCode} ({docRev})</strong></div>
            <div className="font-semibold text-slate-700">หมวดที่ 1: วัตถุประสงค์และผังภาพการเชื่อมโยงระบบ</div>
            <div>หน้า 2 จาก 8</div>
          </div>

          {/* Section 1.1 */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1.5">
                <span className="w-6 h-6 rounded bg-indigo-700 text-white flex items-center justify-center text-xs font-bold">1</span>
                <span>1.0 วัตถุประสงค์และขอบเขตการใช้งานระบบ (System Objective & Scope)</span>
              </h2>
              <div className="mt-2.5 text-[11px] text-slate-700 leading-relaxed space-y-1.5 text-justify">
                <p>
                  ระบบ <strong>ProcureSync</strong> ได้รับการออกแบบขึ้นเพื่อเป็นระบบศูนย์กลางในการบริหารจัดการกระบวนการจัดซื้อจัดจ้าง (Procurement) 
                  และการควบคุมคลังพัสดุอุปกรณ์ก่อสร้าง (Inventory Control) ให้มีความโปร่งใส รวดเร็ว และสามารถตรวจสอบย้อนหลัง (Audit Trail) ได้ทุกขั้นตอน
                </p>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <strong className="text-indigo-900 block mb-1">เป้าหมายหลักทางธุรกิจ:</strong>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 text-[10.5px]">
                      <li>ควบคุมงบประมาณโครงการ (BOQ Cost Control) ไม่ให้เกิดงบบานปลาย</li>
                      <li>ลดระยะเวลาการขออนุมัติจากเดิม 3-5 วัน เหลือไม่เกิน 2 ชั่วโมง</li>
                      <li>ตัดสต็อกและบันทึกประวัติทันที ป้องกันพัสดุสูญหายหน้างาน</li>
                    </ul>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <strong className="text-indigo-900 block mb-1">ขอบเขตผู้ใช้งาน (Target Roles):</strong>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 text-[10.5px]">
                      <li>วิศวกรสนาม (Site Engineer) & เจ้าหน้าที่สโตร์โครงการ</li>
                      <li>เจ้าหน้าที่จัดซื้อ (Buyer / Procurement Officer)</li>
                      <li>ผู้จัดการโครงการ (PM) & ผู้บริหารฝ่ายควบคุมต้นทุน</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 1.2: End-to-End Workflow Flowchart */}
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-700" />
                แผนภาพวงจรการเชื่อมโยงข้อมูลทั้งระบบแบบครบวงจร (End-to-End Lifecycle Workflow)
              </h3>
              
              <div className="border border-indigo-200 bg-indigo-50/30 rounded-lg p-3.5 space-y-3">
                <p className="text-[10px] text-slate-600 leading-normal">
                  ข้อมูลในระบบจะไหลต่อเนื่องกันโดยอัตโนมัติ (Automated Data Flow) โดยผู้ปฏิบัติงานไม่ต้องบันทึกข้อมูลซ้ำซ้อนตาม 7 ขั้นตอนมาตรฐานดังนี้:
                </p>

                {/* 7-Step Grid */}
                <div className="grid grid-cols-1 gap-2 text-[10.5px]">
                  
                  <div className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 shadow-2xs">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">1</div>
                    <div className="w-36 font-bold text-indigo-900 shrink-0">เปิดคำขอซื้อ (PR)</div>
                    <div className="text-slate-600 flex-1">วิศวกรระบุรายการวัสดุ โครงการ และ Cost Code BOQ แล้วกด <span className="font-semibold text-slate-800">"ส่งขออนุมัติ"</span></div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 shadow-2xs">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">2</div>
                    <div className="w-36 font-bold text-blue-900 shrink-0">พิจารณาอนุมัติ (Approval)</div>
                    <div className="text-slate-600 flex-1">ผู้มีอำนาจตรวจสอบวงเงิน เอกสารทางการ A4 และกด <span className="font-semibold text-emerald-700">"อนุมัติคำขอ"</span> (ลงนามดิจิทัล)</div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 shadow-2xs">
                    <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">3</div>
                    <div className="w-36 font-bold text-purple-900 shrink-0">ออกใบสั่งซื้อ (PO)</div>
                    <div className="text-slate-600 flex-1">ฝ่ายจัดซื้อกด <span className="font-semibold text-indigo-700">"สร้าง PO จาก PR ที่อนุมัติ"</span> ข้อมูลจะถูกถ่ายโอนอัตโนมัติ ส่งให้ผู้ขาย</div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 shadow-2xs">
                    <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">4</div>
                    <div className="w-36 font-bold text-amber-900 shrink-0">ตรวจรับของหน้างาน (Receive)</div>
                    <div className="text-slate-600 flex-1">ของมาส่ง เจ้าหน้าที่กด <span className="font-semibold text-amber-800">"ตรวจรับสินค้า"</span> ในหน้า PO (รองรับการรับบางส่วน)</div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 shadow-2xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">5</div>
                    <div className="w-36 font-bold text-emerald-900 shrink-0">เข้าสต็อกคลัง (Inventory)</div>
                    <div className="text-slate-600 flex-1">ยอดสต็อกในคลังเพิ่มขึ้นทันที พร้อมบันทึกประวัติการรับเข้าและมูลค่าเฉลี่ย</div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 shadow-2xs">
                    <div className="w-6 h-6 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">6</div>
                    <div className="w-36 font-bold text-cyan-900 shrink-0">พิมพ์ป้าย & สแกน QR Code</div>
                    <div className="text-slate-600 flex-1">พิมพ์สติกเกอร์ QR ติดกล่อง และใช้กล้องมือถือสแกนเบิกจ่ายของไปใช้ที่หน้างานได้ทันที</div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 shadow-2xs">
                    <div className="w-6 h-6 rounded-full bg-slate-700 text-white font-bold flex items-center justify-center text-[10px] shrink-0">7</div>
                    <div className="w-36 font-bold text-slate-900 shrink-0">รายงานและวิเคราะห์ (Reports)</div>
                    <div className="text-slate-600 flex-1">สรุปต้นทุนโครงการ อัตราการใช้วัสดุ และสถานะคงค้างขึ้นสู่แดชบอร์ดผู้บริหาร</div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>

                </div>

                <div className="p-2.5 rounded bg-white border border-indigo-100 text-[10px] text-slate-600 leading-relaxed">
                  <strong className="text-indigo-900">ข้อกำหนดด้านความถูกต้องของข้อมูล (Data Integrity Rule):</strong> เมื่อเอกสาร PR ได้รับการอนุมัติแล้ว ระบบจะล็อกไม่ให้ผู้ขอแก้ไขรายการเอง หากมีความจำเป็นต้องเปลี่ยนแปลง จะต้องทำการยกเลิกหรือขออนุมัติใหม่เท่านั้นเพื่อความถูกต้องในการตรวจสอบบัญชี
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Running Footer */}
        <div className="pt-4 border-t border-slate-300 flex justify-between items-center text-[9.5px] text-slate-500">
          <div>เอกสารควบคุมภายใน (Internal Controlled Document) - บริษัท พรอคเคียวซิงค์ คอนสตรัคชั่น แอนด์ เอ็นจิเนียริ่ง จำกัด</div>
          <div className="font-mono font-bold text-slate-700">หน้า 2 จาก 8</div>
        </div>
      </div>


      {/* =========================================================================
          PAGE 3: หมวดที่ 2: ระบบขอซื้อ (PR) และระบบการอนุมัติ (Approval Matrix)
         ========================================================================= */}
      <div className="standard-manual-page bg-white w-[794px] min-h-[1123px] mx-auto p-12 mb-8 shadow-lg border border-slate-300 flex flex-col justify-between print:w-full print:min-h-0 print:shadow-none print:border-none print:p-8 print:m-0 print:page-break-always">
        <div>
          {/* Running Page Header */}
          <div className="flex justify-between items-center border-b border-slate-300 pb-2 mb-6 text-[10px] text-slate-500">
            <div>ProcureSync Enterprise System | <strong className="text-slate-800">{docCode} ({docRev})</strong></div>
            <div className="font-semibold text-slate-700">หมวดที่ 2: ระบบขอซื้อ (PR) และระบบการอนุมัติ</div>
            <div>หน้า 3 จาก 8</div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1.5">
                <span className="w-6 h-6 rounded bg-indigo-700 text-white flex items-center justify-center text-xs font-bold">2</span>
                <span>2.0 ขั้นตอนการปฏิบัติงานระบบขอซื้อ (PR) และการอนุมัติ (Approvals)</span>
              </h2>
            </div>

            {/* 2.1 PR Workflow */}
            <div>
              <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5 text-indigo-700" />
                2.1 ขั้นตอนการจัดทำใบขอซื้อพัสดุ (Purchase Requisition Workflow)
              </h3>
              <div className="text-[11px] text-slate-700 leading-relaxed space-y-1">
                <p>1. เข้าสู่เมนู <strong>"ระบบขอซื้อ (PR)"</strong> จากแถบเมนูด้านซ้าย แล้วกดปุ่ม <strong>"+ สร้างใบขอซื้อใหม่"</strong></p>
                <p>2. เลือกรหัสโครงการ (Project Code), วันที่ต้องการใช้งานหน้างาน, และระดับความเร่งด่วน (ปกติ / ด่วน / ด่วนที่สุด)</p>
                <p>3. เพิ่มรายการวัสดุ โดยสามารถเลือกใช้ <strong>"เทมเพลตหมวดหมู่งานก่อสร้าง (Category Templates)"</strong> เช่น งานฐานราก งานคอนกรีต งานระบบไฟฟ้า เพื่อดึงสเปกมาตรฐานมาใช้ได้อย่างรวดเร็ว</p>
                <p>4. กดปุ่ม <strong>"ดูตัวอย่างเอกสาร A4"</strong> เพื่อตรวจทานความถูกต้อง แล้วกด <strong>"ส่งเพื่อขออนุมัติ"</strong> เอกสารจะวิ่งเข้าสู่สายการอนุมัติทันที</p>
              </div>
            </div>

            {/* 2.2 Approval Matrix */}
            <div className="pt-1">
              <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <ClipboardCheck className="w-3.5 h-3.5 text-indigo-700" />
                2.2 สายการอนุมัติและวงเงินอำนาจดำเนินการ (Approval Matrix & Verification)
              </h3>
              <div className="border border-slate-300 rounded overflow-hidden text-[10.5px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                      <th className="py-1.5 px-3 w-28">ระดับการอนุมัติ</th>
                      <th className="py-1.5 px-3 w-40">กรอบวงเงินอนุมัติ</th>
                      <th className="py-1.5 px-3">ผู้มีอำนาจลงนามอนุมัติ (Authorized Signatory)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-1.5 px-3 font-semibold text-slate-800">ระดับ 1 (Level 1)</td>
                      <td className="py-1.5 px-3 font-mono">ไม่เกิน 50,000 บาท</td>
                      <td className="py-1.5 px-3 text-slate-600">ผู้จัดการโครงการหน้างาน (Site Project Manager)</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-semibold text-slate-800">ระดับ 2 (Level 2)</td>
                      <td className="py-1.5 px-3 font-mono">50,001 - 500,000 บาท</td>
                      <td className="py-1.5 px-3 text-slate-600">ผู้จัดการฝ่ายควบคุมต้นทุน (Cost Control Manager)</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-semibold text-slate-800">ระดับ 3 (Level 3)</td>
                      <td className="py-1.5 px-3 font-mono">มากกว่า 500,000 บาท</td>
                      <td className="py-1.5 px-3 text-slate-600">รองกรรมการผู้จัดการ / กรรมการผู้จัดการ (VP Operations / MD)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* PR & Approval Button Dictionary */}
            <div className="pt-1">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                ตารางสรุปปุ่มฟังก์ชันและการเชื่อมโยง (Button & Action Guide: PR & Approvals)
              </h3>
              <div className="border border-slate-300 rounded overflow-hidden text-[10px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-white font-bold">
                      <th className="py-1.5 px-2.5 w-36">ชื่อปุ่มในระบบ</th>
                      <th className="py-1.5 px-2.5 w-32">ตำแหน่ง</th>
                      <th className="py-1.5 px-2.5">คำสั่งที่เกิดขึ้นเมื่อกด (Action)</th>
                      <th className="py-1.5 px-2.5 w-44">ผลลัพธ์และการเชื่อมโยง</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-1.5 px-2.5 font-bold text-indigo-900">+ สร้างใบขอซื้อใหม่</td>
                      <td className="py-1.5 px-2.5 text-slate-500">มุมขวาบนหน้า PR</td>
                      <td className="py-1.5 px-2.5 text-slate-700">เปิดฟอร์มสร้าง PR พร้อมดึงเลขที่เอกสารอัตโนมัติ</td>
                      <td className="py-1.5 px-2.5 text-indigo-700">ได้เอกสารร่าง Draft</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2.5 font-bold text-indigo-900">ส่งเพื่อขออนุมัติ</td>
                      <td className="py-1.5 px-2.5 text-slate-500">ด้านล่างฟอร์ม PR</td>
                      <td className="py-1.5 px-2.5 text-slate-700">ตรวจสอบความครบถ้วนแล้วส่งเอกสารเข้าสายอนุมัติ</td>
                      <td className="py-1.5 px-2.5 text-indigo-700">ส่งแจ้งเตือนเข้าหน้า Approvals</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2.5 font-bold text-emerald-800">อนุมัติคำขอ (Approve)</td>
                      <td className="py-1.5 px-2.5 text-slate-500">หน้าจอ Approvals</td>
                      <td className="py-1.5 px-2.5 text-slate-700">ยืนยันการอนุมัติพร้อมประทับลายมือชื่อดิจิทัล</td>
                      <td className="py-1.5 px-2.5 text-indigo-700">ปลดล็อกให้ฝ่ายจัดซื้อออก PO ได้</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2.5 font-bold text-red-800">ปฏิเสธคำขอ (Reject)</td>
                      <td className="py-1.5 px-2.5 text-slate-500">หน้าจอ Approvals</td>
                      <td className="py-1.5 px-2.5 text-slate-700">ระบุเหตุผลที่ไม่อนุมัติ แล้วส่งกลับผู้ขอซื้อ</td>
                      <td className="py-1.5 px-2.5 text-indigo-700">แจ้งเตือนผู้ขอซื้อเพื่อแก้ไข</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Document Status Legend */}
            <div className="pt-1">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                ความหมายสถานะเอกสาร PR (PR Status Reference)
              </h3>
              <div className="grid grid-cols-4 gap-2 text-[10px]">
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-0.5">Draft (ฉบับร่าง)</span>
                  <span className="text-slate-500">เอกสารยังสร้างไม่เสร็จ ยังไม่ส่งเข้าสู่ระบบอนุมัติ</span>
                </div>
                <div className="p-2 rounded bg-amber-50 border border-amber-200">
                  <span className="font-bold text-amber-800 block mb-0.5">Pending (รออนุมัติ)</span>
                  <span className="text-slate-600">เอกสารอยู่ในคิวพิจารณาของผู้มีอำนาจลงนาม</span>
                </div>
                <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
                  <span className="font-bold text-emerald-800 block mb-0.5">Approved (อนุมัติแล้ว)</span>
                  <span className="text-slate-600">ผ่านการอนุมัติแล้ว พร้อมนำไปเปิดใบสั่งซื้อ PO</span>
                </div>
                <div className="p-2 rounded bg-red-50 border border-red-200">
                  <span className="font-bold text-red-800 block mb-0.5">Rejected (ส่งกลับ)</span>
                  <span className="text-slate-600">ไม่ผ่านการอนุมัติ ผู้ขอต้องดูหมายเหตุและแก้ไข</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Running Footer */}
        <div className="pt-4 border-t border-slate-300 flex justify-between items-center text-[9.5px] text-slate-500">
          <div>เอกสารควบคุมภายใน (Internal Controlled Document) - บริษัท พรอคเคียวซิงค์ คอนสตรัคชั่น แอนด์ เอ็นจิเนียริ่ง จำกัด</div>
          <div className="font-mono font-bold text-slate-700">หน้า 3 จาก 8</div>
        </div>
      </div>


      {/* =========================================================================
          PAGE 4: หมวดที่ 3: ระบบสั่งซื้อ (PO) และการตรวจรับสินค้า (Receiving)
         ========================================================================= */}
      <div className="standard-manual-page bg-white w-[794px] min-h-[1123px] mx-auto p-12 mb-8 shadow-lg border border-slate-300 flex flex-col justify-between print:w-full print:min-h-0 print:shadow-none print:border-none print:p-8 print:m-0 print:page-break-always">
        <div>
          {/* Running Page Header */}
          <div className="flex justify-between items-center border-b border-slate-300 pb-2 mb-6 text-[10px] text-slate-500">
            <div>ProcureSync Enterprise System | <strong className="text-slate-800">{docCode} ({docRev})</strong></div>
            <div className="font-semibold text-slate-700">หมวดที่ 3: ระบบสั่งซื้อ (PO) และการตรวจรับสินค้า</div>
            <div>หน้า 4 จาก 8</div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1.5">
                <span className="w-6 h-6 rounded bg-indigo-700 text-white flex items-center justify-center text-xs font-bold">3</span>
                <span>3.0 ขั้นตอนการปฏิบัติงานระบบสั่งซื้อ (PO) และการตรวจรับพัสดุหน้างาน</span>
              </h2>
            </div>

            {/* 3.1 PO Issuance Workflow */}
            <div>
              <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-700" />
                3.1 การออกใบสั่งซื้อสินค้า (Purchase Order Procedure)
              </h3>
              <div className="text-[11px] text-slate-700 leading-relaxed space-y-1">
                <p>1. เข้าสู่เมนู <strong>"ระบบจัดซื้อ (PO)"</strong> แล้วกดปุ่ม <strong>"สร้าง PO จาก PR ที่อนุมัติแล้ว"</strong></p>
                <p>2. เลือกรหัส PR ที่ต้องการ ข้อมูลรายการพัสดุ ปริมาณ สเปก และราคากลางจะถูกดึงมาใส่ใน PO ให้โดยอัตโนมัติ</p>
                <p>3. เลือกผู้จำหน่าย (Vendor) กำหนดเงื่อนไขการชำระเงิน (เช่น เครดิต 30 วัน) และสถานที่ส่งมอบของหน้างาน</p>
                <p>4. กดปุ่ม <strong>"ส่งเอกสารให้ผู้ค้า (Send PO)"</strong> พร้อมทั้งสั่งพิมพ์หรือส่งอีเมลใบสั่งซื้อให้ผู้จำหน่ายผลิตสินค้า</p>
              </div>
            </div>

            {/* 3.2 Receiving Procedure */}
            <div className="pt-1">
              <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-indigo-700" />
                3.2 ขั้นตอนการตรวจรับสินค้าหน้างาน (Goods Receiving & Inspection)
              </h3>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] space-y-2 text-slate-700 leading-relaxed">
                <p>
                  เมื่อสินค้ามาส่งที่ไซต์งาน วิศวกรสนามหรือเจ้าหน้าที่สโตร์จะต้องทำการตรวจนับและเปิดหน้ารายละเอียด PO นั้นๆ แล้วกดปุ่ม 
                  <strong> "ตรวจรับสินค้า (Receive Goods)"</strong> โดยระบบรองรับ 2 รูปแบบ:
                </p>
                <div className="grid grid-cols-2 gap-3 text-[10.5px]">
                  <div className="p-2.5 bg-white rounded border border-slate-200">
                    <strong className="text-emerald-800 block mb-1">ก. ตรวจรับครบตามจำนวน (Full Delivery):</strong>
                    <p className="text-slate-600">กรอกจำนวนรับตรงตามยอดสั่งซื้อ ระบบจะปรับสถานะ PO เป็น <strong>Completed</strong> และเพิ่มสต็อกเข้าคลังทันที</p>
                  </div>
                  <div className="p-2.5 bg-white rounded border border-slate-200">
                    <strong className="text-amber-800 block mb-1">ข. ตรวจรับบางส่วน (Partial Delivery):</strong>
                    <p className="text-slate-600">กรอกเฉพาะจำนวนที่ส่งจริงในงวดนั้น ระบบจะปรับสถานะเป็น <strong>Partially Received</strong> พร้อมเก็บยอดค้างส่งไว้รอรับงวดถัดไป</p>
                  </div>
                </div>
              </div>
            </div>

            {/* PO Button Guide */}
            <div className="pt-1">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                ตารางสรุปปุ่มฟังก์ชันและการเชื่อมโยง (Button & Action Guide: PO & Receiving)
              </h3>
              <div className="border border-slate-300 rounded overflow-hidden text-[10px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-white font-bold">
                      <th className="py-1.5 px-2.5 w-36">ชื่อปุ่มในระบบ</th>
                      <th className="py-1.5 px-2.5 w-32">ตำแหน่ง</th>
                      <th className="py-1.5 px-2.5">คำสั่งที่เกิดขึ้นเมื่อกด (Action)</th>
                      <th className="py-1.5 px-2.5 w-44">ผลลัพธ์และการเชื่อมโยง</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-1.5 px-2.5 font-bold text-indigo-900">สร้าง PO จาก PR</td>
                      <td className="py-1.5 px-2.5 text-slate-500">มุมบนขวาหน้า PO</td>
                      <td className="py-1.5 px-2.5 text-slate-700">ดึงข้อมูลจาก PR ที่อนุมัติมาเปิดใบสั่งซื้อใหม่</td>
                      <td className="py-1.5 px-2.5 text-indigo-700">ไม่ต้องคีย์รายการสินค้าซ้ำ</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2.5 font-bold text-emerald-800">ตรวจรับสินค้า</td>
                      <td className="py-1.5 px-2.5 text-slate-500">หน้ารายละเอียด PO</td>
                      <td className="py-1.5 px-2.5 text-slate-700">เปิดหน้าต่างบันทึกจำนวนของที่ส่งจริงหน้างาน</td>
                      <td className="py-1.5 px-2.5 text-indigo-700">เพิ่มสต็อกคลังสินค้าทันที</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2.5 font-bold text-slate-800">ดูตัวอย่าง / พิมพ์ A4</td>
                      <td className="py-1.5 px-2.5 text-slate-500">แถบจัดการเอกสาร</td>
                      <td className="py-1.5 px-2.5 text-slate-700">แสดงเอกสารทางการ A4 พร้อมตราสัญลักษณ์บริษัท</td>
                      <td className="py-1.5 px-2.5 text-indigo-700">สั่งพิมพ์หรือเซฟ PDF ส่งคู่ค้า</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* PO Status Legend */}
            <div className="pt-1">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                ความหมายสถานะเอกสาร PO (PO Status Reference)
              </h3>
              <div className="grid grid-cols-4 gap-2 text-[10px]">
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-0.5">Draft (ร่างใบสั่งซื้อ)</span>
                  <span className="text-slate-500">กำลังจัดทำ ยังไม่ส่งไปยังผู้จำหน่าย</span>
                </div>
                <div className="p-2 rounded bg-blue-50 border border-blue-200">
                  <span className="font-bold text-blue-800 block mb-0.5">Sent (ส่งให้ผู้ค้าแล้ว)</span>
                  <span className="text-slate-600">ส่งใบสั่งซื้อแล้ว อยู่ระหว่างรอผู้ค้าส่งมอบของ</span>
                </div>
                <div className="p-2 rounded bg-amber-50 border border-amber-200">
                  <span className="font-bold text-amber-800 block mb-0.5">Partially (รับบางส่วน)</span>
                  <span className="text-slate-600">ได้รับของแล้วบางรายการ ยังมียอดค้างส่ง</span>
                </div>
                <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
                  <span className="font-bold text-emerald-800 block mb-0.5">Completed (ครบถ้วน)</span>
                  <span className="text-slate-600">ตรวจรับสินค้าครบ 100% สิ้นสุดกระบวนการสั่งซื้อ</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Running Footer */}
        <div className="pt-4 border-t border-slate-300 flex justify-between items-center text-[9.5px] text-slate-500">
          <div>เอกสารควบคุมภายใน (Internal Controlled Document) - บริษัท พรอคเคียวซิงค์ คอนสตรัคชั่น แอนด์ เอ็นจิเนียริ่ง จำกัด</div>
          <div className="font-mono font-bold text-slate-700">หน้า 4 จาก 8</div>
        </div>
      </div>


      {/* =========================================================================
          PAGE 5: หมวดที่ 4: ระบบคลังสินค้า (Inventory) และเทคโนโลยีสแกน QR Code
         ========================================================================= */}
      <div className="standard-manual-page bg-white w-[794px] min-h-[1123px] mx-auto p-12 mb-8 shadow-lg border border-slate-300 flex flex-col justify-between print:w-full print:min-h-0 print:shadow-none print:border-none print:p-8 print:m-0 print:page-break-always">
        <div>
          {/* Running Page Header */}
          <div className="flex justify-between items-center border-b border-slate-300 pb-2 mb-6 text-[10px] text-slate-500">
            <div>ProcureSync Enterprise System | <strong className="text-slate-800">{docCode} ({docRev})</strong></div>
            <div className="font-semibold text-slate-700">หมวดที่ 4: ระบบคลังสินค้าและการสแกนกล้อง QR Code</div>
            <div>หน้า 5 จาก 8</div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1.5">
                <span className="w-6 h-6 rounded bg-indigo-700 text-white flex items-center justify-center text-xs font-bold">4</span>
                <span>4.0 ขั้นตอนการปฏิบัติงานคลังพัสดุก่อสร้างกลาง (Hub), บาร์โค้ด SKU และการสแกน QR Code</span>
              </h2>
            </div>

            {/* 4.1 Stock Control */}
            <div>
              <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-indigo-700" />
                4.1 การจัดการสต็อกและการเคลื่อนไหวพัสดุ (Central Material Hub & Stock Movements)
              </h3>
              <div className="text-[11px] text-slate-700 leading-relaxed space-y-1">
                <p>1. <strong>รับของเข้าคลัง (Stock In / PO Receipt):</strong> เพิ่มสต็อกอัตโนมัติเมื่อตรวจรับสินค้าจาก PO หรือโอนย้ายพัสดุระหว่างคลัง</p>
                <p>2. <strong>เบิกจ่ายไปหน้างาน (Stock Out):</strong> ตัดสต็อกเมื่อช่าง/ผู้รับเหมาเบิกวัสดุไปใช้ ระบุโครงการ ผู้เบิก และโซนงาน</p>
                <p>3. <strong>ตรวจนับสต็อกหน้างาน (Physical Count):</strong> ยิงบาร์โค้ดนับยอดจริง ระบบคำนวณผลต่าง (+ / -) อัตโนมัติและปรับยอดสต็อก</p>
              </div>
            </div>

            {/* 4.2 Barcode & QR Code Technology */}
            <div className="pt-1">
              <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-indigo-700" />
                4.2 ระบบบาร์โค้ด Master SKU (1D Code 128), กล้องสแกนสด และป้ายสติกเกอร์ความร้อน
              </h3>
              <div className="border border-slate-200 bg-slate-50 rounded p-3 text-[11px] text-slate-700 leading-relaxed space-y-2">
                <p>
                  รองรับการทำงานในไซต์งานและโกดังอย่างสมบูรณ์แบบด้วยเทคโนโลยี <strong>Master SKU Barcode & QR Integration</strong>:
                </p>
                <div className="grid grid-cols-2 gap-3 text-[10.5px]">
                  <div className="p-2.5 bg-white rounded border border-slate-200">
                    <strong className="text-indigo-900 block mb-1 flex items-center gap-1">
                      <Printer className="w-3.5 h-3.5 text-indigo-600" />
                      ก. พิมพ์ป้ายสติกเกอร์ความร้อน (Thermal Label):
                    </strong>
                    <p className="text-slate-600">กด <strong>"พิมพ์ป้ายบาร์โค้ด SKU"</strong> รองรับสติกเกอร์ความร้อน 50x30 มม., 75x50 มม., ป้ายติดชั้นวาง (Shelf Tag) และชุดพิมพ์ A4 ตามจำนวนสต็อกจริง</p>
                  </div>
                  <div className="p-2.5 bg-white rounded border border-slate-200">
                    <strong className="text-indigo-900 block mb-1 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-indigo-600" />
                      ข. เครื่องยิงบาร์โค้ดไร้สาย & กล้องมือถือ:
                    </strong>
                    <p className="text-slate-600">รองรับทั้งเครื่องยิงบาร์โค้ดไร้สาย (Wireless USB Gun) ยิงอ่าน Master SKU ทันที หรือกด <strong>"สแกนบาร์โค้ด"</strong> เปิดกล้องมือถือส่องป้ายเพื่อเบิกจ่ายใน 3 วินาที</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory Button Dictionary */}
            <div className="pt-1">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                ตารางสรุปปุ่มฟังก์ชันและการเชื่อมโยง (Button & Action Guide: Inventory)
              </h3>
              <div className="border border-slate-300 rounded overflow-hidden text-[10px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-white font-bold">
                      <th className="py-1.5 px-2.5 w-36">ชื่อปุ่มในระบบ</th>
                      <th className="py-1.5 px-2.5 w-32">ตำแหน่ง</th>
                      <th className="py-1.5 px-2.5">คำสั่งที่เกิดขึ้นเมื่อกด (Action)</th>
                      <th className="py-1.5 px-2.5 w-44">ผลลัพธ์และการเชื่อมโยง</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-1.5 px-2.5 font-bold text-indigo-900">สแกนบาร์โค้ด / QR</td>
                      <td className="py-1.5 px-2.5 text-slate-500">แถบเครื่องมือคลัง</td>
                      <td className="py-1.5 px-2.5 text-slate-700">เปิดสแกนเนอร์ รองรับเครื่องยิงไร้สาย กล้องสด และรูปถ่าย</td>
                      <td className="py-1.5 px-2.5 text-indigo-700">ตรวจพบ Master SKU และเปิดเมนูด่วน</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2.5 font-bold text-emerald-800">รับเข้า / เบิกออก</td>
                      <td className="py-1.5 px-2.5 text-slate-500">แถบเครื่องมือ / สแกน</td>
                      <td className="py-1.5 px-2.5 text-slate-700">บันทึกรับพัสดุเข้าคลัง หรือเบิกจ่ายวัสดุไปไซต์งานก่อสร้าง</td>
                      <td className="py-1.5 px-2.5 text-indigo-700">ปรับยอดสต็อกกลางแบบ Real-time</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2.5 font-bold text-indigo-900">พิมพ์ป้ายบาร์โค้ด SKU</td>
                      <td className="py-1.5 px-2.5 text-slate-500">การ์ดสินค้า / รายละเอียด</td>
                      <td className="py-1.5 px-2.5 text-slate-700">เลือกขนาดสติกเกอร์ความร้อน (50x30, 75x50) แล้วสั่งพิมพ์</td>
                      <td className="py-1.5 px-2.5 text-indigo-700">ได้สติกเกอร์สำหรับแปะพัสดุและชั้นวาง</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2.5 font-bold text-emerald-800">ตรวจนับสต็อก (Count)</td>
                      <td className="py-1.5 px-2.5 text-slate-500">คอลัมน์การจัดการ</td>
                      <td className="py-1.5 px-2.5 text-slate-700">บันทึกยอดนับจริงหน้างาน คำนวณผลต่าง (+ / -) อัตโนมัติ</td>
                      <td className="py-1.5 px-2.5 text-indigo-700">ปรับยอดคงเหลือให้ตรงความจริง</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inventory Tips */}
            <div className="p-2.5 rounded bg-amber-50/70 border border-amber-200 text-[10px] text-amber-900 leading-relaxed">
              <strong>ข้อควรระวังในการเบิกจ่าย:</strong> เมื่อสแกนบาร์โค้ด SKU หรือ QR Code เพื่อเบิกจ่าย ให้ตรวจสอบหน่วยนับ (เช่น เมตร, ถุง, แผ่น) ให้ตรงกับวัสดุจริง หากยอดคงเหลือต่ำกว่าเกณฑ์ความปลอดภัย (Safety Stock) ระบบจะแสดงแถบเตือนสีส้มเพื่อเตือนให้เปิด PR สั่งซื้อรอบใหม่
            </div>

          </div>
        </div>

        {/* Running Footer */}
        <div className="pt-4 border-t border-slate-300 flex justify-between items-center text-[9.5px] text-slate-500">
          <div>เอกสารควบคุมภายใน (Internal Controlled Document) - บริษัท พรอคเคียวซิงค์ คอนสตรัคชั่น แอนด์ เอ็นจิเนียริ่ง จำกัด</div>
          <div className="font-mono font-bold text-slate-700">หน้า 5 จาก 8</div>
        </div>
      </div>


      {/* =========================================================================
          PAGE 6: หมวดที่ 5: การจัดการข้อมูลคู่ค้า (Vendors) และระบบรายงานวิเคราะห์
         ========================================================================= */}
      <div className="standard-manual-page bg-white w-[794px] min-h-[1123px] mx-auto p-12 mb-8 shadow-lg border border-slate-300 flex flex-col justify-between print:w-full print:min-h-0 print:shadow-none print:border-none print:p-8 print:m-0 print:page-break-always">
        <div>
          {/* Running Page Header */}
          <div className="flex justify-between items-center border-b border-slate-300 pb-2 mb-6 text-[10px] text-slate-500">
            <div>ProcureSync Enterprise System | <strong className="text-slate-800">{docCode} ({docRev})</strong></div>
            <div className="font-semibold text-slate-700">หมวดที่ 5: คู่ค้า, นำเข้าข้อมูลอัจฉริยะ และรายงานวิเคราะห์</div>
            <div>หน้า 6 จาก 8</div>
          </div>

          <div className="space-y-3.5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1.5">
                <span className="w-6 h-6 rounded bg-indigo-700 text-white flex items-center justify-center text-xs font-bold">5</span>
                <span>5.0 ทะเบียนคู่ค้า (Vendors), ศูนย์นำเข้าข้อมูลอัจฉริยะ (Data Hub) และรายงาน (Reports)</span>
              </h2>
            </div>

            {/* 5.1 Vendor & Import Hub Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* 5.1 Vendor Management */}
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-indigo-700" />
                  5.1 ทะเบียนคู่ค้าและประเมินผู้ขาย (Vendors)
                </h3>
                <div className="text-[10.5px] text-slate-700 leading-relaxed space-y-1">
                  <p>• บันทึกเลขประจำตัวผู้เสียภาษี เงื่อนไขเครดิตเทอม และช่องทางติดต่อ</p>
                  <p>• เก็บประวัติการจัดซื้อย้อนหลัง เชื่อมโยงใบสั่งซื้อ PO อัตโนมัติ</p>
                  <p>• ประเมินผลงานคู่ค้า (Vendor Rating A/B/C) ด้านคุณภาพและความตรงต่อเวลา</p>
                </div>
              </div>

              {/* 5.2 Smart Data Import Hub */}
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-700" />
                  5.2 ศูนย์นำเข้าข้อมูลอัจฉริยะ (Data Import Hub)
                </h3>
                <div className="text-[10.5px] text-slate-700 leading-relaxed space-y-1">
                  <p>• นำเข้าชุดใหญ่จาก Excel (.xlsx), CSV, JSON และแบบจำลอง CAD/DXF</p>
                  <p>• ระบบจับคู่คอลัมน์อัตโนมัติ (AI Column Mapping) ไม่ต้องแปลงฟิลด์เอง</p>
                  <p>• โหมดผสานข้อมูลแบบ Upsert (ปรับยอดเดิม เพิ่มของใหม่) หรือ Append</p>
                </div>
              </div>
            </div>

            {/* 5.3 Executive Reports */}
            <div className="pt-0.5">
              <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-indigo-700" />
                5.3 รายงานวิเคราะห์สารสนเทศผู้บริหาร (Executive Reports & Analytics)
              </h3>
              <div className="grid grid-cols-2 gap-3 text-[10.5px]">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <strong className="text-slate-900 block mb-0.5">รายงานการใช้จ่ายตามหมวดหมู่ (Spend Analysis):</strong>
                  <p className="text-slate-600 leading-relaxed text-[10px]">
                    วิเคราะห์ยอดเงินจัดซื้อแยกตามประเภทวัสดุ (เหล็ก, ปูน, งานระบบ) เทียบกับกรอบงบประมาณ BOQ ของโครงการ
                  </p>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <strong className="text-slate-900 block mb-0.5">รายงานยอดคงค้างและการส่งมอบ (Aging & Outstanding):</strong>
                  <p className="text-slate-600 leading-relaxed text-[10px]">
                    ติดตามยอด PO ที่รอส่งมอบ และ PR รออนุมัติ เพื่อเร่งรัดผู้ขายให้ทันแผนงานก่อสร้างหน้างาน
                  </p>
                </div>
              </div>
            </div>

            {/* Reports & Vendors Button Guide */}
            <div className="pt-0.5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                ตารางสรุปปุ่มฟังก์ชันและการเชื่อมโยง (Button Guide: Vendors, Import & Reports)
              </h3>
              <div className="border border-slate-300 rounded overflow-hidden text-[9.5px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-white font-bold">
                      <th className="py-1 px-2.5 w-36">ชื่อปุ่มในระบบ</th>
                      <th className="py-1 px-2.5 w-32">ตำแหน่ง</th>
                      <th className="py-1 px-2.5">คำสั่งที่เกิดขึ้นเมื่อกด (Action)</th>
                      <th className="py-1 px-2.5 w-44">ผลลัพธ์และการเชื่อมโยง</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-1 px-2.5 font-bold text-indigo-900">+ เพิ่มคู่ค้าใหม่</td>
                      <td className="py-1 px-2.5 text-slate-500">มุมขวาบนหน้า Vendors</td>
                      <td className="py-1 px-2.5 text-slate-700">เปิดฟอร์มกรอกข้อมูลบริษัท เงื่อนไขเครดิต เลขภาษี</td>
                      <td className="py-1 px-2.5 text-indigo-700">พร้อมดึงไปเลือกในใบสั่งซื้อ PO</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2.5 font-bold text-indigo-900">ดาวน์โหลดเทมเพลต</td>
                      <td className="py-1 px-2.5 text-slate-500">หน้า Data Import Hub</td>
                      <td className="py-1 px-2.5 text-slate-700">ดาวน์โหลดไฟล์ Excel ตัวอย่างที่มีหัวคอลัมน์มาตรฐานครบถ้วน</td>
                      <td className="py-1 px-2.5 text-indigo-700">นำไปกรอกข้อมูลก่อนนำเข้า</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2.5 font-bold text-emerald-800">ยืนยันนำเข้าข้อมูล</td>
                      <td className="py-1 px-2.5 text-slate-500">หน้า Data Import Hub</td>
                      <td className="py-1 px-2.5 text-slate-700">ประมวลผลแมปคอลัมน์และบันทึกเข้าสต็อก/PR/PO อัตโนมัติ</td>
                      <td className="py-1 px-2.5 text-indigo-700">เพิ่ม/อัปเดตข้อมูลเป็นชุดใน 2 วินาที</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2.5 font-bold text-emerald-800">ส่งออก Excel / PDF</td>
                      <td className="py-1 px-2.5 text-slate-500">หน้ารายงานสรุป</td>
                      <td className="py-1 px-2.5 text-slate-700">แปลงข้อมูลสถิติเป็นไฟล์สเปรดชีตหรือจัดหน้าพิมพ์ PDF</td>
                      <td className="py-1 px-2.5 text-indigo-700">ใช้เสนอในที่ประชุมประจำเดือน</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Reporting Policy */}
            <div className="p-2 rounded bg-slate-50 border border-slate-200 text-[9.5px] text-slate-600 leading-relaxed">
              <strong className="text-slate-800">ข้อกำหนดการตัดรอบและตรวจสอบข้อมูล:</strong> ข้อมูลในหน้ารายงานเป็น Real-time Sync โดยยอดเงินจะอัปเดตทันทีที่มีการอนุมัติหรือตรวจรับสินค้า โดยสามารถกรองช่วงเวลา (Date Filter) เพื่อดูเปรียบเทียบเป็นรายสัปดาห์ รายเดือน หรือตลอดทั้งอายุโครงการได้
            </div>

          </div>
        </div>

        {/* Running Footer */}
        <div className="pt-4 border-t border-slate-300 flex justify-between items-center text-[9.5px] text-slate-500">
          <div>เอกสารควบคุมภายใน (Internal Controlled Document) - บริษัท พรอคเคียวซิงค์ คอนสตรัคชั่น แอนด์ เอ็นจิเนียริ่ง จำกัด</div>
          <div className="font-mono font-bold text-slate-700">หน้า 6 จาก 8</div>
        </div>
      </div>


      {/* =========================================================================
          PAGE 7: หมวดที่ 6: การบริหารสิทธิ์ผู้ใช้ และตารางพจนานุกรมปุ่มทั้งระบบ
         ========================================================================= */}
      <div className="standard-manual-page bg-white w-[794px] min-h-[1123px] mx-auto p-12 mb-8 shadow-lg border border-slate-300 flex flex-col justify-between print:w-full print:min-h-0 print:shadow-none print:border-none print:p-8 print:m-0 print:page-break-always">
        <div>
          {/* Running Page Header */}
          <div className="flex justify-between items-center border-b border-slate-300 pb-2 mb-6 text-[10px] text-slate-500">
            <div>ProcureSync Enterprise System | <strong className="text-slate-800">{docCode} ({docRev})</strong></div>
            <div className="font-semibold text-slate-700">หมวดที่ 6: สิทธิ์ผู้ใช้, เชื่อมต่อคลาวด์ & LINE และพจนานุกรมปุ่ม</div>
            <div>หน้า 7 จาก 8</div>
          </div>

          <div className="space-y-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1.5">
                <span className="w-6 h-6 rounded bg-indigo-700 text-white flex items-center justify-center text-xs font-bold">6</span>
                <span>6.0 การจัดการสิทธิ์ผู้ใช้งาน (RBAC), การเชื่อมต่อคลาวด์ & LINE และพจนานุกรมคำสั่ง</span>
              </h2>
            </div>

            {/* 6.1 Role Matrix & Cloud Integrations Split */}
            <div className="grid grid-cols-12 gap-3">
              {/* 6.1 Role Matrix */}
              <div className="col-span-7">
                <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-700" />
                  6.1 สิทธิ์การเข้าถึงแยกตามบทบาทหน้าที่ (RBAC 25 สิทธิ์)
                </h3>
                <div className="border border-slate-300 rounded overflow-hidden text-[9px]">
                  <table className="w-full text-center border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                        <th className="py-1 px-1.5 text-left w-32">บทบาท (Role)</th>
                        <th className="py-1 px-1">ขอซื้อ PR</th>
                        <th className="py-1 px-1">อนุมัติ</th>
                        <th className="py-1 px-1">สั่งซื้อ PO</th>
                        <th className="py-1 px-1">คลัง/บาร์โค้ด</th>
                        <th className="py-1 px-1">รายงาน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      <tr>
                        <td className="py-1 px-1.5 text-left font-semibold">วิศวกรสนาม (Site Eng)</td>
                        <td className="py-1 px-1 text-emerald-600 font-bold">✓ เต็มสิทธิ์</td>
                        <td className="py-1 px-1 text-slate-300">-</td>
                        <td className="py-1 px-1 text-slate-400">ดูอย่างเดียว</td>
                        <td className="py-1 px-1 text-emerald-600 font-bold">✓ สแกน/เบิก</td>
                        <td className="py-1 px-1 text-slate-300">-</td>
                      </tr>
                      <tr>
                        <td className="py-1 px-1.5 text-left font-semibold">เจ้าหน้าที่จัดซื้อ (Buyer)</td>
                        <td className="py-1 px-1 text-slate-400">ดูอย่างเดียว</td>
                        <td className="py-1 px-1 text-slate-300">-</td>
                        <td className="py-1 px-1 text-emerald-600 font-bold">✓ เต็มสิทธิ์</td>
                        <td className="py-1 px-1 text-slate-400">ดูอย่างเดียว</td>
                        <td className="py-1 px-1 text-emerald-600 font-bold">✓ สรุปจัดซื้อ</td>
                      </tr>
                      <tr>
                        <td className="py-1 px-1.5 text-left font-semibold">ผู้จัดการโครงการ (PM)</td>
                        <td className="py-1 px-1 text-emerald-600 font-bold">✓ เต็มสิทธิ์</td>
                        <td className="py-1 px-1 text-emerald-600 font-bold">✓ อนุมัติ Lv.1</td>
                        <td className="py-1 px-1 text-slate-400">ดูอย่างเดียว</td>
                        <td className="py-1 px-1 text-emerald-600 font-bold">✓ ตรวจรับ</td>
                        <td className="py-1 px-1 text-emerald-600 font-bold">✓ ดูรายงาน</td>
                      </tr>
                      <tr>
                        <td className="py-1 px-1.5 text-left font-semibold">ผู้ดูแลระบบ (Admin)</td>
                        <td className="py-1 px-1 text-purple-700 font-bold">✓ 100%</td>
                        <td className="py-1 px-1 text-purple-700 font-bold">✓ 100%</td>
                        <td className="py-1 px-1 text-purple-700 font-bold">✓ 100%</td>
                        <td className="py-1 px-1 text-purple-700 font-bold">✓ 100%</td>
                        <td className="py-1 px-1 text-purple-700 font-bold">✓ 100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 6.2 Cloud & Integrations */}
              <div className="col-span-5 p-2 rounded bg-slate-50 border border-slate-200 text-[9.5px] space-y-1">
                <h3 className="font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1 text-[10px]">
                  <Settings className="w-3.5 h-3.5 text-indigo-700" />
                  6.2 เชื่อมต่อคลาวด์ & แจ้งเตือน LINE
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  <strong>• Google Sheets Sync:</strong> ซิงก์ข้อมูลคลังและจัดซื้อสองทางด้วย Google Apps Script Webhook
                </p>
                <p className="text-slate-600 leading-relaxed">
                  <strong>• LINE Notify:</strong> แจ้งเตือนอนุมัติ PR/PO และตรวจรับของเข้ากลุ่มไลน์ทันที
                </p>
                <p className="text-slate-600 leading-relaxed">
                  <strong>• Cloud Backup:</strong> สำรองฐานข้อมูลฉุกเฉินบน Google Drive & Dropbox
                </p>
              </div>
            </div>

            {/* 6.3 Master Button Reference */}
            <div className="pt-0.5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                6.3 พจนานุกรมคำสั่งและปุ่มสำคัญทั้งหมดของระบบ (Master Action Directory)
              </h3>
              <div className="border border-slate-300 rounded overflow-hidden text-[9px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-white font-bold">
                      <th className="py-1 px-2 w-36">ปุ่ม / การสั่งการ</th>
                      <th className="py-1 px-2 w-28">โมดูลที่อยู่</th>
                      <th className="py-1 px-2">หน้าที่การทำงาน (Action)</th>
                      <th className="py-1 px-2 w-44">ผลลัพธ์เชื่อมโยง (System Linkage)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-1 px-2 font-bold text-indigo-900">ค้นหา (Global Search)</td>
                      <td className="py-1 px-2 text-slate-500">Header ด้านบน</td>
                      <td className="py-1 px-2 text-slate-700">ค้นหาด่วนด้วยเลข PR, PO, ชนิดสินค้า, ผู้ขาย</td>
                      <td className="py-1 px-2 text-indigo-700">กระโดดไปยังเอกสารนั้นทันที</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2 font-bold text-indigo-900">สลับภาษา (TH / EN)</td>
                      <td className="py-1 px-2 text-slate-500">แถบเมนูข้าง / Header</td>
                      <td className="py-1 px-2 text-slate-700">เปลี่ยนภาษาข้อความและเอกสารทั้งระบบ</td>
                      <td className="py-1 px-2 text-indigo-700">รองรับทีมงานชาวต่างชาติ</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2 font-bold text-indigo-900">ปรับสเกลหน้าจอ (Display Scale)</td>
                      <td className="py-1 px-2 text-slate-500">เมนู Settings</td>
                      <td className="py-1 px-2 text-slate-700">ปรับความละเอียด UI เป็น 80%, 90%, 100%, 110%</td>
                      <td className="py-1 px-2 text-indigo-700">พอดีกับจอโน้ตบุ๊กและมือถือ</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2 font-bold text-emerald-800">ศูนย์นำเข้าข้อมูล (Data Hub)</td>
                      <td className="py-1 px-2 text-slate-500">แถบเมนูด้านข้าง</td>
                      <td className="py-1 px-2 text-slate-700">อัปโหลด Excel, CSV, CAD พร้อม Auto Column Mapping</td>
                      <td className="py-1 px-2 text-indigo-700">นำเข้าสต็อกและ PR เป็นชุด</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2 font-bold text-emerald-800">ทดสอบแจ้งเตือน LINE</td>
                      <td className="py-1 px-2 text-slate-500">เมนู Integrations</td>
                      <td className="py-1 px-2 text-slate-700">ส่งข้อความทดสอบและเปิดรับการแจ้งเตือนอนุมัติ</td>
                      <td className="py-1 px-2 text-indigo-700">ส่งแจ้งเตือนเข้าสมาร์ตโฟนทันที</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2 font-bold text-indigo-900">ติดตั้งแอป (PWA)</td>
                      <td className="py-1 px-2 text-slate-500">แถบเมนูด้านข้าง</td>
                      <td className="py-1 px-2 text-slate-700">ติดตั้งแอปลงบนหน้าจอโทรศัพท์หรือคอมพิวเตอร์</td>
                      <td className="py-1 px-2 text-indigo-700">เปิดใช้งานได้ทันทีไม่ต้องโหลดสโตร์</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

        {/* Running Footer */}
        <div className="pt-4 border-t border-slate-300 flex justify-between items-center text-[9.5px] text-slate-500">
          <div>เอกสารควบคุมภายใน (Internal Controlled Document) - บริษัท พรอคเคียวซิงค์ คอนสตรัคชั่น แอนด์ เอ็นจิเนียริ่ง จำกัด</div>
          <div className="font-mono font-bold text-slate-700">หน้า 7 จาก 8</div>
        </div>
      </div>


      {/* =========================================================================
          PAGE 8: หมวดที่ 7: คำถามที่พบบ่อย (FAQ) และบันทึกการควบคุมเอกสาร
         ========================================================================= */}
      <div className="standard-manual-page bg-white w-[794px] min-h-[1123px] mx-auto p-12 mb-8 shadow-lg border border-slate-300 flex flex-col justify-between print:w-full print:min-h-0 print:shadow-none print:border-none print:p-8 print:m-0 print:page-break-always">
        <div>
          {/* Running Page Header */}
          <div className="flex justify-between items-center border-b border-slate-300 pb-2 mb-6 text-[10px] text-slate-500">
            <div>ProcureSync Enterprise System | <strong className="text-slate-800">{docCode} ({docRev})</strong></div>
            <div className="font-semibold text-slate-700">หมวดที่ 7: คำถามที่พบบ่อยและบันทึกการปรับปรุง</div>
            <div>หน้า 8 จาก 8</div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1.5">
                <span className="w-6 h-6 rounded bg-indigo-700 text-white flex items-center justify-center text-xs font-bold">7</span>
                <span>7.0 คำถามที่พบบ่อย (FAQ) และประวัติการปรับปรุงเอกสาร (Revision Log)</span>
              </h2>
            </div>

            {/* 7.1 Troubleshooting */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-700" />
                7.1 ปัญหาที่พบบ่อยหน้างานและวิธีแก้ไข (Troubleshooting Guide)
              </h3>
              
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-800">1. ทำไมเปิดกล้องสแกน QR / บาร์โค้ดแล้วไม่ทำงาน?</h4>
                  <p className="text-slate-600 mt-0.5 leading-relaxed text-[9.5px]">
                    <strong>วิธีแก้ไข:</strong> อนุญาตการเข้าถึงกล้อง (Allow Camera) ในเบราว์เซอร์ หรือสลับไปใช้แท็บ <strong>"อัปโหลดรูปภาพ"</strong> หรือใช้ <strong>เครื่องยิงบาร์โค้ดไร้สาย (Barcode Gun)</strong> ยิงเข้าช่องค้นหาได้ทันที
                  </p>
                </div>

                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-800">2. สินค้ามาส่งไม่ครบตามยอดใน PO ทำอย่างไร?</h4>
                  <p className="text-slate-600 mt-0.5 leading-relaxed text-[9.5px]">
                    <strong>วิธีแก้ไข:</strong> กด <strong>"ตรวจรับสินค้า"</strong> แล้วกรอกเฉพาะจำนวนที่รับจริงในงวดนั้น ระบบจะปรับสถานะเป็น Partially Received และจำยอดค้างส่งไว้ให้ตรวจรับต่อในงวดถัดไป
                  </p>
                </div>

                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-800">3. นำเข้าไฟล์ Excel หรือ BOQ แล้วหัวคอลัมน์ไม่ตรง?</h4>
                  <p className="text-slate-600 mt-0.5 leading-relaxed text-[9.5px]">
                    <strong>วิธีแก้ไข:</strong> ในหน้า <strong>"Data Import Hub"</strong> ใช้ระบบ <strong>"Auto-Map Columns"</strong> จับคู่ฟิลด์ หรือดาวน์โหลดเทมเพลตมาตรฐานไปใช้เป็นต้นแบบก่อนอัปโหลด
                  </p>
                </div>

                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-800">4. สัญญาณเน็ตหน้างานขัดข้อง หรือเปิดบนจอเล็ก?</h4>
                  <p className="text-slate-600 mt-0.5 leading-relaxed text-[9.5px]">
                    <strong>วิธีแก้ไข:</strong> ระบบรองรับ Offline Mode สำหรับเปิดดูข้อมูลแคช และสามารถปรับ Display Density เป็น 80% เพื่อให้พอดีกับจอโน้ตบุ๊ก 13-14 นิ้ว
                  </p>
                </div>
              </div>
            </div>

            {/* 7.2 Revision History */}
            <div className="pt-0.5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                7.2 บันทึกประวัติการแก้ไขและปรับปรุงเอกสาร (Document Revision History)
              </h3>
              <div className="border border-slate-300 rounded overflow-hidden text-[9.5px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                      <th className="py-1 px-2.5 w-16">ฉบับ (Rev)</th>
                      <th className="py-1 px-2.5 w-24">มีผลบังคับใช้</th>
                      <th className="py-1 px-2.5">รายละเอียดการแก้ไข / เพิ่มเติม</th>
                      <th className="py-1 px-2.5 w-24">ผู้รับผิดชอบ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    <tr>
                      <td className="py-1 px-2.5 font-mono font-bold text-slate-800">1.0</td>
                      <td className="py-1 px-2.5">1 ม.ค. 2569</td>
                      <td className="py-1 px-2.5">เปิดตัวระบบจัดซื้อ ProcureSync เริ่มต้นใช้งานโมดูล PR และ Approvals</td>
                      <td className="py-1 px-2.5">ทีมพัฒนาระบบ</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2.5 font-mono font-bold text-slate-800">2.0</td>
                      <td className="py-1 px-2.5">15 พ.ค. 2569</td>
                      <td className="py-1 px-2.5">เพิ่มระบบคลังสินค้า (Inventory), การออกใบสั่งซื้อ (PO), และระบบคู่ค้า</td>
                      <td className="py-1 px-2.5">ฝ่ายจัดซื้อกลาง</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2.5 font-mono font-bold text-slate-800">2.4</td>
                      <td className="py-1 px-2.5">12 ต.ค. 2569</td>
                      <td className="py-1 px-2.5">เพิ่มกล้องสแกน QR Code แบบ Real-time, ปรับฟอร์แมตเอกสาร A4 และคู่มือ SOP</td>
                      <td className="py-1 px-2.5">ฝ่ายพัฒนาระบบ SOP</td>
                    </tr>
                    <tr className="bg-indigo-50/50">
                      <td className="py-1 px-2.5 font-mono font-bold text-indigo-900">3.0</td>
                      <td className="py-1 px-2.5 font-bold text-indigo-900">{currentDateStr}</td>
                      <td className="py-1 px-2.5 font-medium text-indigo-900">เพิ่มศูนย์นำเข้าข้อมูล (Data Hub - Excel/CSV/CAD), ซิงก์คลาวด์ Google Sheets & LINE Alert, บาร์โค้ด SKU ไร้สาย และ Display Scale</td>
                      <td className="py-1 px-2.5 text-indigo-900 font-semibold">ฝ่ายควบคุมระบบสารสนเทศ</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Compliance Sign-off */}
            <div className="pt-2">
              <div className="p-3 rounded border border-slate-300 bg-slate-50 text-[10px] space-y-2">
                <div className="font-bold text-slate-900 text-[10.5px]">การรับรองและบังคับใช้เอกสาร (Policy Compliance Statement):</div>
                <p className="text-slate-600 leading-relaxed">
                  เอกสารคู่มือมาตรฐานการปฏิบัติงานฉบับนี้ มีผลบังคับใช้กับพนักงานทุกระดับในสายงานจัดซื้อ วิศวกรรม และคลังสินค้า 
                  โดยการแก้ไขเปลี่ยนแปลงสาระสำคัญใดๆ จะต้องได้รับความเห็นชอบจากคณะกรรมการบริหารงานจัดซื้อและฝ่ายควบคุมคุณภาพก่อนทุกครั้ง
                </p>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-slate-500 text-[9.5px]">
                  <span>ประทับตรารับรองเอกสารควบคุมระบบคุณภาพ (ISO 9001:2015 Compliant)</span>
                  <span className="font-bold text-slate-700">ฝ่ายควบคุมกระบวนการและระบบสารสนเทศ</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Running Footer */}
        <div className="pt-4 border-t border-slate-300 flex justify-between items-center text-[9.5px] text-slate-500">
          <div>เอกสารควบคุมภายใน (Internal Controlled Document) - บริษัท พรอคเคียวซิงค์ คอนสตรัคชั่น แอนด์ เอ็นจิเนียริ่ง จำกัด</div>
          <div className="font-mono font-bold text-slate-700">หน้า 8 จาก 8 (สิ้นสุดเอกสาร)</div>
        </div>
      </div>

    </div>
  );
}
