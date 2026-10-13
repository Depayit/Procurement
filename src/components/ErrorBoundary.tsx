import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, RotateCcw, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  isChunkError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      isChunkError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static isChunkLoadError(error?: Error | null): boolean {
    if (!error) return false;
    const msg = String(error.message || error || '');
    return (
      (error.name === 'TypeError' && /Failed to fetch dynamically imported module/i.test(msg)) ||
      /Failed to fetch dynamically imported module|Loading chunk|dynamically imported module|Importing a module script failed/i.test(msg)
    );
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const isChunk = ErrorBoundary.isChunkLoadError(error);
    return { hasError: true, isChunkError: isChunk, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ProcureSync caught an error in ErrorBoundary:', error, errorInfo);
    const isChunk = ErrorBoundary.isChunkLoadError(error);
    this.setState({ error, errorInfo, isChunkError: isChunk });

    // Auto-recover immediately from chunk loading failures caused by new deployments
    if (isChunk && typeof window !== 'undefined') {
      const lastReload = sessionStorage.getItem('procuresync_eb_chunk_reload');
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem('procuresync_eb_chunk_reload', String(now));
        console.warn('[ProcureSync ErrorBoundary] New version chunk detected. Auto-reloading with latest files...');
        this.handleClearCacheAndReload();
      }
    }
  }

  handleClearCacheAndReload = async () => {
    try {
      if (typeof window !== 'undefined' && 'caches' in window) {
        const keys = await window.caches.keys();
        await Promise.all(keys.map(k => window.caches.delete(k)));
      }
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const r of regs) {
          await r.update();
        }
      }
    } catch {
      // ignore
    }
    window.location.reload();
  };

  handleReload = () => {
    this.handleClearCacheAndReload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, isChunkError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  handleResetStorage = () => {
    try {
      sessionStorage.clear();
      // Keep language preference if available
      const lang = localStorage.getItem('procuresync_language');
      localStorage.clear();
      if (lang) {
        localStorage.setItem('procuresync_language', lang);
      }
    } catch {
      // Ignore storage errors
    }
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorMessage = this.state.error?.message || 'Unknown application error';
      const componentStack = this.state.errorInfo?.componentStack || '';

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className={this.state.isChunkError 
              ? "bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-900 p-6 text-white text-center"
              : "bg-gradient-to-r from-red-500 to-rose-600 p-6 text-white text-center"
            }>
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                {this.state.isChunkError ? (
                  <Sparkles className="w-8 h-8 text-amber-300 animate-pulse stroke-[2.2]" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-white stroke-[2.2]" />
                )}
              </div>
              <h2 className="text-xl font-bold tracking-tight">
                {this.state.isChunkError ? 'มีเวอร์ชันใหม่ของระบบพร้อมใช้งาน' : 'เกิดข้อผิดพลาดในการแสดงผล'}
              </h2>
              <p className={this.state.isChunkError ? "text-indigo-200 text-xs mt-1" : "text-red-100 text-xs mt-1"}>
                {this.state.isChunkError ? 'System Update Available • โปรดรีเฟรชเพื่อโหลดเวอร์ชันล่าสุด' : 'Application encountered an unexpected error'}
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              <div className={this.state.isChunkError
                ? "bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 text-xs text-indigo-900 leading-relaxed"
                : "bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 leading-relaxed"
              }>
                {this.state.isChunkError ? (
                  <span>
                    ระบบตรวจพบการอัปเดตไฟล์เวอร์ชันใหม่จากเซิร์ฟเวอร์ กรุณากดปุ่ม <strong>&ldquo;อัปเดตและเริ่มใหม่&rdquo;</strong> ด้านล่างเพื่อโหลดไฟล์ล่าสุดและใช้งานต่อได้ทันที
                  </span>
                ) : (
                  <span>
                    ระบบได้ตรวจพบข้อผิดพลาดและป้องกันไม่ให้หน้าจอค้างสีขาว คุณสามารถกดปุ่มรีโหลดเพื่อโหลดหน้าเว็บใหม่ หรือกลับไปที่หน้าหลักเพื่อทำงานต่อได้ทันที
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={this.handleReload}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{this.state.isChunkError ? 'อัปเดตและเริ่มใหม่ (Update & Reload)' : 'โหลดหน้าใหม่ (Reload)'}</span>
                </button>
                <button
                  type="button"
                  onClick={this.handleGoHome}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  <Home className="w-4 h-4" />
                  <span>กลับหน้าหลัก (Home)</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <button
                  type="button"
                  onClick={this.handleResetStorage}
                  className="inline-flex items-center gap-1.5 text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                  title="ล้างข้อมูลแคชชั่วคราวแล้วโหลดใหม่"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ล้างแคชและเริ่มใหม่</span>
                </button>

                <button
                  type="button"
                  onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                  className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                >
                  <span>{this.state.showDetails ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียดข้อผิดพลาด'}</span>
                  {this.state.showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Technical Details Collapsible */}
              {this.state.showDetails && (
                <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48 overflow-y-auto space-y-2 border border-slate-800">
                  <div className="font-bold text-red-400">Error: {errorMessage}</div>
                  {componentStack && (
                    <pre className="text-slate-400 whitespace-pre-wrap text-[10px] leading-relaxed">
                      {componentStack}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
