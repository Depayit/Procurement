import React from 'react';
import { PurchaseOrder, ApprovalMatrixStep } from '../types';
import { bahtText } from '../lib/bahtText';
import { cn } from '../lib/utils';
import { ShieldCheck, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useProcurement } from '../contexts/ProcurementContext';
import { ApprovalMatrixDocumentTable } from './ApprovalMatrixDocumentTable';

interface StandardPODocumentProps {
  po: PurchaseOrder;
  id?: string;
  className?: string;
  showSignatureDetails?: boolean;
  matrixSteps?: ApprovalMatrixStep[];
}

/**
 * Standard Corporate Purchase Order (PO) Document.
 * Designed strictly to standard A4 paper dimensions (210mm x 297mm / 794px width at 96 DPI).
 * Uses Sarabun for Thai language and Inter for English / numbers as official document typography.
 * Strictly Monochrome: Pure White Background (#ffffff), Black text & borders (#000000).
 */
export function StandardPODocument({
  po,
  id = 'po-document-view',
  className,
  showSignatureDetails = true,
  matrixSteps
}: StandardPODocumentProps) {
  const { isThai } = useLanguage();
  const { approvalMatrix, companyProfile } = useProcurement();

  // Financial calculations
  const items = po.items || [];
  const rawSubtotal = items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0);
  const vatAmount = rawSubtotal * 0.07;
  const grandTotal = po.totalAmount || (rawSubtotal + vatAmount);
  const thaiBahtWords = bahtText(grandTotal);

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

  const statusLabels: Record<string, string> = {
    'Draft': 'แบบร่าง (Draft)',
    'Issued': 'ออกใบสั่งซื้อแล้ว (Issued)',
    'Partially Received': 'รับของบางส่วน (Partially Received)',
    'Completed': 'รับครบสมบูรณ์ (Completed)',
    'Cancelled': 'ยกเลิก (Cancelled)',
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
                เลขประจำตัวผู้เสียภาษี: <span className="font-semibold text-black font-mono">{companyProfile?.taxId || '0105566012345'}</span> | โทร: {companyProfile?.phone || '02-123-4567'} | อีเมล: {companyProfile?.email || 'po@procuresync.co.th'}
              </p>
            </div>
          </div>

          {/* Document Title & Meta Box */}
          <div className="text-right flex flex-col items-end flex-shrink-0 w-64">
            <div className="w-full bg-white border-2 border-black text-black py-1 px-2.5 rounded-none text-center tracking-wider font-bold text-xs uppercase">
              ใบสั่งซื้อ / PURCHASE ORDER (PO)
            </div>
            <div className="w-full border-x-2 border-b-2 border-black bg-white p-2 text-xs space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-black text-[11px]">เลขที่ใบสั่งซื้อ:</span>
                <span className="font-bold text-black font-mono text-sm">{po.poNumber}</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-black pt-1">
                <span className="text-black text-[11px]">วันที่ออกเอกสาร:</span>
                <span className="font-semibold text-black text-[11.5px]">{formatDate(po.date || po.orderDate)}</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-black pt-1">
                <span className="text-black text-[11px]">อ้างอิงใบขอซื้อ (PR):</span>
                <span className="font-mono font-semibold text-black text-[11.5px]">{po.prNumber || '-'}</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-black pt-1">
                <span className="text-black text-[11px]">กำหนดส่งมอบ:</span>
                <span className="font-semibold text-black text-[11.5px]">{formatDate(po.expectedDeliveryDate || po.date)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Document Information Matrix: Structured 4-column Table Matrix */}
      <div className="border-2 border-black rounded-none mb-3 overflow-hidden bg-white text-xs">
        <table className="w-full border-collapse table-fixed text-left bg-white">
          <tbody>
            {/* Row 1: Vendor & Project */}
            <tr className="border-b border-black">
              <th className="w-[130px] py-1.5 px-2.5 bg-white border-r border-black align-middle text-black">
                <span className="block font-bold text-black text-[11px] leading-tight">ผู้ขาย / คู่ค้า</span>
                <span className="block font-normal text-black text-[9.5px] leading-tight mt-0.5">Vendor / Supplier</span>
              </th>
              <td className="w-[235px] py-1.5 px-2.5 font-bold text-black border-r border-black align-middle leading-snug">
                {po.vendorName}
              </td>
              <th className="w-[130px] py-1.5 px-2.5 bg-white border-r border-black align-middle text-black">
                <span className="block font-bold text-black text-[11px] leading-tight">โครงการ / ไซต์งาน</span>
                <span className="block font-normal text-black text-[9.5px] leading-tight mt-0.5">Project / Site</span>
              </th>
              <td className="w-[235px] py-1.5 px-2.5 font-bold text-black align-middle leading-snug">
                {po.department || 'โครงการหลัก (สำนักงานใหญ่)'}
              </td>
            </tr>

            {/* Row 2: Payment Terms & Delivery Location */}
            <tr className="border-b border-black">
              <th className="py-1.5 px-2.5 bg-white border-r border-black align-middle text-black">
                <span className="block font-bold text-black text-[11px] leading-tight">เงื่อนไขการชำระเงิน</span>
                <span className="block font-normal text-black text-[9.5px] leading-tight mt-0.5">Payment Terms</span>
              </th>
              <td className="py-1.5 px-2.5 font-semibold text-black border-r border-black align-middle">
                {po.paymentTerms || 'เครดิตเทอม 30 วัน'}
              </td>
              <th className="py-1.5 px-2.5 bg-white border-r border-black align-middle text-black">
                <span className="block font-bold text-black text-[11px] leading-tight">สถานที่ส่งมอบพัสดุ</span>
                <span className="block font-normal text-black text-[9.5px] leading-tight mt-0.5">Delivery Destination</span>
              </th>
              <td className="py-1.5 px-2.5 font-medium text-black align-middle leading-snug">
                {po.deliveryLocation || `คลังสินค้า / หน้างาน ${po.department || 'สำนักงาน'}`}
              </td>
            </tr>

            {/* Row 3: Document Status & Project Code */}
            <tr className="border-b border-black">
              <th className="py-1.5 px-2.5 bg-white border-r border-black align-middle text-black">
                <span className="block font-bold text-black text-[11px] leading-tight">สถานะเอกสาร</span>
                <span className="block font-normal text-black text-[9.5px] leading-tight mt-0.5">PO Status</span>
              </th>
              <td className="py-1.5 px-2.5 border-r border-black align-middle">
                {po.status === 'Issued' || po.status === 'Completed' || po.status === 'Approved' ? (
                  <span className="stamp-approved inline-flex items-center gap-1 px-2 py-0.5 border border-emerald-600 bg-emerald-50 text-emerald-700 font-bold rounded-none text-[10.5px]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {statusLabels[po.status] || po.status}
                  </span>
                ) : po.status === 'Cancelled' ? (
                  <span className="stamp-rejected inline-flex items-center gap-1 px-2 py-0.5 border border-red-600 bg-red-50 text-red-700 font-bold rounded-none text-[10.5px]">
                    <AlertCircle className="w-3 h-3 text-red-600" /> {statusLabels[po.status] || po.status}
                  </span>
                ) : (
                  <span className="stamp-pending inline-flex items-center gap-1 px-2 py-0.5 border border-amber-600 bg-amber-50 text-amber-700 font-bold rounded-none text-[10.5px]">
                    {statusLabels[po.status] || po.status}
                  </span>
                )}
              </td>
              <th className="py-1.5 px-2.5 bg-white border-r border-black align-middle text-black">
                <span className="block font-bold text-black text-[11px] leading-tight">รหัสโครงการ / BOQ</span>
                <span className="block font-normal text-black text-[9.5px] leading-tight mt-0.5">Project Code</span>
              </th>
              <td className="py-1.5 px-2.5 font-mono text-black font-semibold align-middle">
                {po.projectCode || 'PRJ-MAIN-01'}
              </td>
            </tr>

            {/* Row 4: Description & Special Instructions */}
            <tr>
              <th className="py-2 px-2.5 bg-white border-r border-black align-middle text-black">
                <span className="block font-bold text-black text-[11px] leading-tight">คำอธิบายคำสั่งซื้อ</span>
                <span className="block font-normal text-black text-[9.5px] leading-tight mt-0.5">PO Description & Notes</span>
              </th>
              <td colSpan={3} className="py-2 px-2.5 font-medium text-black align-middle leading-relaxed text-xs">
                {po.poDescription || 'สั่งซื้อสินค้าตามใบขอซื้อและใบเสนอราคาที่ได้รับอนุมัติ ส่งของพร้อมใบกำกับภาษีฉบับจริง'}
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
              <th className="py-2 px-2.5 border-r border-black w-[240px] text-left text-black">
                <span className="block leading-tight">รายการสินค้าและคุณลักษณะเฉพาะ</span>
                <span className="block text-[9px] font-normal leading-tight">Description & Specification</span>
              </th>
              <th className="py-2 px-1.5 border-r border-black w-[54px] text-right text-black">
                <span className="block leading-tight">จำนวนสั่ง</span>
                <span className="block text-[9px] font-normal leading-tight">Order Qty</span>
              </th>
              <th className="py-2 px-1.5 border-r border-black w-[54px] text-right text-black">
                <span className="block leading-tight">รับแล้ว</span>
                <span className="block text-[9px] font-normal leading-tight">Recv Qty</span>
              </th>
              <th className="py-2 px-1 border-r border-black w-[44px] text-center text-black">
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
              <th className="py-2 px-2 w-[74px] text-left text-black">
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
                  <td className="py-2 px-1.5 border-r border-black text-right font-mono font-bold tabular-nums text-black whitespace-nowrap align-top">
                    {Number(item.receivedQuantity || 0).toLocaleString()}
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
            <span>* เอกสารใบสั่งซื้อ (PO) มีผลผูกพันตามกฎหมายเมื่อผู้ขายได้รับและลงนามยอมรับเงื่อนไขการส่งมอบ</span>
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
              {vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
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

      {/* 5. Official Dynamic Approval Matrix for PO */}
      {showSignatureDetails && (
        <ApprovalMatrixDocumentTable
          steps={matrixSteps || approvalMatrix}
          documentType="PO"
          documentTotalAmount={grandTotal}
          signatures={po.signatures}
          isApproved={po.status !== 'Draft' && po.status !== 'Cancelled'}
          fallbackRequester={{
            name: 'เจ้าหน้าที่จัดซื้อ (Buyer)',
            position: 'ฝ่ายจัดซื้อและพัสดุ',
            date: po.date || po.orderDate
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
          DOC ID: {po.poNumber} | FM-PUR-002 (Rev. 02)
        </div>
      </div>
    </div>
  );
}
