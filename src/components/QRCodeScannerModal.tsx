import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  Camera, 
  CameraOff, 
  RefreshCw, 
  Zap, 
  ZapOff, 
  Upload, 
  Keyboard, 
  CheckCircle2, 
  AlertCircle, 
  ArrowDownUp, 
  CheckSquare, 
  Eye, 
  Copy, 
  Check, 
  QrCode, 
  Package, 
  MapPin, 
  Loader2,
  Scan,
  Barcode,
  Store,
  Tag
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats, CameraDevice } from 'html5-qrcode';
import { cn } from '../lib/utils';
import type { InventoryItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export interface QRCodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
  items?: InventoryItem[];
  onSelectAction?: (action: 'transact' | 'count' | 'view', item: InventoryItem) => void;
  onPrintLabel?: (item: InventoryItem) => void;
}

interface ScannedResult {
  code: string;
  rawText: string;
  item: InventoryItem | null;
  timestamp: string;
}

export function QRCodeScannerModal({ 
  isOpen, 
  onClose, 
  onScan, 
  items = [], 
  onSelectAction,
  onPrintLabel
}: QRCodeScannerModalProps) {
  const { isEnglish } = useLanguage();
  
  // UI State
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [hasTorchSupport, setHasTorchSupport] = useState(false);
  
  // Scanned item state
  const [scannedResult, setScannedResult] = useState<ScannedResult | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  
  // Manual & File Input state
  const [manualCode, setManualCode] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // References
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isStartingRef = useRef(false);
  const isStoppingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const readerElementId = 'qr-code-scanner-element';

  // Audio tone feedback synthesizer
  const playBeep = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // 880 Hz
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch {
      // Audio autoplay restriction or unsupported
    }
  }, []);

  // Safe scanner stop
  const stopScanner = useCallback(async () => {
    if (isStoppingRef.current || !scannerRef.current) return;
    isStoppingRef.current = true;
    try {
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
      setIsCameraActive(false);
      setIsTorchOn(false);
      setHasTorchSupport(false);
    } catch (err) {
      console.warn('Scanner stop error:', err);
    } finally {
      isStoppingRef.current = false;
    }
  }, []);

  // Code normalization and parsing
  const parseScannedText = useCallback((raw: string): string => {
    let text = raw.trim();
    // Check if URL
    try {
      if (text.startsWith('http://') || text.startsWith('https://')) {
        const url = new URL(text);
        const qCode = url.searchParams.get('code') || url.searchParams.get('sku') || url.searchParams.get('id') || url.searchParams.get('barcode');
        if (qCode) return qCode.trim();
        const segments = url.pathname.split('/').filter(Boolean);
        if (segments.length > 0) return decodeURIComponent(segments[segments.length - 1]).trim();
      }
    } catch {
      // ignore URL parsing
    }

    // Check if JSON
    if (text.startsWith('{') && text.endsWith('}')) {
      try {
        const obj = JSON.parse(text);
        if (obj.sku || obj.barcode || obj.code || obj.id) {
          return String(obj.sku || obj.barcode || obj.code || obj.id).trim();
        }
      } catch {
        // ignore JSON parsing
      }
    }

    // Strip common prefixes
    text = text.replace(/^(item|sku|code|mat|barcode):/i, '').trim();
    return text;
  }, []);

  // Process decoded code
  const handleDecoded = useCallback((rawText: string) => {
    playBeep();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(100); } catch {}
    }

    const code = parseScannedText(rawText);
    const cleanLower = code.toLowerCase();
    
    // Look up in central inventory items by SKU, Barcode, Code, ID, or Name
    const matched = items.find(i => 
      (i.sku && i.sku.toLowerCase() === cleanLower) ||
      (i.barcode && i.barcode.toLowerCase() === cleanLower) ||
      i.code.toLowerCase() === cleanLower || 
      i.id.toLowerCase() === cleanLower ||
      i.name.toLowerCase() === cleanLower
    ) || null;

    setScannedResult({
      code,
      rawText,
      item: matched,
      timestamp: new Date().toLocaleTimeString('th-TH')
    });

    // Pause camera when showing result
    stopScanner();
  }, [items, parseScannedText, playBeep, stopScanner]);

  // Hardware USB/Bluetooth Barcode Scanner Gun Listener
  useEffect(() => {
    if (!isOpen) return;

    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is deliberately typing in a text field
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const now = Date.now();
      // Hardware scanners typically dump characters with < 50ms intervals
      if (now - lastKeyTime > 160) {
        buffer = '';
      }
      lastKeyTime = now;

      if (e.key === 'Enter') {
        const trimmed = buffer.trim();
        if (trimmed.length >= 2) {
          e.preventDefault();
          handleDecoded(trimmed);
          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleDecoded]);

  // Start camera
  const startCamera = useCallback(async (cameraId?: string) => {
    if (!isOpen || activeTab !== 'camera' || isStartingRef.current || isStoppingRef.current) return;
    
    // Wait for DOM element
    const container = document.getElementById(readerElementId);
    if (!container) return;

    isStartingRef.current = true;
    setCameraError(null);

    try {
      // Stop current instance if active
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(readerElementId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
          ],
          verbose: false,
        });
      }

      // Camera configuration
      const cameraConfig = cameraId 
        ? { deviceId: { exact: cameraId } } 
        : { facingMode: 'environment' };

      await scannerRef.current.start(
        cameraConfig,
        {
          fps: 12,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const size = Math.max(180, Math.floor(minEdge * 0.72));
            return { width: size, height: size };
          },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleDecoded(decodedText);
        },
        () => {
          // Frame scanner misses are normal during active search
        }
      );

      setIsCameraActive(true);

      // Check torch/flashlight capability
      try {
        const stream = (scannerRef.current as unknown as { localMediaStream?: MediaStream }).localMediaStream;
        const track = stream?.getVideoTracks?.()[0];
        if (track) {
          const capabilities = (track as unknown as { getCapabilities?: () => { torch?: boolean } }).getCapabilities?.();
          setHasTorchSupport(Boolean(capabilities?.torch));
        }
      } catch {
        setHasTorchSupport(false);
      }

    } catch (err: unknown) {
      console.error('Camera start error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
        setCameraError(isEnglish ? 'Camera permission was denied. Please allow camera access in browser settings.' : 'ไม่อนุญาตให้เข้าถึงกล้อง กรุณาเปิดสิทธิ์การใช้กล้องในเบราว์เซอร์');
      } else if (msg.includes('NotFoundError') || msg.includes('DevicesNotFoundError')) {
        setCameraError(isEnglish ? 'No camera device found on this system.' : 'ไม่พบอุปกรณ์กล้องบนอุปกรณ์นี้');
      } else {
        setCameraError(isEnglish ? `Unable to start camera: ${msg}` : `ไม่สามารถเปิดใช้งานกล้องได้: ${msg}`);
      }
      setIsCameraActive(false);
    } finally {
      isStartingRef.current = false;
    }
  }, [isOpen, activeTab, readerElementId, handleDecoded, isEnglish]);

  // Enumerate cameras when opening modal
  useEffect(() => {
    if (!isOpen) return;

    let isSubscribed = true;
    Html5Qrcode.getCameras()
      .then(devices => {
        if (!isSubscribed) return;
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer environment / rear facing camera if available
          const backCam = devices.find(d => 
            d.label.toLowerCase().includes('back') || 
            d.label.toLowerCase().includes('rear') || 
            d.label.toLowerCase().includes('environment')
          );
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        }
      })
      .catch(err => {
        console.warn('Unable to get cameras:', err);
      });

    return () => {
      isSubscribed = false;
    };
  }, [isOpen]);

  // Manage scanner lifecycle on isOpen / activeTab change
  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !scannedResult) {
      const timer = setTimeout(() => {
        startCamera(selectedCameraId);
      }, 150);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen, activeTab, selectedCameraId, scannedResult, startCamera, stopScanner]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(() => {}).finally(() => {
            scannerRef.current?.clear();
            scannerRef.current = null;
          });
        } else {
          try { scannerRef.current.clear(); } catch {}
          scannerRef.current = null;
        }
      }
    };
  }, []);

  // Torch toggle handler
  const handleToggleTorch = async () => {
    if (!scannerRef.current || !scannerRef.current.isScanning) return;
    try {
      const stream = (scannerRef.current as unknown as { localMediaStream?: MediaStream }).localMediaStream;
      const track = stream?.getVideoTracks?.()[0];
      if (track && 'applyConstraints' in track) {
        const nextTorch = !isTorchOn;
        await (track as unknown as { applyConstraints: (c: unknown) => Promise<void> }).applyConstraints({
          advanced: [{ torch: nextTorch }]
        });
        setIsTorchOn(nextTorch);
      }
    } catch (err) {
      console.warn('Torch toggle error:', err);
    }
  };

  // Image file scan handler
  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setUploadError(null);

    let tempScanner: Html5Qrcode | null = null;
    try {
      tempScanner = new Html5Qrcode('qr-file-scan-temp', false);
      const decodedResult = await tempScanner.scanFile(file, true);
      handleDecoded(decodedResult);
    } catch (err) {
      console.error('File scan error:', err);
      setUploadError(isEnglish 
        ? 'Could not detect a clear QR Code or Barcode from this image. Please try another photo.' 
        : 'ไม่พบ QR Code หรือ Barcode ที่ชัดเจนในภาพนี้ กรุณาลองอัปโหลดรูปภาพอื่น');
    } finally {
      if (tempScanner) {
        try { tempScanner.clear(); } catch {}
      }
      setIsProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Manual submission handler
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleDecoded(manualCode);
  };

  // Quick test sample selection
  const handleSelectSample = (code: string) => {
    setManualCode(code);
    handleDecoded(code);
  };

  // Reset to scan next
  const handleScanNext = () => {
    setScannedResult(null);
    setCopiedCode(false);
    if (activeTab === 'camera') {
      setTimeout(() => {
        startCamera(selectedCameraId);
      }, 100);
    }
  };

  // Copy code to clipboard
  const handleCopyCode = () => {
    if (!scannedResult) return;
    navigator.clipboard.writeText(scannedResult.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity" 
        onClick={() => {
          stopScanner();
          onClose();
        }} 
      />

      {/* Hidden container for temp file decoding */}
      <div id="qr-file-scan-temp" className="hidden" />

      {/* Main Scanner Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 z-10 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {isEnglish ? 'Scan SKU Barcode & QR Code' : 'สแกนบาร์โค้ด SKU & QR Code'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isEnglish ? 'Camera, USB Barcode Gun, or manual SKU search' : 'กล้องสด, เครื่องยิงบาร์โค้ด หรือค้นหารหัส Master SKU'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            title={isEnglish ? 'Close' : 'ปิด'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (Disabled while showing result) */}
        {!scannedResult && (
          <div className="flex border-b border-slate-100 bg-slate-100/60 p-1.5 gap-1.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('camera')}
              className={cn(
                "flex-1 flex items-center justify-center py-2 px-3 rounded-lg transition-all gap-1.5",
                activeTab === 'camera'
                  ? "bg-white text-indigo-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              )}
            >
              <Camera className="w-4 h-4" />
              <span>{isEnglish ? 'Live Camera' : 'กล้องสแกนสด'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={cn(
                "flex-1 flex items-center justify-center py-2 px-3 rounded-lg transition-all gap-1.5",
                activeTab === 'upload'
                  ? "bg-white text-indigo-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              )}
            >
              <Upload className="w-4 h-4" />
              <span>{isEnglish ? 'Upload Image' : 'อัปโหลดรูป'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={cn(
                "flex-1 flex items-center justify-center py-2 px-3 rounded-lg transition-all gap-1.5",
                activeTab === 'manual'
                  ? "bg-white text-indigo-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              )}
            >
              <Keyboard className="w-4 h-4" />
              <span>{isEnglish ? 'Manual Code' : 'กรอกรหัส'}</span>
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto">
          
          {/* RESULT STATE */}
          {scannedResult ? (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500 text-white shrink-0 mt-0.5 shadow-xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    {isEnglish ? 'Code Scanned Successfully' : 'สแกนรหัสสำเร็จ'}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-lg font-mono font-black text-slate-900 truncate">
                      {scannedResult.code}
                    </p>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-emerald-100 transition-colors shrink-0"
                      title={isEnglish ? 'Copy code' : 'คัดลอกรหัส'}
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {isEnglish ? `Detected at ${scannedResult.timestamp}` : `เวลาตรวจพบ: ${scannedResult.timestamp}`}
                  </p>
                </div>
              </div>

              {/* Matched Inventory Item Card */}
              {scannedResult.item ? (
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 mt-0.5">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm leading-snug">
                          {scannedResult.item.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                            <Tag className="w-3 h-3 text-indigo-600" />
                            {scannedResult.item.sku || scannedResult.item.code}
                          </span>
                          {scannedResult.item.barcode && (
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                              <Barcode className="w-3 h-3 text-slate-500" />
                              {scannedResult.item.barcode}
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-semibold">
                            {scannedResult.item.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Platform Central Warehouse Indicator */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-slate-600 flex items-center gap-1">
                        <Store className="w-3 h-3 text-emerald-600" />
                        {scannedResult.item.centralWarehouse || 'คลังสินค้ากลาง (Central WH)'}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        Single Physical Hub
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-200/60">
                      <span className="text-[10px] text-slate-400 font-medium">ตัดสต็อกร่วม:</span>
                      {(scannedResult.item.platforms || ['Shopee', 'Lazada', 'TikTok Shop', 'POS']).map(p => (
                        <span key={p} className="text-[9.5px] font-bold bg-white text-slate-700 px-1.5 py-0.2 rounded border border-slate-200">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-slate-500 font-medium block">
                        {isEnglish ? 'Stock Balance' : 'ยอดคงเหลือ'}
                      </span>
                      <span className={cn(
                        "font-black font-mono text-base",
                        scannedResult.item.quantity <= scannedResult.item.minStockLevel ? "text-red-600" : "text-indigo-600"
                      )}>
                        {scannedResult.item.quantity} {scannedResult.item.unit}
                      </span>
                      {scannedResult.item.quantity <= scannedResult.item.minStockLevel && (
                        <span className="block text-[10px] text-red-500 font-bold mt-0.5">
                          {isEnglish ? '⚠️ Low stock' : '⚠️ สต็อกต่ำกว่าขั้นต่ำ'}
                        </span>
                      )}
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-slate-500 font-medium block flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {isEnglish ? 'Location' : 'สถานที่จัดเก็บ'}
                      </span>
                      <span className="font-bold text-slate-800 text-sm block mt-0.5 truncate">
                        {scannedResult.item.binLocation || scannedResult.item.location}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {isEnglish ? `Min: ${scannedResult.item.minStockLevel} ${scannedResult.item.unit}` : `ขั้นต่ำ: ${scannedResult.item.minStockLevel} ${scannedResult.item.unit}`}
                      </span>
                    </div>
                  </div>

                  {/* Actions for matched item */}
                  <div className="pt-2 space-y-2">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {isEnglish ? 'Choose Action for this item:' : 'เลือกการทำงานสำหรับสินค้านี้:'}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectAction && scannedResult.item) {
                            onSelectAction('transact', scannedResult.item);
                          } else {
                            onScan(scannedResult.code);
                          }
                        }}
                        className="flex items-center justify-center gap-2 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                      >
                        <ArrowDownUp className="w-4 h-4" />
                        <span>{isEnglish ? 'Receive / Issue Stock' : 'รับเข้า / เบิกออก'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectAction && scannedResult.item) {
                            onSelectAction('count', scannedResult.item);
                          } else {
                            onScan(scannedResult.code);
                          }
                        }}
                        className="flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                      >
                        <CheckSquare className="w-4 h-4" />
                        <span>{isEnglish ? 'Physical Stock Count' : 'ตรวจนับสต็อกจริง'}</span>
                      </button>

                      {onPrintLabel ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (scannedResult.item) {
                              onPrintLabel(scannedResult.item);
                            }
                          }}
                          className="flex items-center justify-center gap-2 py-2 px-3 border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors"
                        >
                          <Barcode className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{isEnglish ? 'Print SKU Barcode' : 'พิมพ์ป้ายบาร์โค้ด SKU'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectAction && scannedResult.item) {
                              onSelectAction('view', scannedResult.item);
                            } else {
                              onScan(scannedResult.code);
                            }
                          }}
                          className="flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>{isEnglish ? 'View Item Details' : 'ดูข้อมูลสินค้า'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleScanNext}
                        className="flex items-center justify-center gap-2 py-2 px-3 border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{isEnglish ? 'Scan Next Item' : 'สแกนชิ้นถัดไป'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Item Not Found in Inventory */
                <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 space-y-3">
                  <div className="flex items-center gap-2.5 text-amber-800">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm">
                        {isEnglish ? 'Item Not Found in Inventory' : 'ไม่พบรายการสินค้านี้ในระบบ'}
                      </h4>
                      <p className="text-xs text-amber-700 mt-0.5">
                        {isEnglish 
                          ? `Code "${scannedResult.code}" does not match any current stock item.` 
                          : `รหัส "${scannedResult.code}" ยังไม่มีบันทึกในฐานข้อมูลคลังสินค้า`}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleScanNext}
                      className="flex-1 py-2 px-3 bg-white border border-amber-300 text-amber-800 font-bold rounded-lg text-xs hover:bg-amber-100/60 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{isEnglish ? 'Scan Again' : 'สแกนใหม่'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onScan(scannedResult.code)}
                      className="flex-1 py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
                    >
                      {isEnglish ? 'Proceed With Code' : 'ใช้รหัสนี้ต่อ'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* SCANNING MODES */
            <div>
              {/* TAB 1: LIVE CAMERA */}
              {activeTab === 'camera' && (
                <div className="space-y-3">
                  {/* Camera Controls bar */}
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      {cameras.length > 1 && (
                        <select
                          value={selectedCameraId}
                          onChange={(e) => {
                            setSelectedCameraId(e.target.value);
                            startCamera(e.target.value);
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none border border-slate-200 cursor-pointer max-w-[200px] truncate"
                        >
                          {cameras.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.label || `Camera ${c.id.substring(0, 5)}`}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                      {hasTorchSupport && (
                        <button
                          type="button"
                          onClick={handleToggleTorch}
                          className={cn(
                            "flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-colors",
                            isTorchOn 
                              ? "bg-amber-500 text-white border-amber-600" 
                              : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                          )}
                          title={isEnglish ? 'Toggle Torch' : 'เปิด/ปิดไฟฉาย'}
                        >
                          {isTorchOn ? <Zap className="w-3.5 h-3.5 fill-current" /> : <ZapOff className="w-3.5 h-3.5" />}
                          <span>{isTorchOn ? (isEnglish ? 'Torch On' : 'ไฟฉายเปิด') : (isEnglish ? 'Torch' : 'ไฟฉาย')}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => startCamera(selectedCameraId)}
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 transition-colors"
                        title={isEnglish ? 'Restart camera' : 'เริ่มกล้องใหม่'}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Viewfinder Video Container */}
                  <div className="relative w-full aspect-square max-w-[340px] mx-auto bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border-2 border-slate-800">
                    
                    {/* Html5Qrcode video mount target */}
                    <div 
                      id={readerElementId} 
                      className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center [&>video]:w-full [&>video]:h-full [&>video]:object-cover" 
                    />

                    {/* HUD Scanner Framing Overlay */}
                    {isCameraActive && (
                      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                        {/* Target Box with glowing corners */}
                        <div className="relative w-[220px] h-[220px] border border-white/20 rounded-2xl">
                          {/* Corner brackets */}
                          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-indigo-400 rounded-br-lg shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                          
                          {/* Animated laser beam */}
                          <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_rgba(52,211,153,1)] animate-[scan_2.2s_ease-in-out_infinite]" />
                        </div>

                        {/* Helper guidance */}
                        <div className="absolute bottom-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[11px] font-bold text-white tracking-wide">
                            {isEnglish ? 'Align QR or Barcode in frame' : 'เล็ง QR Code หรือ Barcode ในกรอบ'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Camera Loading state */}
                    {!isCameraActive && !cameraError && (
                      <div className="flex flex-col items-center justify-center text-slate-400 p-6 text-center space-y-2 z-10">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                        <p className="text-xs font-semibold text-slate-300">
                          {isEnglish ? 'Starting camera...' : 'กำลังเปิดใช้งานกล้อง...'}
                        </p>
                      </div>
                    )}

                    {/* Camera Error state */}
                    {cameraError && (
                      <div className="flex flex-col items-center justify-center text-slate-200 p-6 text-center space-y-3 z-10 bg-slate-900/90 absolute inset-0">
                        <CameraOff className="w-10 h-10 text-red-400 mb-1" />
                        <p className="text-xs font-bold text-red-300 max-w-[260px] leading-relaxed">
                          {cameraError}
                        </p>
                        <div className="flex flex-col gap-2 w-full max-w-[200px]">
                          <button
                            type="button"
                            onClick={() => startCamera(selectedCameraId)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>{isEnglish ? 'Retry Camera' : 'ลองใหม่อีกครั้ง'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab('manual')}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold border border-slate-700 transition-colors"
                          >
                            {isEnglish ? 'Type Code Manually' : 'สลับไปกรอกรหัส'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: UPLOAD IMAGE */}
              {activeTab === 'upload' && (
                <div className="space-y-4 py-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileScan}
                    className="hidden"
                  />

                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/70 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-indigo-100 group-hover:bg-indigo-200 text-indigo-600 flex items-center justify-center mb-3 transition-colors shadow-xs">
                      {isProcessingFile ? (
                        <Loader2 className="w-7 h-7 animate-spin" />
                      ) : (
                        <Upload className="w-7 h-7" />
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">
                      {isEnglish ? 'Click to upload QR image' : 'คลิกเพื่อเลือกไฟล์รูปภาพ QR Code'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-[240px]">
                      {isEnglish ? 'Supports PNG, JPG, WebP photo of barcodes or QR codes' : 'รองรับรูปถ่ายหรือแคปหน้าจอ QR Code / Barcode (PNG, JPG)'}
                    </p>
                  </div>

                  {uploadError && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: MANUAL INPUT & QUICK SAMPLES */}
              {activeTab === 'manual' && (
                <div className="space-y-4 py-2">
                  <form onSubmit={handleManualSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {isEnglish ? 'Enter SKU / Item Code:' : 'ระบุรหัสสินค้า (SKU / Code):'}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={manualCode}
                          onChange={(e) => setManualCode(e.target.value)}
                          placeholder="เช่น MAT-CEM-01, MAT-STL-24"
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono font-bold focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                        >
                          {isEnglish ? 'Check Code' : 'ตรวจสอบ'}
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Sample test items */}
                  {items.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <p className="text-xs font-bold text-slate-500">
                        {isEnglish ? 'Quick Test - Click any stock item below:' : 'คลิกเพื่อทดสอบรหัสสินค้าในสต็อกทันที:'}
                      </p>
                      <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto">
                        {items.slice(0, 8).map(item => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelectSample(item.code)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/60 text-slate-700 text-xs transition-colors text-left"
                          >
                            <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                            <span className="font-mono font-bold">{item.code}</span>
                            <span className="text-[11px] text-slate-400 truncate max-w-[120px]">({item.name})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>{isEnglish ? 'ProcureSync Inventory Barcode & QR Engine' : 'ระบบตรวจจับ QR & Barcode สต็อกสินค้า'}</span>
          <button
            type="button"
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="px-3 py-1.5 text-slate-600 hover:text-slate-800 font-bold hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            {isEnglish ? 'Close' : 'ปิด'}
          </button>
        </div>

      </div>

      {/* Laser scan animation styles */}
      <style>{`
        @keyframes scan {
          0% { top: 6%; opacity: 0.9; }
          50% { top: 92%; opacity: 1; }
          100% { top: 6%; opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
