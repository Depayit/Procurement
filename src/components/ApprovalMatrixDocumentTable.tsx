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
 * Enterprise Standard Approval Matrix Signature Block.
 * Calibrated to modern ERP / ISO 9001 corporate document standards.
 * Features precision 1px borders, subtle shaded role badges, dashed ink-signing guidelines,
 * and authentic official colored stamp seals.
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
  const effectiveTotalAmount = documentTotalAmount ?? totalAmount;

  // Filter steps configured for this document type and threshold amount
  const relevantSteps = steps.filter(step => {
    if (!step.appliesTo.includes(documentType)) return false;
    if (effectiveTotalAmount !== undefined) {
      if (step.minAmount !== undefined && effectiveTotalAmount < step.minAmount) {
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

  const colCount = Math.min(relevantSteps.length, 6);
  const gridColClass = 
    colCount === 2 ? 'grid-cols-2' :
    colCount === 3 ? 'grid-cols-3' :
    colCount === 5 ? 'grid-cols-5' :
    colCount === 6 ? 'grid-cols-6' : 'grid-cols-4';

  return (
    <div className={cn("border border-slate-300 rounded-sm bg-white mb-3 text-center text-xs select-text overflow-hidden shadow-2xs", className)}>
      {/* Table Header Bar */}
      <div className="bg-slate-100 border-b border-slate-300 py-1.5 px-3 font-bold text-slate-800 uppercase tracking-wide text-[10.5px] flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          <span>การตรวจสอบและอนุมัติ (APPROVAL MATRIX WORKFLOW)</span>
        </span>
        <span className="text-[9.5px] text-slate-600 font-semibold tracking-normal">
          {documentType === 'PR' ? 'ใบขอซื้อ (Purchase Request)' : 'ใบสั่งซื้อ (Purchase Order)'} • FM-APV-01
        </span>
      </div>

      {/* Grid of Signatory Columns */}
      <div className={cn("grid divide-x divide-slate-300 bg-white", gridColClass)}>
        {relevantSteps.map((step, idx) => {
          const roleKey = step.roleKey;
          const isRequesterStep = roleKey === 'requestedBy';
          const signature = signatures?.[roleKey];

          const displayedName = isRequesterStep 
            ? (requesterName || fallbackRequester?.name || signature?.name || step.defaultName) 
            : (signature?.name || step.defaultName);

          const displayedPosition = isRequesterStep 
            ? (requesterPosition || fallbackRequester?.position || signature?.position || step.defaultPosition) 
            : (signature?.position || step.defaultPosition);

          const isLastStep = idx === relevantSteps.length - 1;
          const displayedDate = signature?.date || (isRequesterStep ? (requestDate || fallbackRequester?.date) : (isLastStep && isApproved ? (requestDate) : undefined));
          const isStepSigned = signature?.signed || (isRequesterStep && !!displayedDate) || (isLastStep && isApproved);

          const hasThreshold = typeof step.minAmount === 'number' && step.minAmount > 0;
          const isApplicableForAmount = effectiveTotalAmount === undefined || !hasThreshold || effectiveTotalAmount >= (step.minAmount || 0);

          return (
            <div 
              key={step.id || idx} 
              className={cn(
                "flex flex-col justify-between min-h-[124px] bg-white text-slate-900 transition-colors",
                !isApplicableForAmount ? "opacity-75 bg-slate-50/40" : ""
              )}
            >
              {/* Step Header */}
              <div className="bg-slate-50/80 p-2 border-b border-slate-200">
                <div className="font-bold text-slate-900 text-[10.5px] leading-tight">
                  {step.titleTh}
                </div>
                <div className="text-[9px] text-slate-500 font-medium uppercase tracking-wider leading-tight mt-0.5">
                  {step.titleEn}
                </div>
                {hasThreshold && (
                  <div className="mt-1">
                    <span className="inline-block text-[8.5px] font-mono font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-300 shadow-2xs">
                      วงเงิน &gt; {step.minAmount?.toLocaleString()} บ.
                    </span>
                  </div>
                )}
              </div>

              {/* Signatory Name & Signature Status */}
              <div className="p-2.5 my-auto">
                <div className="font-bold text-slate-900 leading-tight text-[11px]">
                  {displayedName || '-'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                  {displayedPosition || '-'}
                </div>

                <div className="mt-2 min-h-[26px] flex items-center justify-center">
                  {isStepSigned ? (
                    <span className={cn(
                      "font-bold inline-flex items-center gap-1 px-2.5 py-1 rounded-sm border text-[10px] shadow-2xs",
                      isLastStep 
                        ? "stamp-approved bg-emerald-50 text-emerald-700 border-emerald-600" 
                        : "stamp-reviewed bg-indigo-50 text-indigo-700 border-indigo-600"
                    )}>
                      <CheckCircle2 className={cn("w-3.5 h-3.5 shrink-0", isLastStep ? "text-emerald-600" : "text-indigo-600")} />
                      <span>{isLastStep ? 'อนุมัติโครงการ' : 'ผ่านการตรวจสอบ'}</span>
                    </span>
                  ) : isLastStep && isRejected ? (
                    <span className="stamp-rejected font-bold bg-red-50 text-red-700 border-red-600 px-2.5 py-1 rounded-sm border inline-flex items-center gap-1 text-[10px] shadow-2xs">
                      <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" /> 
                      <span>ไม่อนุมัติ</span>
                    </span>
                  ) : !isApplicableForAmount ? (
                    <span className="text-slate-400 text-[9.5px] italic">[ ไม่อยู่ในเกณฑ์วงเงิน ]</span>
                  ) : (
                    <div className="w-full">
                      <div className="w-24 border-b border-dashed border-slate-300 mx-auto mb-1" />
                      <span className="text-slate-400 font-mono text-[9px]">( ลงชื่อผู้มีอำนาจ )</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Date Box */}
              <div className="text-[9.5px] text-slate-600 border-t border-slate-200 py-1.5 px-1 mt-auto font-medium bg-slate-50/50">
                วันที่: {displayedDate ? formatDate(displayedDate) : '....../....../......'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
