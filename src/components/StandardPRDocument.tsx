import React from 'react';
import { PurchaseRequest, ApprovalMatrixStep } from '../types';
import { bahtText } from '../lib/bahtText';
import { cn } from '../lib/utils';
import { ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useProcurement } from '../contexts/ProcurementContext';
import { ApprovalMatrixDocumentTable } from './ApprovalMatrixDocumentTable';

interface StandardPRDocumentProps {
  pr: PurchaseRequest;
  id?: string;
  className?: string;
  showSignatureDetails?: boolean;
  matrixSteps?: ApprovalMatrixStep[];
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
  showSignatureDetails = true,
  matrixSteps
}: StandardPRDocumentProps) {
  const { isThai } = useLanguage();
  const { approvalMatrix, companyProfile } = useProcurement();

  // Financial calculations
  const items = pr.items || [];
  const rawSubtotal = items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0);
  const includeVat = pr.includeVat ?? true;
  const vatAmount = pr.vatAmount ?? (includeVat ? rawSubtotal * 0.07 : 0);
  const grandTotal = pr.totalAmount || (rawSubtotal + vatAmount);
  const thaiBahtWords = bahtText(grandTotal);

  const urgencyLabels: Record<string, { label: string; enLabel: string }> = {
    normal: { label: 'ปกติ', enLabel: 'Normal' },
    urgent: { label: 'ด่วน', enLabel: 'Urgent' },
    emergency: { label: 'ด่วนที่สุด', enLabel: 'Emergency' },
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
        "standard-a4-doc bg-white text-black mx-auto select-text",
        "w-[794px] min-h-[1123px] p-8 shadow-none border-2 border-black",
        "print:w-full print:min-h-0 print:border-none print:shadow-none print:p-0 print:m-0",
        className
      )}
      style={{
        boxSizing: 'border-box',
        colorScheme: 'light',
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: "'Sarabun', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        lineHeight: 1.45,
        wordBreak: 'normal',
        overflowWrap: 'break-word',
      }}
    >
      {/* 1. Header: Corporate Details + Official Title Box */}
      <div className="border-b-2 border-black pb-3 mb-3 bg-white">
        <div className="flex justify-between items-start gap-4">
          {/* Company Branding */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {companyProfile?.logoUrl ? (
              <div className="w-14 h-14 rounded-none bg-white flex items-center justify-center flex-shrink-0 border-2 border-black p-1 overflow-hidden">
                <img 
                  src={companyProfile.logoUrl} 
                  alt="Company Logo" 
                  className="max-h-full max-w-full object-contain" 
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-none bg-white text-black flex items-center justify-center font-bold text-xl flex-shrink-0 border-2 border-black font-mono">
                PS
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-[15px] font-bold text-black leading-snug tracking-normal">
                {companyProfile?.nameTh || 'บริษัท พรอคเคียวซิงค์ คอนสตรัคชั่น แอนด์ เอ็นจิเนียริ่ง จำกัด'}
              </h1>
              <p className="text-[11px] text-black font-bold tracking-wider uppercase mt-0.5">
                {companyProfile?.nameEn || 'PROCURESYNC CONSTRUCTION & ENGINEERING CO., LTD.'}
              </p>
              <p className="text-[10.5px] text-black mt-1 leading-relaxed">
                {companyProfile?.address || '888 อาคารเอ็มไพร์ทาวเวอร์ ชั้น 24 ถนนสาทรใต้ แขวงยานนาวา เขตสาทร กรุงเทพฯ 10120'}
              </p>
              <p className="text-[10.5px] text-black leading-relaxed mt-0.5">
                เลขประจำตัวผู้เสียภาษี: <span className="font-semibold text-black font-mono">{companyProfile?.taxId || '0105566012345'}</span> | โทร: {companyProfile?.phone || '02-123-4567'} | อีเมล: {companyProfile?.email || 'pr@procuresync.co.th'}
              </p>
            </div>
          </div>

          {/* Document Title & Meta Box */}
          <div className="text-right flex flex-col items-end flex-shrink-0 w-64">
            <div className="w-full bg-white border-2 border-black text-black py-1 px-2.5 rounded-none text-center tracking-wider font-bold text-xs uppercase">
              ใบขอซื้อ / PURCHASE REQUISITION
            </div>
            <div className="w-full border-x-2 border-b-2 border-black bg-white p-2 text-xs space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-black text-[11px]">เลขที่เอกสาร:</span>
                <span className="font-bold text-black font-mono text-sm">{pr.prNumber}</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-black pt-1">
                <span className="text-black text-[11px]">วันที่ขอซื้อ:</span>
                <span className="font-semibold text-black text-[11.5px]">{formatDate(pr.requestDate)}</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-black pt-1">
                <span className="text-black text-[11px]">วันที่ต้องการสินค้า:</span>
                <span className="font-semibold text-black text-[11.5px]">{formatDate(pr.requiredDate || pr.requestDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Document Information Matrix: Structured 4-column Table Matrix */}
      <div className="border-2 border-black rounded-none mb-3 overflow-hidden bg-white text-xs">
        <table className="w-full border-collapse table-fixed text-left bg-white">
          <tbody>
            {/* Row 1: Project & Urgency */}
            <tr className="border-b border-black">
              <th className="w-[130px] py-1.5 px-2.5 bg-white border-r border-black align-middle text-black">
                <span className="block font-bold text-black text-[11px] leading-tight">โครงการ / ไซต์งาน</span>
                <span className="block font-normal text-black text-[9.5px] leading-tight mt-0.5">Project / Site</span>
              </th>
              <td className="w-[235px] py-1.5 px-2.5 font-bold text-black border-r border-black align-middle leading-snug">
                {pr.department}
              </td>
              <th className="w-[130px] py-1.5 px-2.5 bg-white border-r border-black align-middle text-black">
                <span className="block font-bold text-black text-[11px] leading-tight">ระดับความเร่งด่วน</span>
                <span className="block font-normal text-black text-[9.5px] leading-tight mt-0.5">Urgency Level</span>
              </th>
              <td className="w-[235px] py-1.5 px-2.5 align-middle">
                <span className="inline-flex items-center px-2 py-0.5 border border-black bg-white text-black font-bold text-[11px]">
                  {currentUrgency.label} ({currentUrgency.enLabel})
                </span>
              </td>
            </tr>

            {/* Row 2: Project Code & Delivery Location */}
            <tr className="border-b border-black">
              <th className="py-1.5 px-2.5 bg-white border-r border-black align-middle text-black">
                <span className="block font-bold text-black text-[11px] leading-tight">รหัสโครงการ</span>
                <span className="block font-normal text-black text-[9.5px] leading-tight mt-0.5">Project Code / Cost Center</span>
              </th>
              <td className="py-1.5 px-2.5 font-mono text-black font-bold border-r border-black align-middle">
                {pr.projectCode || 'PRJ-MAIN-01'}
              </td>
              <th className="py-1.5 px-2.5 bg-white border-r border-black align-middle text-black">
                <span className="block font-bold text-black text-[11px] leading-tight">สถานที่จัดส่ง</span>
                <span className="block font-normal text-black text-[9.5px] leading-tight mt-0.5">Delivery Location</span>
              </th>
              <td className="py-1.5 px-2.5 font-medium text-black align-middle leading-snug">
                {pr.deliveryLocation || `หน้างาน ${pr.department}`}
              </td>
            </tr>

            {/* Row 3: Requester & Suggested Vendor */}
            <tr className="border-b border-black">
              <th className="py-1.5 px-2.5 bg-white border-r border-black align-middle text-black">
                <span className="block font-bold text-black text-[11px] leading-tight">ผู้ขอซื้อ</span>
                <span className="block font-normal text-black text-[9.5px] leading-tight mt-0.5">Requested By</span>
              </th>
              <td className="py-1.5 px-2.5 font-semibold text-black border-r border-black align-middle leading-snug">
                {pr.requesterName}
                {pr.requesterPosition && (
                  <span className="text-black font-normal ml-1">({pr.requesterPosition})</span>
                )}
              </td>
              <th className="py-1.5 px-2.5 bg-white border-r border-black align-middle text-black">
                <span className="block font-bold text-black text-[11px] leading-tight">ร้านค้าที่แนะนำ</span>
                <span className="block font-normal text-black text-[9.5px] leading-tight mt-0.5">Suggested Vendor</span>
              </th>
              <td className="py-1.5 px-2.5 text-black align-middle leading-snug">
                {pr.suggestedVendor || '-'}
              </td>
            </tr>

            {/* Row 4: Contact Phone & Document Status */}
            <tr className="border-b border-black">
              <th className="py-1.5 px-2.5 bg-white border-r border-black align-middle text-black">
                <span className="block font-bold text-black text-[11px] leading-tight">เบอร์โทรติดต่อ</span>
                <span className="block font-normal text-black text-[9.5px] leading-tight mt-0.5">Contact Phone</span>
              </th>
              <td className="py-1.5 px-2.5 font-mono text-black border-r border-black align-middle">
                {pr.contactPhone || '089-123-4567'}
              </td>
              <th className="py-1.5 px-2.5 bg-white border-r border-black align-middle text-black">
                <span className="block font-bold text-black text-[11px] leading-tight">สถานะเอกสาร</span>
                <span className="block font-normal text-black text-[9.5px] leading-tight mt-0.5">Document Status</span>
              </th>
              <td className="py-1.5 px-2.5 align-middle">
                {pr.status === 'Approved' ? (
                  <span className="stamp-approved inline-flex items-center gap-1 px-2 py-0.5 border border-emerald-600 bg-emerald-50 text-emerald-700 font-bold rounded-none text-[10.5px]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> อนุมัติแล้ว (Approved)
                  </span>
                ) : pr.status === 'Rejected' ? (
                  <span className="stamp-rejected inline-flex items-center gap-1 px-2 py-0.5 border border-red-600 bg-red-50 text-red-700 font-bold rounded-none text-[10.5px]">
                    <AlertCircle className="w-3 h-3 text-red-600" /> ไม่อนุมัติ (Rejected)
                  </span>
                ) : (
                  <span className="stamp-pending inline-flex items-center gap-1 px-2 py-0.5 border border-amber-600 bg-amber-50 text-amber-700 font-bold rounded-none text-[10.5px]">
                    {pr.status}
                  </span>
                )}
              </td>
            </tr>

            {/* Row 5: Full Justification Spanning Across All Columns */}
            <tr>
              <th className="py-2 px-2.5 bg-white border-r border-black align-middle text-black">
                <span className="block font-bold text-black text-[11px] leading-tight">วัตถุประสงค์ / เหตุผล</span>
                <span className="block font-normal text-black text-[9.5px] leading-tight mt-0.5">Purpose & Justification</span>
              </th>
              <td colSpan={3} className="py-2 px-2.5 font-medium text-black align-middle leading-relaxed text-xs">
                {pr.justification || 'จัดซื้อวัสดุอุปกรณ์ตามแผนดำเนินงานโครงการเพื่อใช้ในงานก่อสร้าง'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 3. Items Table */}
      <div className="border-2 border-black mb-3 overflow-hidden bg-white">
        <table className="w-full text-left border-collapse table-fixed bg-white">
          <thead>
            <tr className="bg-white border-b-2 border-black text-xs font-bold text-black">
              <th className="py-2 px-1 border-r border-black w-[34px] text-center text-black">
                <span className="block leading-tight">ลำดับ</span>
                <span className="block text-[9px] font-normal leading-tight">No.</span>
              </th>
              <th className="py-2 px-2 border-r border-black w-[80px] text-left text-black">
                <span className="block leading-tight">รหัสพัสดุ</span>
                <span className="block text-[9px] font-normal leading-tight">Item Code</span>
              </th>
              <th className="py-2 px-2.5 border-r border-black w-[256px] text-left text-black">
                <span className="block leading-tight">รายการและคุณลักษณะเฉพาะ</span>
                <span className="block text-[9px] font-normal leading-tight">Description & Specification</span>
              </th>
              <th className="py-2 px-1.5 border-r border-black w-[54px] text-right text-black">
                <span className="block leading-tight">จำนวน</span>
                <span className="block text-[9px] font-normal leading-tight">Qty</span>
              </th>
              <th className="py-2 px-1 border-r border-black w-[46px] text-center text-black">
                <span className="block leading-tight">หน่วย</span>
                <span className="block text-[9px] font-normal leading-tight">Unit</span>
              </th>
              <th className="py-2 px-2 border-r border-black w-[84px] text-right text-black">
                <span className="block leading-tight">ราคา/หน่วย</span>
                <span className="block text-[9px] font-normal leading-tight">Unit Price</span>
              </th>
              <th className="py-2 px-2 border-r border-black w-[96px] text-right text-black">
                <span className="block leading-tight">จำนวนเงิน</span>
                <span className="block text-[9px] font-normal leading-tight">Amount</span>
              </th>
              <th className="py-2 px-2 w-[80px] text-left text-black">
                <span className="block leading-tight">หมายเหตุ</span>
                <span className="block text-[9px] font-normal leading-tight">Remark</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black text-xs bg-white text-black">
            {items.map((item, idx) => {
              const lineTotal = Number(item.quantity || 0) * Number(item.unitPrice || 0);
              return (
                <tr key={item.id || idx} className="min-h-[38px] bg-white">
                  <td className="py-2 px-1 border-r border-black text-center font-medium text-black align-top">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-2 border-r border-black font-mono text-[11px] text-black align-top">
                    {item.itemCode || `ITM-${String(idx + 1).padStart(3, '0')}`}
                  </td>
                  <td className="py-2 px-2.5 border-r border-black align-top">
                    <div className="font-bold text-black leading-snug">
                      {item.description}
                    </div>
                    {item.specification && (
                      <div className="text-[11px] text-black leading-normal mt-0.5">
                        {item.specification}
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-1.5 border-r border-black text-right font-semibold text-black font-mono tabular-nums whitespace-nowrap align-top">
                    {Number(item.quantity).toLocaleString()}
                  </td>
                  <td className="py-2 px-1 border-r border-black text-center text-black align-top whitespace-nowrap">
                    {item.unit}
                  </td>
                  <td className="py-2 px-2 border-r border-black text-right font-mono tabular-nums text-black whitespace-nowrap align-top">
                    {Number(item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-2 border-r border-black text-right font-bold font-mono tabular-nums text-black whitespace-nowrap align-top">
                    {lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-2 text-[11px] text-black leading-snug align-top">
                    {item.remark || '-'}
                  </td>
                </tr>
              );
            })}

            {/* Filler rows to guarantee formal document proportions */}
            {items.length < 4 && Array.from({ length: 4 - items.length }).map((_, fIdx) => (
              <tr key={`filler-${fIdx}`} className="h-7 text-black bg-white">
                <td className="border-r border-black text-center text-[10px]">{items.length + fIdx + 1}</td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Financial Calculations & Thai Baht Text Block */}
      <div className="border-2 border-black mb-3 grid grid-cols-12 text-xs bg-white text-black">
        {/* Left: Thai Baht in Words */}
        <div className="col-span-7 p-2.5 border-r-2 border-black bg-white flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold text-black uppercase tracking-wide">
              จำนวนเงินรวมทั้งสิ้น (ตัวอักษร) / Thai Baht in Words:
            </div>
            <div className="mt-1.5 font-bold text-black text-xs sm:text-[13px] bg-white p-2 border border-black leading-normal">
              ( {thaiBahtWords} )
            </div>
          </div>
          <div className="mt-2 text-[10px] text-black leading-snug flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-black shrink-0" />
            <span>* เอกสารขอซื้อภายใน (PR) นี้ผ่านการควบคุมต้นทุนและตรวจสอบตามระบบมาตรฐาน ISO 9001:2015</span>
          </div>
        </div>

        {/* Right: Subtotal, VAT, Grand Total */}
        <div className="col-span-5 divide-y divide-black bg-white flex flex-col justify-between text-black">
          <div className="flex justify-between items-center py-1.5 px-3 bg-white">
            <span className="text-black font-medium">รวมเป็นเงิน (Subtotal):</span>
            <span className="font-mono font-semibold text-black tabular-nums whitespace-nowrap">
              {rawSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
            </span>
          </div>
          <div className="flex justify-between items-center py-1.5 px-3 bg-white">
            <span className="text-black font-medium">ภาษีมูลค่าเพิ่ม 7% (VAT):</span>
            <span className="font-mono font-semibold text-black tabular-nums whitespace-nowrap">
              {includeVat 
                ? `${vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท`
                : 'ไม่รวมภาษีมูลค่าเพิ่ม'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 px-3 bg-white border-t-2 border-black">
            <span className="font-bold text-black text-xs sm:text-sm">ยอดเงินสุทธิ (Grand Total):</span>
            <span className="font-mono font-black text-black text-base tabular-nums whitespace-nowrap border-b-2 border-double border-black pb-0.5">
              {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
            </span>
          </div>
        </div>
      </div>

      {/* 5. Official Dynamic Approval Matrix */}
      {showSignatureDetails && (
        <ApprovalMatrixDocumentTable
          steps={matrixSteps || approvalMatrix}
          documentType="PR"
          documentTotalAmount={grandTotal}
          signatures={pr.signatures}
          isApproved={pr.status === 'Approved' || pr.status === 'PO Created'}
          isRejected={pr.status === 'Rejected'}
          fallbackRequester={{
            name: pr.requesterName,
            position: pr.requesterPosition || 'ผู้ขอซื้อ / วิศวกรโครงการ',
            date: pr.requestDate
          }}
        />
      )}

      {/* 6. Document Footer: Timestamp, Page No, Document Code */}
      <div className="flex justify-between items-center text-[10px] text-black pt-2 border-t-2 border-black bg-white">
        <div className="truncate max-w-[340px] text-black">
          พิมพ์เมื่อ: {new Date().toLocaleString(isThai ? 'th-TH' : 'en-US')} | ระบบจัดซื้อ ProcureSync ERP
        </div>
        <div className="font-semibold text-black">
          หน้า 1 จาก 1 (Page 1 of 1)
        </div>
        <div className="font-mono text-black text-right font-semibold">
          DOC ID: {pr.prNumber} | FM-PUR-001 (Rev. 03)
        </div>
      </div>
    </div>
  );
}
