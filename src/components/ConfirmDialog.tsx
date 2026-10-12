import { AlertTriangle, X } from 'lucide-react';
import { cn } from '../lib/utils';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  isDestructive = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
            isDestructive ? "bg-red-100 text-red-600" : "bg-indigo-100 text-indigo-600"
          )}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn(
              "px-4 py-2 rounded text-white font-semibold text-sm transition-colors shadow-sm",
              isDestructive 
                ? "bg-red-600 hover:bg-red-700" 
                : "bg-indigo-600 hover:bg-indigo-700"
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
