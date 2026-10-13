import React, { useState, useMemo } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Layers, 
  Store, 
  Copy, 
  Check, 
  Sparkles,
  MapPin,
  Tag,
  Sliders,
  CheckCircle2,
  Box,
  Share2,
  Building2
} from 'lucide-react';
import { SkuBarcode, generateBarcodeDataUrl } from './SkuBarcode';
import type { InventoryItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useProcurement } from '../contexts/ProcurementContext';
import { cn } from '../lib/utils';

export interface SkuBarcodeLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

type LabelTemplate = 'thermal-compact' | 'standard-hub' | 'shelf-bin' | 'a4-sheet';

export function SkuBarcodeLabelModal({
  isOpen,
  onClose,
  item
}: SkuBarcodeLabelModalProps) {
  const { isEnglish } = useLanguage();
  const { companyProfile } = useProcurement();
  const [template, setTemplate] = useState<LabelTemplate>('standard-hub');
  const [printCopies, setPrintCopies] = useState<number>(1);
  const [barcodeFormat, setBarcodeFormat] = useState<'CODE128' | 'EAN13' | 'CODE39'>('CODE128');
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [showLocation, setShowLocation] = useState<boolean>(true);
  const [showProjects, setShowProjects] = useState<boolean>(true);
  const [copiedSku, setCopiedSku] = useState<boolean>(false);

  // Compute Master SKU and Barcode values
  const masterSku = useMemo(() => {
    if (!item) return '';
    return item.sku || item.code || `SKU-${item.id}`;
  }, [item]);

  const barcodeValue = useMemo(() => {
    if (!item) return '';
    return item.barcode || item.sku || item.code;
  }, [item]);

  const connectedProjects = useMemo(() => {
    if (!item?.projectAllocations || item.projectAllocations.length === 0) {
      return ['โครงการ คอนโดสุขุมวิท 101', 'โครงการ โรงพยาบาลบางนา', 'สโตร์กลาง'];
    }
    return item.projectAllocations;
  }, [item]);

  const centralWarehouseName = item?.centralWarehouse || 'คลังพัสดุก่อสร้างกลาง (Central Material Hub)';
  const storageBin = item?.binLocation || item?.location || 'โซนจัดเก็บ A-01';

  if (!isOpen || !item) return null;

  const handleCopySku = () => {
    navigator.clipboard.writeText(masterSku);
    setCopiedSku(true);
    setTimeout(() => setCopiedSku(false), 2000);
  };

  const handleDownloadPng = () => {
    const dataUrl = generateBarcodeDataUrl(barcodeValue, {
      format: barcodeFormat,
      width: 2.2,
      height: 64,
      displayValue: true,
      text: `${masterSku} • ${barcodeValue}`
    });
    if (!dataUrl) return;

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `Barcode_${masterSku}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;

    const barcodeDataUrl = generateBarcodeDataUrl(barcodeValue, {
      format: barcodeFormat,
      width: template === 'thermal-compact' ? 1.8 : 2.2,
      height: template === 'thermal-compact' ? 48 : 60,
      displayValue: true,
      text: masterSku
    });

    const isThermal = template === 'thermal-compact';
    const isShelf = template === 'shelf-bin';
    const isSheet = template === 'a4-sheet';

    const copiesCount = isSheet ? Math.max(1, Math.min(printCopies, 24)) : Math.max(1, printCopies);

    // Generate repeated labels HTML
    let labelsHtml = '';
    for (let i = 0; i < copiesCount; i++) {
      labelsHtml += `
        <div class="label-card ${template}">
          <div class="header-row">
            <span class="wh-tag">${((companyProfile?.nameEn || companyProfile?.nameTh || 'CONERAGE STORE').toUpperCase())} • CENTRAL HUB</span>
            <span class="hub-badge">STORE-HUB</span>
          </div>

          <div class="title-row">
            <div class="item-name">${item.name}</div>
            <div class="category-pill">${item.category}</div>
          </div>

          <div class="barcode-container">
            <img class="barcode-img" src="${barcodeDataUrl}" alt="${masterSku}" />
          </div>

          <div class="sku-meta-row">
            <div class="meta-item">
              <span class="meta-label">MASTER SKU:</span>
              <span class="sku-value">${masterSku}</span>
            </div>
            ${showLocation ? `
            <div class="meta-item loc-item">
              <span class="meta-label">BIN / LOCATION:</span>
              <span class="loc-value">${storageBin}</span>
            </div>
            ` : ''}
          </div>

          ${showProjects ? `
          <div class="projects-row">
            <span class="sync-title">PROJECT / SITE:</span>
            ${connectedProjects.slice(0, 3).map(p => `<span class="project-chip">${p}</span>`).join(' ')}
          </div>
          ` : ''}

          <div class="footer-row">
            <span class="system-tag">${companyProfile?.nameTh || companyProfile?.nameEn || 'Conerage store'} WMS</span>
            ${showPrice && item.unitPrice ? `
            <span class="price-tag">@${item.unitPrice.toLocaleString()} ฿/${item.unit}</span>
            ` : ''}
            <span class="copy-tag">#${i + 1}/${copiesCount}</span>
          </div>
        </div>
      `;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Print SKU Barcode - ${masterSku}</title>
          <style>
            @page {
              size: ${isThermal ? '50mm 30mm' : isShelf ? '100mm 40mm' : isSheet ? 'A4 portrait' : '80mm 50mm'};
              margin: ${isThermal ? '2mm' : isSheet ? '8mm' : '4mm'};
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            body {
              margin: 0;
              padding: ${isSheet ? '10px' : '0'};
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #0f172a;
              background: #fff;
            }
            .labels-grid {
              display: ${isSheet ? 'grid' : 'flex'};
              ${isSheet ? 'grid-template-columns: repeat(3, 1fr); gap: 6mm;' : 'flex-direction: column; gap: 4mm;'}
            }
            .label-card {
              border: 1.5px solid #334155;
              border-radius: 6px;
              padding: ${isThermal ? '3mm' : '4mm'};
              background: #ffffff;
              page-break-inside: avoid;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              ${isThermal ? 'width: 48mm; height: 28mm; overflow: hidden;' : ''}
              ${isShelf ? 'width: 96mm; height: 38mm;' : ''}
              ${template === 'standard-hub' ? 'width: 76mm; height: 46mm;' : ''}
            }
            .header-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px solid #cbd5e1;
              padding-bottom: 2px;
              margin-bottom: 3px;
            }
            .wh-tag {
              font-size: 7px;
              font-weight: 800;
              letter-spacing: 0.5px;
              color: #1e293b;
              text-transform: uppercase;
            }
            .hub-badge {
              font-size: 6.5px;
              font-weight: 700;
              background: #0f172a;
              color: #fff;
              padding: 1px 3px;
              border-radius: 2px;
            }
            .title-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 4px;
              margin-bottom: 2px;
            }
            .item-name {
              font-size: ${isThermal ? '9px' : '11px'};
              font-weight: 800;
              line-height: 1.15;
              max-height: 2.3em;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .category-pill {
              font-size: 7px;
              background: #f1f5f9;
              border: 1px solid #cbd5e1;
              padding: 1px 3px;
              border-radius: 3px;
              white-space: nowrap;
              font-weight: 600;
            }
            .barcode-container {
              text-align: center;
              margin: 2px 0;
            }
            .barcode-img {
              max-width: 98%;
              height: ${isThermal ? '28px' : '38px'};
              display: block;
              margin: 0 auto;
            }
            .sku-meta-row {
              display: flex;
              justify-content: space-between;
              align-items: baseline;
              font-size: 8px;
              margin-top: 1px;
            }
            .meta-label {
              font-size: 6.5px;
              color: #64748b;
              font-weight: 700;
            }
            .sku-value {
              font-family: monospace;
              font-weight: 900;
              font-size: ${isThermal ? '9px' : '10px'};
              letter-spacing: 0.5px;
            }
            .loc-item {
              text-align: right;
            }
            .loc-value {
              font-weight: 800;
              color: #047857;
            }
            .projects-row {
              display: flex;
              align-items: center;
              gap: 2px;
              font-size: 6.5px;
              margin-top: 2px;
              border-top: 0.5px dashed #cbd5e1;
              padding-top: 2px;
              overflow: hidden;
            }
            .sync-title {
              font-weight: 700;
              color: #475569;
              font-size: 6px;
            }
            .project-chip {
              background: #f8fafc;
              border: 0.5px solid #94a3b8;
              border-radius: 2px;
              padding: 0 2px;
              font-size: 6px;
              font-weight: 600;
            }
            .footer-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 6.5px;
              color: #64748b;
              margin-top: 2px;
            }
            .price-tag {
              font-weight: 800;
              color: #0f172a;
            }
            .copy-tag {
              font-family: monospace;
              font-size: 6px;
            }
          </style>
        </head>
        <body>
          <div class="labels-grid">
            ${labelsHtml}
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-4 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-indigo-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-base leading-tight">
                  {isEnglish ? 'Master SKU Barcode Label' : 'ป้ายบาร์โค้ด SKU คลังสินค้ากลาง'}
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                  Code 128
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEnglish 
                  ? 'Central Construction Material Warehouse • Standard Barcodes for Project Site Requisition' 
                  : 'คลังพัสดุก่อสร้างกลาง • ป้ายบาร์โค้ดมาตรฐานสำหรับจัดเก็บและเบิกจ่ายไปยังไซต์งาน/โครงการ'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* Central Warehouse Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 rounded-xl shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    {centralWarehouseName}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[11px] text-emerald-400 font-medium">Single Construction Material Hub</span>
                </div>
                <div className="text-sm font-bold mt-1 text-white flex items-center gap-2">
                  <span>ตำแหน่งจัดเก็บ:</span>
                  <span className="text-amber-300 font-mono bg-white/10 px-2 py-0.5 rounded text-xs">
                    {storageBin}
                  </span>
                </div>
              </div>
              
              {/* Connected Project Sites Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-300 font-medium mr-1">ไซต์งาน/โครงการที่เบิกใช้:</span>
                {connectedProjects.map((proj) => (
                  <span 
                    key={proj} 
                    className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/15 text-white px-2 py-0.5 rounded-md border border-white/20"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {proj}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Grid: Preview (Left) vs Settings (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* Live Barcode Label Preview Card (Col 7) */}
            <div className="md:col-span-7 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  ตัวอย่างป้ายบาร์โค้ดจริง (Live Label Preview)
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {template === 'thermal-compact' && '50x30 mm (Thermal)'}
                  {template === 'standard-hub' && '75x50 mm (Warehouse)'}
                  {template === 'shelf-bin' && '100x40 mm (Shelf Tag)'}
                  {template === 'a4-sheet' && 'A4 Sheet (Multi)'}
                </span>
              </div>

              {/* Physical Sticker Card Container */}
              <div className="w-full bg-slate-100/80 p-5 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center shadow-inner min-h-[260px]">
                
                {/* Simulated Sticker Label */}
                <div 
                  className={cn(
                    "bg-white rounded-lg shadow-md border-2 border-slate-800 p-4 transition-all duration-200 select-none flex flex-col justify-between",
                    template === 'thermal-compact' && "w-[260px] min-h-[160px] p-3",
                    template === 'standard-hub' && "w-[320px] min-h-[220px]",
                    template === 'shelf-bin' && "w-[340px] min-h-[180px]",
                    template === 'a4-sheet' && "w-[300px] min-h-[200px]"
                  )}
                >
                  {/* Label Top Bar */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-1.5">
                    <span className="text-[9px] font-black tracking-widest text-slate-800 uppercase">
                      {(companyProfile?.nameEn || companyProfile?.nameTh || 'CONERAGE STORE').toUpperCase()} • CENTRAL HUB
                    </span>
                    <span className="text-[8px] font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded">
                      SINGLE-WH
                    </span>
                  </div>

                  {/* Item Name & Details */}
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black text-slate-900 line-clamp-2 leading-tight">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
                      <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200">
                        {item.category}
                      </span>
                      {showPrice && item.unitPrice && (
                        <span className="font-mono text-slate-800">
                          @{item.unitPrice.toLocaleString()} บ./{item.unit}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 1D Barcode Rendering */}
                  <div className="my-2 py-1 bg-white flex flex-col items-center justify-center border-y border-slate-100">
                    <SkuBarcode 
                      value={barcodeValue}
                      format={barcodeFormat}
                      width={template === 'thermal-compact' ? 1.7 : 2}
                      height={template === 'thermal-compact' ? 44 : 54}
                      displayValue={true}
                      fontSize={11}
                      text={masterSku}
                    />
                  </div>

                  {/* SKU & Storage Bin Info */}
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between text-[11px] pt-0.5">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Master SKU</span>
                        <span className="font-mono font-black text-slate-900 tracking-wider">
                          {masterSku}
                        </span>
                      </div>
                      {showLocation && (
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">จุดเก็บในคลัง</span>
                          <span className="font-bold text-emerald-700 text-[11px]">
                            {storageBin}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Projects Allocated Badges */}
                    {showProjects && (
                      <div className="border-t border-dashed border-slate-200 pt-1.5 flex items-center justify-between">
                        <span className="text-[8px] font-bold text-slate-400 uppercase">PROJECT / SITE:</span>
                        <div className="flex items-center gap-1 flex-wrap justify-end">
                          {connectedProjects.slice(0, 3).map(p => (
                            <span key={p} className="text-[8px] font-bold bg-slate-100 text-slate-700 px-1 py-0.2 rounded">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SKU Quick Copy */}
              <div className="mt-3 flex items-center gap-2 w-full justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-slate-400 font-bold">Master SKU:</span>
                  <span className="font-mono font-bold text-indigo-700 truncate">{masterSku}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopySku}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-semibold transition-colors shrink-0 shadow-2xs"
                >
                  {copiedSku ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">คัดลอกแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>คัดลอก SKU</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Label Controls & Options (Col 5) */}
            <div className="md:col-span-5 space-y-4">
              
              {/* Template Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  รูปแบบขนาดสติกเกอร์ (Label Template)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTemplate('standard-hub')}
                    className={cn(
                      "p-2.5 rounded-xl border text-left transition-all",
                      template === 'standard-hub'
                        ? "border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold ring-1 ring-indigo-500"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    )}
                  >
                    <div className="text-xs font-bold">ป้ายคลังกลาง 75x50</div>
                    <div className="text-[10px] text-slate-500">มาตรฐานติดกล่อง/พาเลท</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTemplate('thermal-compact')}
                    className={cn(
                      "p-2.5 rounded-xl border text-left transition-all",
                      template === 'thermal-compact'
                        ? "border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold ring-1 ring-indigo-500"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    )}
                  >
                    <div className="text-xs font-bold">ความร้อน 50x30</div>
                    <div className="text-[10px] text-slate-500">เครื่องพิมพ์พกพา/ติดสินค้า</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTemplate('shelf-bin')}
                    className={cn(
                      "p-2.5 rounded-xl border text-left transition-all",
                      template === 'shelf-bin'
                        ? "border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold ring-1 ring-indigo-500"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    )}
                  >
                    <div className="text-xs font-bold">ป้ายติดชั้นวาง Rack</div>
                    <div className="text-[10px] text-slate-500">ยิงบาร์โค้ดหน้าชั้นวาง</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTemplate('a4-sheet')}
                    className={cn(
                      "p-2.5 rounded-xl border text-left transition-all",
                      template === 'a4-sheet'
                        ? "border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold ring-1 ring-indigo-500"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    )}
                  >
                    <div className="text-xs font-bold">กระดาษ A4 รวมดวง</div>
                    <div className="text-[10px] text-slate-500">พิมพ์หลายดวงต่อแผ่น</div>
                  </button>
                </div>
              </div>

              {/* Barcode Format Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  มาตรฐานบาร์โค้ด 1D
                </label>
                <select
                  value={barcodeFormat}
                  onChange={(e) => setBarcodeFormat(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="CODE128">Code 128 (แนะนำ: สากลรองรับอักษร+ตัวเลข Master SKU)</option>
                  <option value="EAN13">EAN-13 (มาตรฐานบาร์โค้ดค้าปลีก 13 หลัก)</option>
                  <option value="CODE39">Code 39 (มาตรฐานอุตสาหกรรมชิ้นส่วน/คลังสินค้า)</option>
                </select>
              </div>

              {/* Print Copies Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    จำนวนดวงที่ต้องการพิมพ์ (Copies)
                  </label>
                  <button
                    type="button"
                    onClick={() => setPrintCopies(item.quantity || 1)}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    เท่าสต็อกจริง ({item.quantity} ดวง)
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={printCopies}
                    onChange={(e) => setPrintCopies(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                  />
                  <div className="flex items-center gap-1">
                    {[1, 5, 10, 50].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setPrintCopies(num)}
                        className={cn(
                          "px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors",
                          printCopies === num
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        )}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-600 block mb-1">
                  ตัวเลือกแสดงข้อมูลบนป้าย:
                </span>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLocation}
                    onChange={(e) => setShowLocation(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>แสดงตำแหน่งชั้นวางในคลัง (Bin / Rack Location)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showProjects}
                    onChange={(e) => setShowProjects(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>แสดงโครงการ/ไซต์งานที่เบิกใช้ (Allocated Projects)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPrice}
                    onChange={(e) => setShowPrice(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>แสดงราคาต่อหน่วย (Unit Price)</span>
                </label>
              </div>

              {/* Warehouse Operation Tip */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-amber-900 text-xs leading-relaxed">
                <span className="font-bold block flex items-center gap-1 text-amber-950">
                  <Box className="w-3.5 h-3.5 text-amber-700" />
                  มาตรฐานคลังพัสดุและวัสดุก่อสร้างกลาง:
                </span>
                แปะป้าย SKU Barcode ไว้ที่ชั้นวาง พาเลท หรือกล่องพัสดุก่อสร้าง เมื่อวิศวกรหรือโฟร์แมนทำใบเบิกพัสดุไปหน้างาน เจ้าหน้าที่คลังสามารถใช้เครื่องยิงบาร์โค้ดยิงสแกน SKU เพื่อตัดยอดสต็อกและยืนยันการจ่ายวัสดุไปยังไซต์งานได้อย่างถูกต้องทันที
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-2 w-full sm:w-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>พร้อมสั่งพิมพ์ {printCopies} ดวง หรือดาวน์โหลด PNG คุณภาพสูง</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleDownloadPng}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>{isEnglish ? 'Download PNG' : 'ดาวน์โหลดบาร์โค้ด'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>{isEnglish ? `Print ${printCopies} Labels` : `สั่งพิมพ์ป้าย (${printCopies} ดวง)`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
