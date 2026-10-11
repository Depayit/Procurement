import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export function DetailsModal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  maxWidth = "max-w-4xl"
}: DetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity print-hidden"
        onClick={onClose}
      />
      
      <div className={cn(
        "relative bg-white rounded-xl shadow-2xl w-full max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 print-area print:shadow-none print:border-none print:max-w-none print:w-full print:max-h-none print:rounded-none overflow-hidden",
        maxWidth
      )}>
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 border-b border-slate-200 flex-shrink-0 print-hidden bg-slate-50/90">
          <h2 className="text-base sm:text-lg font-bold text-slate-800 truncate pr-2">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-200/60 print-hidden"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-6 text-sm print:overflow-visible print:p-0 smooth-scroll">
          {children}
        </div>

        {footer && (
          <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-t border-slate-200 bg-slate-50 rounded-b-xl flex flex-wrap items-center justify-end gap-2 sm:gap-3 flex-shrink-0 print-hidden">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
