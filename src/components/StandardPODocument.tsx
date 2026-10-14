import React from 'react';
import { PurchaseOrder, ApprovalMatrixStep } from '../types';
import { bahtText } from '../lib/bahtText';
import { cn } from '../lib/utils';
import { ShieldCheck, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
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
 * Enterprise Standard Corporate Purchase Order (PO) Document.
 * Designed strictly to standard A4 paper dimensions (210mm x 297mm / 794px width at 96 DPI).
 * Calibrated line weights, high-contrast typography, and industry-standard layout (ISO 9001 / ERP).
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
    'Approved': 'อนุมัติแล้ว (Approved)',
  };

  return (
    <div
      id={id}
      className={cn(
        "standard-a4-doc bg-white text-slate-900 mx-auto select-text shadow-sm border border-slate-300 rounded-sm relative overflow-hidden",
        "w-[794px] min-h-[1123px] p-8",
        "print:w-full print:min-h-0 print:border-none print:shadow-none print:p-0 print:m-0",
        className
      )}
      style={{
        boxSizing: 'border-box',
        colorScheme: 'light',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        fontFamily: "'Sarabun', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        lineHeight: 1.42,
        wordBreak: 'normal',
        overflowWrap: 'break-word',
      }}
    >

      {/* 1. Header: Corporate Details + Official Title Box */}
      <div className="border-b border-slate-300 pb-3 mb-3 bg-white">
        <div className="flex justify-between items-start gap-4">
          {/* Company Branding */}
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            {companyProfile?.logoUrl ? (
              <div className="w-14 h-14 rounded-sm bg-white flex items-center justify-center flex-shrink-0 border border-slate-200 p-1 overflow-hidden shadow-2xs">
                <img 
                  src={companyProfile.logoUrl} 
                  alt="Company Logo" 
                  className="max-h-full max-w-full object-contain" 
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-sm bg-slate-900 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 font-mono shadow-2xs">
                {(companyProfile?.nameEn || 'CS').substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-[15px] font-bold text-slate-900 leading-snug tracking-tight">
                {companyProfile?.nameTh || 'บริษัท โคนเนอเรจ สโตร์ จำกัด'}
              </h1>
              <p className="text-[10.5px] text-slate-500 font-bold tracking-wider uppercase mt-0.5">
                {companyProfile?.nameEn || 'CONERAGE STORE CO., LTD.'}
              </p>
              <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">
                {companyProfile?.address || '888 อาคารเอ็มไพร์ทาวเวอร์ ชั้น 24 ถนนสาทรใต้ แขวงยานนาวา เขตสาทร กรุงเทพฯ 10120'}
              </p>
              <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">
                เลขประจำตัวผู้เสียภาษี: <span className="font-semibold text-slate-800 font-mono">{companyProfile?.taxId || '0105566012345'}</span> • โทร: {companyProfile?.phone || '02-123-4567'} • อีเมล: {companyProfile?.email || 'contact@coneragestore.com'}
              </p>
            </div>
          </div>

          {/* Document Title & Meta Box */}
          <div className="text-right flex flex-col items-end flex-shrink-0 w-64 shadow-2xs">
            <div className="w-full bg-slate-900 text-white py-1 px-3 rounded-t-sm text-center tracking-wider font-bold text-xs uppercase">
              ใบสั่งซื้อ / PURCHASE ORDER (PO)
            </div>
            <div className="w-full border-x border-b border-slate-300 bg-white p-2 text-xs space-y-1 rounded-b-sm">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-slate-700 text-[11px]">เลขที่ใบสั่งซื้อ:</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{po.poNumber}</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-slate-100 pt-1">
                <span className="text-slate-500 text-[11px]">วันที่ออกเอกสาร:</span>
                <span className="font-semibold text-slate-800 text-[11px]">{formatDate(po.date || po.orderDate)}</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-slate-100 pt-1">
                <span className="text-slate-500 text-[11px]">อ้างอิงใบขอซื้อ (PR):</span>
                <span className="font-mono font-semibold text-slate-800 text-[11px]">{po.prNumber || '-'}</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-slate-100 pt-1">
                <span className="text-slate-500 text-[11px]">กำหนดส่งมอบ:</span>
                <span className="font-semibold text-slate-800 text-[11px]">{formatDate(po.expectedDeliveryDate || po.date)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Document Information Matrix: Structured 4-column Table Matrix */}
      <div className="border border-slate-300 rounded-sm mb-3 overflow-hidden bg-white text-xs shadow-2xs">
        <table className="w-full border-collapse table-fixed text-left bg-white">
          <tbody>
            {/* Row 1: Vendor & Project */}
            <tr className="border-b border-slate-200">
              <th className="w-[135px] py-1.5 px-2.5 bg-slate-50/90 border-r border-slate-200 align-middle text-slate-700">
                <span className="block font-bold text-slate-800 text-[10.5px] leading-tight whitespace-nowrap">ผู้ขาย / คู่ค้า</span>
                <span className="block font-normal text-slate-500 text-[8.5px] leading-tight mt-0.5 uppercase whitespace-nowrap">Vendor / Supplier</span>
              </th>
              <td className="w-[230px] py-1.5 px-3 font-bold text-slate-900 border-r border-slate-200 align-middle leading-snug">
                {po.vendorName}
              </td>
              <th className="w-[135px] py-1.5 px-2.5 bg-slate-50/90 border-r border-slate-200 align-middle text-slate-700">
                <span className="block font-bold text-slate-800 text-[10.5px] leading-tight whitespace-nowrap">โครงการ / ไซต์งาน</span>
                <span className="block font-normal text-slate-500 text-[8.5px] leading-tight mt-0.5 uppercase whitespace-nowrap">Project / Site</span>
              </th>
              <td className="w-[230px] py-1.5 px-3 font-bold text-slate-900 align-middle leading-snug">
                {po.department || 'โครงการหลัก (สำนักงานใหญ่)'}
              </td>
            </tr>

            {/* Row 2: Payment Terms & Delivery Location */}
            <tr className="border-b border-slate-200">
              <th className="w-[135px] py-1.5 px-2.5 bg-slate-50/90 border-r border-slate-200 align-middle text-slate-700">
                <span className="block font-bold text-slate-800 text-[10.5px] leading-tight whitespace-nowrap">เงื่อนไขการชำระเงิน</span>
                <span className="block font-normal text-slate-500 text-[8.5px] leading-tight mt-0.5 uppercase whitespace-nowrap">Payment Terms</span>
              </th>
              <td className="w-[230px] py-1.5 px-3 font-semibold text-slate-900 border-r border-slate-200 align-middle">
                {po.paymentTerms || 'เครดิตเทอม 30 วัน'}
              </td>
              <th className="w-[135px] py-1.5 px-2.5 bg-slate-50/90 border-r border-slate-200 align-middle text-slate-700">
                <span className="block font-bold text-slate-800 text-[10.5px] leading-tight whitespace-nowrap">สถานที่ส่งมอบพัสดุ</span>
                <span className="block font-normal text-slate-500 text-[8.5px] leading-tight mt-0.5 uppercase whitespace-nowrap">Delivery Destination</span>
              </th>
              <td className="w-[230px] py-1.5 px-3 font-medium text-slate-800 align-middle leading-snug">
                {po.deliveryLocation || `คลังสินค้า / หน้างาน ${po.department || 'สำนักงาน'}`}
              </td>
            </tr>

            {/* Row 3: Document Status & Project Code */}
            <tr className="border-b border-slate-200">
              <th className="w-[135px] py-1.5 px-2.5 bg-slate-50/90 border-r border-slate-200 align-middle text-slate-700">
                <span className="block font-bold text-slate-800 text-[10.5px] leading-tight whitespace-nowrap">สถานะเอกสาร</span>
                <span className="block font-normal text-slate-500 text-[8.5px] leading-tight mt-0.5 uppercase whitespace-nowrap">PO Status</span>
              </th>
              <td className="w-[230px] py-1.5 px-3 border-r border-slate-200 align-middle">
                {po.status === 'Issued' || po.status === 'Completed' || po.status === 'Approved' ? (
                  <span className="stamp-approved inline-flex items-center gap-1 px-2.5 py-0.5 border border-emerald-600 bg-emerald-50 text-emerald-800 font-bold rounded-sm text-[10px] shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {statusLabels[po.status] || po.status}
                  </span>
                ) : po.status === 'Cancelled' ? (
                  <span className="stamp-rejected inline-flex items-center gap-1 px-2.5 py-0.5 border border-red-600 bg-red-50 text-red-800 font-bold rounded-sm text-[10px] shadow-2xs">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600" /> {statusLabels[po.status] || po.status}
                  </span>
                ) : (
                  <span className="stamp-pending inline-flex items-center gap-1 px-2.5 py-0.5 border border-amber-600 bg-amber-50 text-amber-800 font-bold rounded-sm text-[10px] shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> {statusLabels[po.status] || po.status}
                  </span>
                )}
              </td>
              <th className="w-[135px] py-1.5 px-2.5 bg-slate-50/90 border-r border-slate-200 align-middle text-slate-700">
                <span className="block font-bold text-slate-800 text-[10.5px] leading-tight whitespace-nowrap">รหัสโครงการ / BOQ</span>
                <span className="block font-normal text-slate-500 text-[8.5px] leading-tight mt-0.5 uppercase whitespace-nowrap">Project Code / BOQ</span>
              </th>
              <td className="w-[230px] py-1.5 px-3 font-mono text-slate-900 font-bold align-middle">
                {po.projectCode || 'PRJ-MAIN-01'}
              </td>
            </tr>

            {/* Row 4: Description & Special Instructions */}
            <tr>
              <th className="w-[135px] py-1.5 px-2.5 bg-slate-50/90 border-r border-slate-200 align-middle text-slate-700">
                <span className="block font-bold text-slate-800 text-[10.5px] leading-tight whitespace-nowrap">คำอธิบายคำสั่งซื้อ</span>
                <span className="block font-normal text-slate-500 text-[8.5px] leading-tight mt-0.5 uppercase whitespace-nowrap tracking-tight">PO Description & Notes</span>
              </th>
              <td colSpan={3} className="py-1.5 px-3 font-medium text-slate-800 align-middle leading-relaxed text-[11px]">
                {po.poDescription || 'สั่งซื้อสินค้าตามใบขอซื้อและใบเสนอราคาที่ได้รับอนุมัติ ส่งของพร้อมใบกำกับภาษีฉบับจริง'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 3. Items Table */}
      <div className="border border-slate-300 rounded-sm mb-3 overflow-hidden bg-white shadow-2xs">
        <table className="w-full text-left border-collapse table-fixed bg-white">
          <thead>
            <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-[10.5px]">
              <th className="py-2 px-1 border-r border-slate-300 w-[32px] text-center align-middle">
                <span className="block leading-tight whitespace-nowrap">ลำดับ</span>
                <span className="block text-[8.5px] text-slate-500 font-normal uppercase leading-tight mt-0.5 whitespace-nowrap">No.</span>
              </th>
              <th className="py-2 px-2 border-r border-slate-300 w-[76px] text-left align-middle">
                <span className="block leading-tight whitespace-nowrap">รหัสพัสดุ</span>
                <span className="block text-[8.5px] text-slate-500 font-normal uppercase leading-tight mt-0.5 whitespace-nowrap">Item Code</span>
              </th>
              <th className="py-2 px-2.5 border-r border-slate-300 w-[226px] text-left align-middle">
                <span className="block leading-tight whitespace-nowrap">รายการสินค้าและคุณลักษณะเฉพาะ</span>
                <span className="block text-[8.5px] text-slate-500 font-normal uppercase leading-tight mt-0.5 whitespace-nowrap">Description & Specification</span>
              </th>
              <th className="py-2 px-1.5 border-r border-slate-300 w-[64px] text-right align-middle">
                <span className="block leading-tight whitespace-nowrap">จำนวนสั่ง</span>
                <span className="block text-[8.5px] text-slate-500 font-normal uppercase leading-tight mt-0.5 whitespace-nowrap">Order Qty</span>
              </th>
              <th className="py-2 px-1.5 border-r border-slate-300 w-[60px] text-right align-middle">
                <span className="block leading-tight whitespace-nowrap">รับแล้ว</span>
                <span className="block text-[8.5px] text-slate-500 font-normal uppercase leading-tight mt-0.5 whitespace-nowrap">Recv Qty</span>
              </th>
              <th className="py-2 px-1 border-r border-slate-300 w-[42px] text-center align-middle">
                <span className="block leading-tight whitespace-nowrap">หน่วย</span>
                <span className="block text-[8.5px] text-slate-500 font-normal uppercase leading-tight mt-0.5 whitespace-nowrap">Unit</span>
              </th>
              <th className="py-2 px-2 border-r border-slate-300 w-[76px] text-right align-middle">
                <span className="block leading-tight whitespace-nowrap">ราคา/หน่วย</span>
                <span className="block text-[8.5px] text-slate-500 font-normal uppercase leading-tight mt-0.5 whitespace-nowrap">Unit Price</span>
              </th>
              <th className="py-2 px-2 border-r border-slate-300 w-[90px] text-right align-middle">
                <span className="block leading-tight whitespace-nowrap">จำนวนเงิน</span>
                <span className="block text-[8.5px] text-slate-500 font-normal uppercase leading-tight mt-0.5 whitespace-nowrap">Amount</span>
              </th>
              <th className="py-2 px-2 w-[64px] text-left align-middle">
                <span className="block leading-tight whitespace-nowrap">หมายเหตุ</span>
                <span className="block text-[8.5px] text-slate-500 font-normal uppercase leading-tight mt-0.5 whitespace-nowrap">Remark</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs bg-white text-slate-900">
            {items.map((item, idx) => {
              const lineTotal = Number(item.quantity || 0) * Number(item.unitPrice || 0);
              return (
                <tr key={item.id || idx} className="min-h-[38px] bg-white even:bg-slate-50/35 hover:bg-slate-50/70 transition-colors">
                  <td className="py-2 px-1 border-r border-slate-200 text-center font-medium text-slate-600 align-top">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-2 border-r border-slate-200 font-mono text-[10.5px] text-slate-700 align-top font-semibold">
                    {item.itemCode || `ITM-${String(idx + 1).padStart(3, '0')}`}
                  </td>
                  <td className="py-2 px-2.5 border-r border-slate-200 align-top">
                    <div className="font-bold text-slate-900 leading-snug">
                      {item.description}
                    </div>
                    {item.specification && (
                      <div className="text-[10.5px] text-slate-500 leading-normal mt-0.5">
                        {item.specification}
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-1.5 border-r border-slate-200 text-right font-semibold text-slate-900 font-mono tabular-nums whitespace-nowrap align-top">
                    {Number(item.quantity).toLocaleString()}
                  </td>
                  <td className="py-2 px-1.5 border-r border-slate-200 text-right font-mono font-bold tabular-nums text-slate-800 whitespace-nowrap align-top">
                    {Number(item.receivedQuantity || 0).toLocaleString()}
                  </td>
                  <td className="py-2 px-1 border-r border-slate-200 text-center text-slate-700 align-top whitespace-nowrap">
                    {item.unit}
                  </td>
                  <td className="py-2 px-2 border-r border-slate-200 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap align-top">
                    {Number(item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-2 border-r border-slate-200 text-right font-bold font-mono tabular-nums text-slate-950 whitespace-nowrap align-top">
                    {lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-2 text-[10.5px] text-slate-500 leading-snug align-top">
                    {item.remark || '-'}
                  </td>
                </tr>
              );
            })}

            {/* Filler rows to guarantee formal document proportions */}
            {items.length < 4 && Array.from({ length: 4 - items.length }).map((_, fIdx) => (
              <tr key={`filler-${fIdx}`} className="h-7 text-slate-400 bg-white even:bg-slate-50/20">
                <td className="border-r border-slate-200 text-center text-[10px]">{items.length + fIdx + 1}</td>
                <td className="border-r border-slate-200"></td>
                <td className="border-r border-slate-200"></td>
                <td className="border-r border-slate-200"></td>
                <td className="border-r border-slate-200"></td>
                <td className="border-r border-slate-200"></td>
                <td className="border-r border-slate-200"></td>
                <td className="border-r border-slate-200"></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Financial Calculations & Thai Baht Text Block */}
      <div className="border border-slate-300 rounded-sm mb-3 grid grid-cols-12 text-xs bg-white text-slate-900 overflow-hidden shadow-2xs">
        {/* Left: Thai Baht in Words */}
        <div className="col-span-7 p-3 border-r border-slate-300 bg-white flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              จำนวนเงินรวมทั้งสิ้น (ตัวอักษร) / Thai Baht in Words:
            </div>
            <div className="mt-1.5 font-bold text-slate-900 text-xs sm:text-[12.5px] bg-slate-50/80 p-2.5 border border-slate-200 rounded-sm leading-normal">
              ( {thaiBahtWords} )
            </div>
          </div>
          <div className="mt-2 text-[9.5px] text-slate-500 leading-snug flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span>* เอกสารใบสั่งซื้อ (PO) มีผลผูกพันตามกฎหมายเมื่อผู้ขายได้รับและลงนามยอมรับเงื่อนไขการส่งมอบ</span>
          </div>
        </div>

        {/* Right: Subtotal, VAT, Grand Total */}
        <div className="col-span-5 divide-y divide-slate-200 bg-white flex flex-col justify-between text-slate-900">
          <div className="flex justify-between items-center py-2 px-3 bg-white text-slate-600">
            <span className="font-medium text-[11px]">รวมเป็นเงิน (Subtotal):</span>
            <span className="font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
              {rawSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
            </span>
          </div>
          <div className="flex justify-between items-center py-2 px-3 bg-white text-slate-600">
            <span className="font-medium text-[11px]">ภาษีมูลค่าเพิ่ม 7% (VAT):</span>
            <span className="font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
              {vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
            </span>
          </div>
          <div className="flex justify-between items-center py-2.5 px-3 bg-slate-50/70 border-t-2 border-slate-400">
            <span className="font-bold text-slate-900 text-xs sm:text-sm">ยอดเงินสุทธิ (Grand Total):</span>
            <span className="font-mono font-black text-slate-950 text-base tabular-nums whitespace-nowrap border-b-2 border-double border-slate-900 pb-0.5">
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
      <div className="flex justify-between items-center text-[9.5px] text-slate-500 pt-2 border-t border-slate-300 bg-white">
        <div className="truncate max-w-[340px]">
          พิมพ์เมื่อ: {new Date().toLocaleString(isThai ? 'th-TH' : 'en-US')} • ระบบจัดซื้อ {companyProfile?.nameTh || companyProfile?.nameEn || 'Conerage store'}
        </div>
        <div className="font-semibold text-slate-600">
          หน้า 1 จาก 1 (Page 1 of 1) • เอกสารควบคุมภายใน
        </div>
        <div className="font-mono text-slate-600 text-right font-semibold">
          DOC ID: {po.poNumber} • FM-PUR-002 (Rev. 03)
        </div>
      </div>
    </div>
  );
}
