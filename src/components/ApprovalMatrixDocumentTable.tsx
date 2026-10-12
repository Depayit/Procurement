import React from 'react';
import type { ApprovalMatrixStep, PRSignatures } from '../types';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export interface ApprovalMatrixDocumentTableProps {
  steps: ApprovalMatrixStep[];
  documentType: 'PR' | 'PO';
  signatures?: PRSignatures;
  requesterName?: string;
  requesterPosition?: string;
  requestDate?: string;
  status?: string;
  totalAmount?: number;
  documentTotalAmount?: number;
  isApproved?: boolean;
  isRejected?: boolean;
  fallbackRequester?: {
    name?: string;
    position?: string;
    date?: string;
  };
  className?: string;
  isThai?: boolean;
}

/**
 * Enterprise Approval Matrix signature table for official printable A4 documents (PR & PO).
 * Dynamically draws its columns, labels, positions, and signatories from the company's configured Approval Matrix.
 */
export function ApprovalMatrixDocumentTable({
  steps,
  documentType,
  signatures,
  requesterName,
  requesterPosition,
  requestDate,
  status = 'Draft',
  totalAmount,
  documentTotalAmount,
  isApproved: isApprovedProp,
  isRejected: isRejectedProp,
  fallbackRequester,
  className,
  isThai = true
}: ApprovalMatrixDocumentTableProps) {
  // Effective amount
  const effectiveTotalAmount = documentTotalAmount ?? totalAmount;

  // Filter steps configured for this document type and threshold amount
  const relevantSteps = steps.filter(step => {
    if (!step.appliesTo.includes(documentType)) return false;
    if (effectiveTotalAmount !== undefined) {
      if (step.minAmount !== undefined && effectiveTotalAmount < step.minAmount) {
        // If not required and amount is below threshold, skip
        if (!step.isRequired) return false;
      }
    }
    return true;
  });
  
  if (relevantSteps.length === 0) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '....../....../......';
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

  const isApproved = isApprovedProp !== undefined 
    ? isApprovedProp 
    : (status === 'Approved' || status === 'PO Created' || status === 'Issued' || status === 'Completed');
  const isRejected = isRejectedProp !== undefined 
    ? isRejectedProp 
    : (status === 'Rejected' || status === 'Cancelled');

  // Responsive grid based on number of steps (e.g. 2, 3, 4, 5 columns)
  const colCount = Math.min(relevantSteps.length, 6);
  const gridColClass = 
    colCount === 2 ? 'grid-cols-2' :
    colCount === 3 ? 'grid-cols-3' :
    colCount === 5 ? 'grid-cols-5' :
    colCount === 6 ? 'grid-cols-6' : 'grid-cols-4';

  return (
    <div className={cn("border-2 border-black bg-white mb-3 text-center text-xs select-text", className)}>
      {/* Table Header */}
      <div className="bg-white border-b-2 border-black py-1 px-2 font-bold text-black uppercase tracking-wide text-[11px] flex items-center justify-between">
        <span>การตรวจสอบและอนุมัติ (APPROVAL MATRIX)</span>
        <span className="text-[9.5px] text-black font-semibold">
          {documentType === 'PR' ? 'ใบขอซื้อ (Purchase Request)' : 'ใบสั่งซื้อ (Purchase Order)'}
        </span>
      </div>

      {/* Grid of Signatory Columns */}
      <div className={cn("grid divide-x divide-black bg-white", gridColClass)}>
        {relevantSteps.map((step, idx) => {
          const roleKey = step.roleKey;
          const isRequesterStep = roleKey === 'requestedBy';
          const signature = signatures?.[roleKey];

          // Determine displayed name and position
          const displayedName = isRequesterStep 
            ? (requesterName || fallbackRequester?.name || signature?.name || step.defaultName) 
            : (signature?.name || step.defaultName);

          const displayedPosition = isRequesterStep 
            ? (requesterPosition || fallbackRequester?.position || signature?.position || step.defaultPosition) 
            : (signature?.position || step.defaultPosition);

          const isLastStep = idx === relevantSteps.length - 1;
          const displayedDate = signature?.date || (isRequesterStep ? (requestDate || fallbackRequester?.date) : (isLastStep && isApproved ? (requestDate) : undefined));
          const isStepSigned = signature?.signed || (isRequesterStep && !!displayedDate) || (isLastStep && isApproved);

          // Check if this step is optional due to amount thresholds
          const hasThreshold = typeof step.minAmount === 'number' && step.minAmount > 0;
          const isApplicableForAmount = effectiveTotalAmount === undefined || !hasThreshold || effectiveTotalAmount >= (step.minAmount || 0);

          return (
            <div 
              key={step.id || idx} 
              className={cn(
                "p-2.5 flex flex-col justify-between min-h-[118px] bg-white text-black",
                !isApplicableForAmount ? "opacity-75" : ""
              )}
            >
              {/* Step Header */}
              <div>
                <div className="font-bold text-black text-[11px] leading-tight">
                  {step.titleTh}
                </div>
                <div className="text-[9px] text-black font-normal leading-tight mt-0.5">
                  {step.titleEn}
                </div>
                {hasThreshold && (
                  <div className="text-[8.5px] text-black font-mono font-bold mt-0.5">
                    วงเงิน &gt; {step.minAmount?.toLocaleString()} บ.
                  </div>
                )}
              </div>

              {/* Signatory Name & Signature Status */}
              <div className="my-auto py-1">
                <div className="font-bold text-black leading-tight text-[11px]">
                  {displayedName || '-'}
                </div>
                <div className="text-[10px] text-black mt-0.5 leading-tight">
                  {displayedPosition || '-'}
                </div>

                <div className="text-[10px] text-black mt-1">
                  {isStepSigned ? (
                    <span className={cn(
                      "font-bold inline-flex items-center gap-1 px-2 py-0.5 rounded-none border text-[10.5px]",
                      isLastStep 
                        ? "stamp-approved bg-emerald-50 text-emerald-700 border-emerald-600" 
                        : "stamp-reviewed bg-indigo-50 text-indigo-700 border-indigo-600"
                    )}>
                      <CheckCircle2 className={cn("w-3 h-3 shrink-0", isLastStep ? "text-emerald-600" : "text-indigo-600")} />
                      {isLastStep ? 'อนุมัติโครงการ' : 'ผ่านการตรวจสอบ'}
                    </span>
                  ) : isLastStep && isRejected ? (
                    <span className="stamp-rejected font-bold bg-red-50 text-red-700 border-red-600 px-2 py-0.5 rounded-none border inline-flex items-center gap-1 text-[10.5px]">
                      <AlertCircle className="w-3 h-3 text-red-600 shrink-0" /> ไม่อนุมัติ
                    </span>
                  ) : !isApplicableForAmount ? (
                    <span className="text-black text-[9.5px] italic">[ ต่ำกว่าเกณฑ์วงเงิน ]</span>
                  ) : (
                    <span className="text-black font-mono tracking-widest text-[11px] font-bold">..............................</span>
                  )}
                </div>
              </div>

              {/* Date Box */}
              <div className="text-[10px] text-black border-t border-black pt-1 mt-auto font-medium">
                วันที่: {
                  displayedDate 
                    ? formatDate(displayedDate)
                    : '....../....../......'
                }
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
