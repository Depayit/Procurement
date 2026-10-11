import React from 'react';
import { PurchaseRequest } from '../types';
import { bahtText } from '../lib/bahtText';
import { cn } from '../lib/utils';
import { CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface StandardPRDocumentProps {
  pr: PurchaseRequest;
  id?: string;
  className?: string;
  showSignatureDetails?: boolean;
}

/**
 * Standard Corporate Purchase Requisition (PR) Document.
 * Designed strictly to standard A4 paper dimensions (210mm x 297mm / 794px width at 96 DPI).
 * Uses Sarabun for Thai language and Inter for English / numbers as official document typography.
 * Layout uses structured table matrices with balanced bilingual labels to prevent awkward line breaks.
 */
export function StandardPRDocument({ 
  pr, 
  id = 'standard-pr-doc',
  className,
  showSignatureDetails = true
}: StandardPRDocumentProps) {
  const { isThai } = useLanguage();

  // Financial calculations
  const items = pr.items || [];
  const rawSubtotal = items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0);
  const includeVat = pr.includeVat ?? true;
  const vatAmount = pr.vatAmount ?? (includeVat ? rawSubtotal * 0.07 : 0);
  const grandTotal = pr.totalAmount || (rawSubtotal + vatAmount);
  const thaiBahtWords = bahtText(grandTotal);

  const urgencyLabels: Record<string, { label: string; enLabel: string; color: string; badgeBg: string }> = {
    normal: { label: 'ปกติ', enLabel: 'Normal', color: 'border-slate-400 text-slate-800', badgeBg: 'bg-slate-50' },
    urgent: { label: 'ด่วน', enLabel: 'Urgent', color: 'border-amber-500 text-amber-900 font-bold', badgeBg: 'bg-amber-50' },
    emergency: { label: 'ด่วนที่สุด', enLabel: 'Emergency', color: 'border-red-600 text-red-900 font-bold', badgeBg: 'bg-red-50' },
  };

  const currentUrgency = urgencyLabels[pr.urgency || 'normal'] || urgencyLabels.normal;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(isThai ? 'th-TH' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div 
      id={id}
      className={cn(
        "standard-a4-doc bg-white text-slate-900 mx-auto select-text",
        "w-[794px] min-h-[1123px] p-8 shadow-md border border-slate-300",
        "print:w-full print:min-h-0 print:border-none print:shadow-none print:p-0 print:m-0",
        className
      )}
      style={{
        boxSizing: 'border-box',
        colorScheme: 'light',
        fontFamily: "'Sarabun', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        lineHeight: 1.45,
        wordBreak: 'normal',
        overflowWrap: 'break-word',
      }}
    >
      {/* 1. Header: Corporate Details + Official Title Box */}
      <div className="border-b-2 border-slate-800 pb-3 mb-3">
        <div className="flex justify-between items-start gap-4">
          {/* Company Branding */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded bg-indigo-700 text-white flex items-center justify-center font-bold text-xl flex-shrink-0 border border-indigo-900 shadow-xs font-mono">
              PS
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-[15px] font-bold text-slate-900 leading-snug tracking-normal">
                บริษัท พรอคเคียวซิงค์ คอนสตรัคชั่น แอนด์ เอ็นจิเนียริ่ง จำกัด
              </h1>
              <p className="text-[11px] text-slate-600 font-bold tracking-wider uppercase mt-0.5">
                PROCURESYNC CONSTRUCTION & ENGINEERING CO., LTD.
              </p>
              <p className="text-[10.5px] text-slate-500 mt-1 leading-relaxed">
                888 อาคารเอ็มไพร์ทาวเวอร์ ชั้น 24 ถนนสาทรใต้ แขวงยานนาวา เขตสาทร กรุงเทพฯ 10120
              </p>
              <p className="text-[10.5px] text-slate-500 leading-relaxed mt-0.5">
                เลขประจำตัวผู้เสียภาษี: <span className="font-semibold text-slate-700 font-mono">0105566012345</span> | โทร: 02-123-4567 | อีเมล: pr@procuresync.co.th
              </p>
            </div>
          </div>

          {/* Document Title & Meta Box */}
          <div className="text-right flex flex-col items-end flex-shrink-0 w-64">
            <div className="w-full bg-slate-900 text-white py-1 px-2.5 rounded-t text-center tracking-wider font-bold text-xs uppercase">
              ใบขอซื้อ / PURCHASE REQUISITION
            </div>
            <div className="w-full border-x border-b border-slate-400 bg-slate-50/70 p-2 rounded-b text-xs space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-slate-600 text-[11px]">เลขที่เอกสาร:</span>
                <span className="font-bold text-indigo-700 font-mono text-sm">{pr.prNumber}</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-slate-200 pt-1">
                <span className="text-slate-600 text-[11px]">วันที่ขอซื้อ:</span>
                <span className="font-semibold text-slate-800 text-[11.5px]">{formatDate(pr.requestDate)}</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-slate-200 pt-1">
                <span className="text-slate-600 text-[11px]">วันที่ต้องการสินค้า:</span>
                <span className="font-semibold text-slate-800 text-[11.5px]">{formatDate(pr.requiredDate || pr.requestDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Document Information Matrix: Structured 4-column Table Matrix (130px + 235px + 130px + 235px = 730px) */}
      <div className="border border-slate-700 rounded-none mb-3 overflow-hidden bg-white text-xs">
        <table className="w-full border-collapse table-fixed text-left">
          <tbody>
            {/* Row 1: Project & Urgency */}
            <tr className="border-b border-slate-300">
              <th className="w-[130px] py-1.5 px-2.5 bg-slate-100/70 border-r border-slate-300 align-middle">
                <span className="block font-bold text-slate-800 text-[11px] leading-tight">โครงการ / ไซต์งาน</span>
                <span className="block font-normal text-slate-500 text-[9.5px] leading-tight mt-0.5">Project / Site</span>
              </th>
              <td className="w-[235px] py-1.5 px-2.5 font-bold text-slate-900 border-r border-slate-300 align-middle leading-snug">
                {pr.department}
              </td>
              <th className="w-[130px] py-1.5 px-2.5 bg-slate-100/70 border-r border-slate-300 align-middle">
                <span className="block font-bold text-slate-800 text-[11px] leading-tight">ระดับความเร่งด่วน</span>
                <span className="block font-normal text-slate-500 text-[9.5px] leading-tight mt-0.5">Urgency Level</span>
              </th>
              <td className="w-[235px] py-1.5 px-2.5 align-middle">
                <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-semibold", currentUrgency.color, currentUrgency.badgeBg)}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {currentUrgency.label} ({currentUrgency.enLabel})
                </span>
              </td>
            </tr>

            {/* Row 2: Project Code & Delivery Location */}
            <tr className="border-b border-slate-300">
              <th className="py-1.5 px-2.5 bg-slate-100/70 border-r border-slate-300 align-middle">
                <span className="block font-bold text-slate-800 text-[11px] leading-tight">รหัสโครงการ</span>
                <span className="block font-normal text-slate-500 text-[9.5px] leading-tight mt-0.5">Project Code / Cost Center</span>
              </th>
              <td className="py-1.5 px-2.5 font-mono text-slate-900 font-bold border-r border-slate-300 align-middle">
                {pr.projectCode || 'PRJ-MAIN-01'}
              </td>
              <th className="py-1.5 px-2.5 bg-slate-100/70 border-r border-slate-300 align-middle">
                <span className="block font-bold text-slate-800 text-[11px] leading-tight">สถานที่จัดส่ง</span>
                <span className="block font-normal text-slate-500 text-[9.5px] leading-tight mt-0.5">Delivery Location</span>
              </th>
              <td className="py-1.5 px-2.5 font-medium text-slate-800 align-middle leading-snug">
                {pr.deliveryLocation || `หน้างาน ${pr.department}`}
              </td>
            </tr>

            {/* Row 3: Requester & Suggested Vendor */}
            <tr className="border-b border-slate-300">
              <th className="py-1.5 px-2.5 bg-slate-100/70 border-r border-slate-300 align-middle">
                <span className="block font-bold text-slate-800 text-[11px] leading-tight">ผู้ขอซื้อ</span>
                <span className="block font-normal text-slate-500 text-[9.5px] leading-tight mt-0.5">Requested By</span>
              </th>
              <td className="py-1.5 px-2.5 font-semibold text-slate-900 border-r border-slate-300 align-middle leading-snug">
                {pr.requesterName}
                {pr.requesterPosition && (
                  <span className="text-slate-500 font-normal ml-1">({pr.requesterPosition})</span>
                )}
              </td>
              <th className="py-1.5 px-2.5 bg-slate-100/70 border-r border-slate-300 align-middle">
                <span className="block font-bold text-slate-800 text-[11px] leading-tight">ร้านค้าที่แนะนำ</span>
                <span className="block font-normal text-slate-500 text-[9.5px] leading-tight mt-0.5">Suggested Vendor</span>
              </th>
              <td className="py-1.5 px-2.5 text-slate-800 align-middle leading-snug">
                {pr.suggestedVendor || '-'}
              </td>
            </tr>

            {/* Row 4: Contact Phone & Document Status */}
            <tr className="border-b border-slate-300">
              <th className="py-1.5 px-2.5 bg-slate-100/70 border-r border-slate-300 align-middle">
                <span className="block font-bold text-slate-800 text-[11px] leading-tight">เบอร์โทรติดต่อ</span>
                <span className="block font-normal text-slate-500 text-[9.5px] leading-tight mt-0.5">Contact Phone</span>
              </th>
              <td className="py-1.5 px-2.5 font-mono text-slate-800 border-r border-slate-300 align-middle">
                {pr.contactPhone || '089-123-4567'}
              </td>
              <th className="py-1.5 px-2.5 bg-slate-100/70 border-r border-slate-300 align-middle">
                <span className="block font-bold text-slate-800 text-[11px] leading-tight">สถานะเอกสาร</span>
                <span className="block font-normal text-slate-500 text-[9.5px] leading-tight mt-0.5">Document Status</span>
              </th>
              <td className="py-1.5 px-2.5 align-middle">
                <span className="inline-block px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded text-[11px]">
                  {pr.status}
                </span>
              </td>
            </tr>

            {/* Row 5: Full Justification Spanning Across All Columns */}
            <tr className="bg-slate-50/40">
              <th className="py-2 px-2.5 bg-slate-100/70 border-r border-slate-300 align-middle">
                <span className="block font-bold text-slate-800 text-[11px] leading-tight">วัตถุประสงค์ / เหตุผล</span>
                <span className="block font-normal text-slate-500 text-[9.5px] leading-tight mt-0.5">Purpose & Justification</span>
              </th>
              <td colSpan={3} className="py-2 px-2.5 font-medium text-slate-900 align-middle leading-relaxed text-xs">
                {pr.justification || 'จัดซื้อวัสดุอุปกรณ์ตามแผนดำเนินงานโครงการเพื่อใช้ในงานก่อสร้าง'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 3. Items Table: 34 + 80 + 256 + 54 + 46 + 84 + 96 + 80 = 730px exact */}
      <div className="border border-slate-700 mb-3 overflow-hidden bg-white">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-700 text-xs font-bold text-slate-800">
              <th className="py-2 px-1 border-r border-slate-300 w-[34px] text-center">
                <span className="block leading-tight">ลำดับ</span>
                <span className="block text-[9px] font-normal text-slate-500 leading-tight">No.</span>
              </th>
              <th className="py-2 px-2 border-r border-slate-300 w-[80px] text-left">
                <span className="block leading-tight">รหัสพัสดุ</span>
                <span className="block text-[9px] font-normal text-slate-500 leading-tight">Item Code</span>
              </th>
              <th className="py-2 px-2.5 border-r border-slate-300 w-[256px] text-left">
                <span className="block leading-tight">รายการและคุณลักษณะเฉพาะ</span>
                <span className="block text-[9px] font-normal text-slate-500 leading-tight">Description & Specification</span>
              </th>
              <th className="py-2 px-1.5 border-r border-slate-300 w-[54px] text-right">
                <span className="block leading-tight">จำนวน</span>
                <span className="block text-[9px] font-normal text-slate-500 leading-tight">Qty</span>
              </th>
              <th className="py-2 px-1 border-r border-slate-300 w-[46px] text-center">
                <span className="block leading-tight">หน่วย</span>
                <span className="block text-[9px] font-normal text-slate-500 leading-tight">Unit</span>
              </th>
              <th className="py-2 px-2 border-r border-slate-300 w-[84px] text-right">
                <span className="block leading-tight">ราคา/หน่วย</span>
                <span className="block text-[9px] font-normal text-slate-500 leading-tight">Unit Price</span>
              </th>
              <th className="py-2 px-2 border-r border-slate-300 w-[96px] text-right">
                <span className="block leading-tight">จำนวนเงิน</span>
                <span className="block text-[9px] font-normal text-slate-500 leading-tight">Amount</span>
              </th>
              <th className="py-2 px-2 w-[80px] text-left">
                <span className="block leading-tight">หมายเหตุ</span>
                <span className="block text-[9px] font-normal text-slate-500 leading-tight">Remark</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300 text-xs">
            {items.map((item, idx) => {
              const lineTotal = Number(item.quantity || 0) * Number(item.unitPrice || 0);
              return (
                <tr key={item.id || idx} className="min-h-[38px] hover:bg-slate-50/50 transition-colors">
                  <td className="py-2 px-1 border-r border-slate-300 text-center font-medium text-slate-600 align-top">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-2 border-r border-slate-300 font-mono text-[11px] text-slate-700 align-top">
                    {item.itemCode || `ITM-${String(idx + 1).padStart(3, '0')}`}
                  </td>
                  <td className="py-2 px-2.5 border-r border-slate-300 align-top">
                    <div className="font-bold text-slate-900 leading-snug">
                      {item.description}
                    </div>
                    {item.specification && (
                      <div className="text-[11px] text-slate-600 leading-normal mt-0.5">
                        {item.specification}
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-1.5 border-r border-slate-300 text-right font-semibold text-slate-900 font-mono tabular-nums whitespace-nowrap align-top">
                    {Number(item.quantity).toLocaleString()}
                  </td>
                  <td className="py-2 px-1 border-r border-slate-300 text-center text-slate-700 align-top whitespace-nowrap">
                    {item.unit}
                  </td>
                  <td className="py-2 px-2 border-r border-slate-300 text-right font-mono tabular-nums text-slate-800 whitespace-nowrap align-top">
                    {Number(item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-2 border-r border-slate-300 text-right font-bold font-mono tabular-nums text-slate-900 whitespace-nowrap align-top">
                    {lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-2 text-[11px] text-slate-600 leading-snug align-top">
                    {item.remark || '-'}
                  </td>
                </tr>
              );
            })}

            {/* Filler rows to guarantee formal document proportions */}
            {items.length < 4 && Array.from({ length: 4 - items.length }).map((_, fIdx) => (
              <tr key={`filler-${fIdx}`} className="h-7 text-slate-400">
                <td className="border-r border-slate-300 text-center text-[10px]">{items.length + fIdx + 1}</td>
                <td className="border-r border-slate-300"></td>
                <td className="border-r border-slate-300"></td>
                <td className="border-r border-slate-300"></td>
                <td className="border-r border-slate-300"></td>
                <td className="border-r border-slate-300"></td>
                <td className="border-r border-slate-300"></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Financial Calculations & Thai Baht Text Block */}
      <div className="border border-slate-700 mb-3 grid grid-cols-12 text-xs">
        {/* Left: Thai Baht in Words */}
        <div className="col-span-7 p-2.5 border-r border-slate-700 bg-slate-50/70 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
              จำนวนเงินรวมทั้งสิ้น (ตัวอักษร) / Thai Baht in Words:
            </div>
            <div className="mt-1.5 font-bold text-slate-900 text-xs sm:text-[13px] bg-white p-2 border border-slate-300 shadow-2xs leading-normal">
              ( {thaiBahtWords} )
            </div>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 leading-snug flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>* เอกสารขอซื้อภายใน (PR) นี้ผ่านการควบคุมต้นทุนและตรวจสอบตามระบบมาตรฐาน ISO 9001:2015</span>
          </div>
        </div>

        {/* Right: Subtotal, VAT, Grand Total */}
        <div className="col-span-5 divide-y divide-slate-300 bg-white flex flex-col justify-between">
          <div className="flex justify-between items-center py-1.5 px-3">
            <span className="text-slate-600 font-medium">รวมเป็นเงิน (Subtotal):</span>
            <span className="font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
              {rawSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
            </span>
          </div>
          <div className="flex justify-between items-center py-1.5 px-3">
            <span className="text-slate-600 font-medium">ภาษีมูลค่าเพิ่ม 7% (VAT):</span>
            <span className="font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
              {includeVat 
                ? `${vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท`
                : 'ไม่รวมภาษีมูลค่าเพิ่ม'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 px-3 bg-slate-100 border-t-2 border-slate-400">
            <span className="font-bold text-slate-900 text-xs sm:text-sm">ยอดเงินสุทธิ (Grand Total):</span>
            <span className="font-mono font-black text-slate-950 text-base tabular-nums whitespace-nowrap border-b-2 border-double border-slate-900 pb-0.5">
              {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
            </span>
          </div>
        </div>
      </div>

      {/* 5. Official 4-Column Approval Matrix */}
      {showSignatureDetails && (
        <div className="border border-slate-700 mb-3 text-center text-xs">
          <div className="bg-slate-100 border-b border-slate-700 py-1 font-bold text-slate-800 uppercase tracking-wide text-[11px]">
            การตรวจสอบและอนุมัติ (APPROVAL MATRIX)
          </div>
          <div className="grid grid-cols-4 divide-x divide-slate-400">
            {/* Box 1: ผู้ขอซื้อ */}
            <div className="p-2.5 flex flex-col justify-between min-h-[115px]">
              <div>
                <div className="font-bold text-slate-800 text-[11px]">ผู้ขอซื้อ</div>
                <div className="text-[9.5px] text-slate-500 font-normal">Requested By</div>
              </div>
              <div className="my-auto py-1">
                <div className="font-semibold text-slate-900 leading-tight">
                  {pr.requesterName}
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5 leading-tight">
                  {pr.requesterPosition || 'วิศวกรควบคุมงาน'}
                </div>
              </div>
              <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-1 mt-auto">
                วันที่: {formatDate(pr.requestDate)}
              </div>
            </div>

            {/* Box 2: ผู้ตรวจสอบทางเทคนิค */}
            <div className="p-2.5 flex flex-col justify-between min-h-[115px]">
              <div>
                <div className="font-bold text-slate-800 text-[11px]">ผู้ตรวจสอบ</div>
                <div className="text-[9.5px] text-slate-500 font-normal">Technical Checked By</div>
              </div>
              <div className="my-auto py-1">
                <div className="font-semibold text-slate-900 leading-tight">
                  {pr.signatures?.checkedBy?.name || 'วิศวกรโครงการ / PM'}
                </div>
                <div className="text-[10px] text-slate-600 mt-1">
                  {pr.signatures?.checkedBy?.signed ? (
                    <span className="text-emerald-700 font-bold inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ตรวจสอบแล้ว
                    </span>
                  ) : (
                    <span className="text-slate-300 font-mono tracking-widest text-[11px]">..............................</span>
                  )}
                </div>
              </div>
              <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-1 mt-auto">
                วันที่: {pr.signatures?.checkedBy?.date ? formatDate(pr.signatures.checkedBy.date) : '....../....../......'}
              </div>
            </div>

            {/* Box 3: ผู้ตรวจสอบงบประมาณ */}
            <div className="p-2.5 flex flex-col justify-between min-h-[115px]">
              <div>
                <div className="font-bold text-slate-800 text-[11px]">ตรวจสอบงบประมาณ</div>
                <div className="text-[9.5px] text-slate-500 font-normal">Budget / Cost Control</div>
              </div>
              <div className="my-auto py-1">
                <div className="font-semibold text-slate-900 leading-tight">
                  {pr.signatures?.budgetCheckedBy?.name || 'ฝ่ายควบคุมต้นทุน / จัดซื้อ'}
                </div>
                <div className="text-[10px] text-slate-600 mt-1">
                  {pr.signatures?.budgetCheckedBy?.signed ? (
                    <span className="text-emerald-700 font-bold inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ในงบประมาณ BOQ
                    </span>
                  ) : (
                    <span className="text-slate-300 font-mono tracking-widest text-[11px]">..............................</span>
                  )}
                </div>
              </div>
              <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-1 mt-auto">
                วันที่: {pr.signatures?.budgetCheckedBy?.date ? formatDate(pr.signatures.budgetCheckedBy.date) : '....../....../......'}
              </div>
            </div>

            {/* Box 4: ผู้อนุมัติ */}
            <div className="p-2.5 flex flex-col justify-between min-h-[115px] bg-slate-50/50">
              <div>
                <div className="font-bold text-slate-900 text-[11px]">ผู้อนุมัติ</div>
                <div className="text-[9.5px] text-slate-500 font-normal">Approved By</div>
              </div>
              <div className="my-auto py-1">
                <div className="font-bold text-slate-900 leading-tight">
                  {pr.signatures?.approvedBy?.name || 'ผู้อำนวยการโครงการ / MD'}
                </div>
                <div className="text-[10px] text-slate-600 mt-1">
                  {pr.status === 'Approved' || pr.status === 'PO Created' ? (
                    <span className="text-emerald-800 font-bold inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> อนุมัติจัดซื้อแล้ว
                    </span>
                  ) : pr.status === 'Rejected' ? (
                    <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-300 inline-flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-red-500" /> ปฏิเสธคำขอ
                    </span>
                  ) : (
                    <span className="text-slate-300 font-mono tracking-widest text-[11px]">..............................</span>
                  )}
                </div>
              </div>
              <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-1 mt-auto">
                วันที่: {pr.signatures?.approvedBy?.date ? formatDate(pr.signatures.approvedBy.date) : '....../....../......'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Document Footer: Timestamp, Page No, Document Code */}
      <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-300">
        <div className="truncate max-w-[340px]">
          พิมพ์เมื่อ: {new Date().toLocaleString(isThai ? 'th-TH' : 'en-US')} | ระบบจัดซื้อ ProcureSync ERP
        </div>
        <div className="font-semibold text-slate-600">
          หน้า 1 จาก 1 (Page 1 of 1)
        </div>
        <div className="font-mono text-slate-600 text-right">
          DOC ID: {pr.prNumber} | FM-PUR-001 (Rev. 03)
        </div>
      </div>
    </div>
  );
}
