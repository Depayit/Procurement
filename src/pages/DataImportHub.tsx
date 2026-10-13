import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  FileText, 
  Layers, 
  Database, 
  FileCheck2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Download, 
  RefreshCw, 
  Trash2, 
  Check, 
  Sparkles,
  History,
  FileCode,
  FileBox,
  Layers3,
  ExternalLink,
  Info,
  Cloud
} from 'lucide-react';
import { useProcurement } from '../contexts/ProcurementContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  parseAnyFile, 
  type ParsedDataResult 
} from '../lib/importers/fileParsers';
import { 
  classifyDataSet, 
  autoMapColumns, 
  normalizeImportedRows, 
  MODULE_DEFINITIONS, 
  type TargetModule 
} from '../lib/importers/dataClassifier';
import { 
  downloadSampleTemplate, 
  SAMPLE_INVENTORY_ITEMS, 
  SAMPLE_BOQ_PR_ITEMS, 
  SAMPLE_VENDORS, 
  SAMPLE_CAD_ENTITIES 
} from '../lib/importers/sampleTemplates';
import type { ImportMergeMode } from '../types';
import { Link, useSearchParams } from 'react-router-dom';

export function DataImportHub() {
  const { isEnglish } = useLanguage();
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTarget = (searchParams.get('target') as TargetModule) || 'inventory';

  const {
    bulkImportInventory,
    bulkImportVendors,
    bulkImportPRs,
    bulkImportPOs,
    importHistory,
    addImportHistoryRecord,
    clearImportHistory
  } = useProcurement();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'import' | 'history' | 'templates'>('import');

  // Step state: 1: upload, 2: mapping, 3: preview & execute, 4: complete
  const [currentStep, setCurrentStep] = useState<number>(1);

  // File & Parsing state
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedDataResult | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Classification & Mapping state
  const [targetModule, setTargetModule] = useState<TargetModule>(initialTarget);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [mergeMode, setMergeMode] = useState<ImportMergeMode>('merge');

  // Execution result
  const [importResult, setImportResult] = useState<{
    success: boolean;
    added: number;
    updated: number;
    total: number;
    module: TargetModule;
  } | null>(null);

  // Handle File Upload & Parsing
  const processUploadedFile = async (file: File) => {
    setIsParsing(true);
    setParseError(null);
    setImportResult(null);

    try {
      const result = await parseAnyFile(file);
      setParsedData(result);

      // Auto classify target module
      const detected = classifyDataSet(result.headers, result.rawRows);
      setTargetModule(detected);

      // Auto map columns
      const mapping = autoMapColumns(result.headers, detected);
      setColumnMapping(mapping);

      setCurrentStep(2);
    } catch (err: any) {
      console.error('File parsing error:', err);
      setParseError(err.message || 'เกิดข้อผิดพลาดในการอ่านไฟล์ กรุณาตรวจสอบรูปแบบไฟล์');
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  // Quick Mock / Demo Loader
  const handleLoadDemoData = (demoType: 'inventory' | 'pr' | 'cad' | 'vendors') => {
    setIsParsing(true);
    setParseError(null);

    setTimeout(() => {
      let mockResult: ParsedDataResult;

      if (demoType === 'inventory') {
        mockResult = {
          fileName: 'Master_Central_Inventory_2026.xlsx',
          fileType: 'excel',
          fileSizeFormatted: '48.5 KB',
          sheets: ['คลังพัสดุกลาง'],
          headers: Object.keys(SAMPLE_INVENTORY_ITEMS[0]),
          rawRows: SAMPLE_INVENTORY_ITEMS
        };
      } else if (demoType === 'cad') {
        mockResult = {
          fileName: 'Floor2_Structural_Takeoff.dxf',
          fileType: 'cad',
          fileSizeFormatted: '184.2 KB',
          headers: Object.keys(SAMPLE_CAD_ENTITIES[0]),
          rawRows: SAMPLE_CAD_ENTITIES,
          cadMetadata: {
            format: 'DXF',
            layersCount: 5,
            layers: ['S-BEAM', 'S-COL', 'S-SLAB', 'M-PIPE-EMT', 'E-CABLE-THW'],
            extractedMaterialsCount: 5,
            drawingVersion: 'AutoCAD 2024 / ASCII DXF'
          }
        };
      } else if (demoType === 'vendors') {
        mockResult = {
          fileName: 'Approved_Subcontractors_Vendors.csv',
          fileType: 'csv',
          fileSizeFormatted: '32.1 KB',
          headers: Object.keys(SAMPLE_VENDORS[0]),
          rawRows: SAMPLE_VENDORS
        };
      } else {
        mockResult = {
          fileName: 'BOQ_Requisition_Rama9.xlsx',
          fileType: 'excel',
          fileSizeFormatted: '38.0 KB',
          sheets: ['รายการขอซื้อBOQ'],
          headers: Object.keys(SAMPLE_BOQ_PR_ITEMS[0]),
          rawRows: SAMPLE_BOQ_PR_ITEMS
        };
      }

      setParsedData(mockResult);
      const detected = demoType === 'cad' ? 'pr' : classifyDataSet(mockResult.headers, mockResult.rawRows);
      setTargetModule(detected);
      const mapping = autoMapColumns(mockResult.headers, detected);
      setColumnMapping(mapping);
      setIsParsing(false);
      setCurrentStep(2);
    }, 400);
  };

  // Switch Module in Step 2
  const handleTargetModuleChange = (newMod: TargetModule) => {
    setTargetModule(newMod);
    if (parsedData) {
      const mapping = autoMapColumns(parsedData.headers, newMod);
      setColumnMapping(mapping);
    }
  };

  // Normalized Rows preview
  const normalizedData = parsedData 
    ? normalizeImportedRows(parsedData.rawRows, columnMapping, targetModule)
    : { validRows: [], errorRows: [] };

  // Execute Import
  const handleExecuteImport = () => {
    if (!parsedData || normalizedData.validRows.length === 0) return;

    let added = 0;
    let updated = 0;
    const total = normalizedData.validRows.length;
    const uName = currentUser?.name || 'Admin / เจ้าหน้าที่นำเข้า';

    if (targetModule === 'inventory') {
      const res = bulkImportInventory(normalizedData.validRows, mergeMode);
      added = res.added;
      updated = res.updated;
    } else if (targetModule === 'vendors') {
      const res = bulkImportVendors(normalizedData.validRows, mergeMode);
      added = res.added;
      updated = res.updated;
    } else if (targetModule === 'pr') {
      // Create consolidated PR or multiple PR items
      const prItems = normalizedData.validRows.map((row, idx) => ({
        id: row.id || `pri_imp_${Date.now()}_${idx}`,
        description: row.description || row.name || 'รายการวัสดุ',
        specification: row.specification || '',
        quantity: Number(row.quantity) || 1,
        unit: row.unit || 'หน่วย',
        unitPrice: Number(row.unitPrice) || 0,
        remark: row.remark || `นำเข้าจากไฟล์ ${parsedData.fileName}`
      }));

      const res = bulkImportPRs([{
        prNumber: `PR-IMP-${Math.floor(100 + Math.random() * 900)}`,
        requesterName: normalizedData.validRows[0]?.requesterName || uName,
        department: normalizedData.validRows[0]?.department || 'โครงการ คอนโดสุขุมวิท 101',
        projectCode: normalizedData.validRows[0]?.projectCode || 'PRJ-SKV101',
        status: 'Draft',
        requestDate: new Date().toISOString(),
        justification: `นำเข้ารายการวัสดุ/BOQ จากไฟล์ ${parsedData.fileName}`,
        totalAmount: prItems.reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0),
        items: prItems
      }]);
      added = res.added;
    } else if (targetModule === 'po') {
      const poItems = normalizedData.validRows.map((row, idx) => ({
        id: row.id || `poi_imp_${Date.now()}_${idx}`,
        description: row.description || row.name || 'รายการสินค้า',
        specification: row.specification || '',
        quantity: Number(row.quantity) || 1,
        unit: row.unit || 'หน่วย',
        unitPrice: Number(row.unitPrice) || 0,
        receivedQuantity: 0
      }));

      const res = bulkImportPOs([{
        poNumber: `PO-IMP-${Math.floor(100 + Math.random() * 900)}`,
        prNumber: 'PR-IMPORTED',
        vendorName: normalizedData.validRows[0]?.suggestedVendor || 'ซัพพลายเออร์นำเข้า',
        status: 'Draft',
        date: new Date().toISOString(),
        totalAmount: poItems.reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0),
        items: poItems
      }]);
      added = res.added;
    }

    // Save into history log
    addImportHistoryRecord({
      fileName: parsedData.fileName,
      fileType: parsedData.fileType.toUpperCase(),
      targetModule,
      totalRows: total,
      successCount: added + updated,
      errorCount: normalizedData.errorRows.length,
      mode: mergeMode,
      importedBy: uName,
      notes: `ประมวลผลสำเร็จ ${added + updated} แถว (เพิ่มใหม่: ${added}, อัปเดต: ${updated})`
    });

    setImportResult({
      success: true,
      added,
      updated,
      total,
      module: targetModule
    });

    setCurrentStep(4);
  };

  const handleResetImport = () => {
    setParsedData(null);
    setParseError(null);
    setImportResult(null);
    setCurrentStep(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {isEnglish ? 'Universal Data Import' : 'ศูนย์นำเข้าข้อมูล (Data Import)'}
              </h1>
              <span className="heading-badge heading-badge-emerald shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                {isEnglish ? 'Auto-Detect' : 'จับคู่อัตโนมัติ'}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              {isEnglish 
                ? 'Import master data via Excel, CSV, CAD, PDF, Word, or JSON into Inventory and Vendors.' 
                : 'นำเข้าสต็อก พัสดุ BOQ และคู่ค้า จากไฟล์ Excel, CSV, CAD, PDF หรือ JSON'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-center shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'import'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            {isEnglish ? 'Import Wizard' : 'นำเข้าไฟล์ข้อมูล'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            {isEnglish ? 'History Log' : 'ประวัติการนำเข้า'}
            {importHistory.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-700">
                {importHistory.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'templates'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            {isEnglish ? 'Templates' : 'ดาวน์โหลดแม่แบบ'}
          </button>

          <Link
            to="/integrations"
            className="px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            title="เชื่อมต่อ Google Drive, Google Sheets, Dropbox และ LINE"
          >
            <Cloud className="w-3.5 h-3.5 text-indigo-600" />
            {isEnglish ? 'Cloud & Plugins' : 'เชื่อมต่อคลาวด์/API'}
          </Link>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: IMPORT WIZARD */}
      {/* ============================================================== */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          {/* Supported Format Badges Header */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Excel (.xlsx, .xls)', desc: 'สเปรดชีตรายการพัสดุ/BOQ', icon: FileSpreadsheet, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
              { label: 'CSV (.csv)', desc: 'ฐานข้อมูล Comma Separated', icon: Database, color: 'text-blue-700 bg-blue-50 border-blue-200' },
              { label: 'CAD Drawing (.dxf)', desc: 'ถอดแบบปริมาณงานก่อสร้าง', icon: Layers, color: 'text-amber-700 bg-amber-50 border-amber-200' },
              { label: 'PDF Documents', desc: 'ใบเสนอราคา/ตาราง BOQ', icon: FileText, color: 'text-rose-700 bg-rose-50 border-rose-200' },
              { label: 'Word (.docx)', desc: 'สเปกงานช่างและรายการวัสดุ', icon: FileBox, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
              { label: 'JSON APIs', desc: 'เชื่อมต่อ API ระบบภายนอก', icon: FileCode, color: 'text-purple-700 bg-purple-50 border-purple-200' },
            ].map((fmt, i) => (
              <div key={i} className={`p-3 rounded-xl border flex flex-col gap-1 ${fmt.color}`}>
                <div className="flex items-center gap-2">
                  <fmt.icon className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold leading-tight truncate">{fmt.label}</span>
                </div>
                <span className="text-[11px] opacity-80 leading-tight">{fmt.desc}</span>
              </div>
            ))}
          </div>

          {/* Step Progress Tracker */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              {[
                { step: 1, title: 'อัปโหลดไฟล์ (Upload)' },
                { step: 2, title: 'วิเคราะห์และจับคู่ (Map Fields)' },
                { step: 3, title: 'ตรวจสอบและผสาน (Verify & Merge)' },
                { step: 4, title: 'เชื่อมต่อระบบสำเร็จ (Done)' }
              ].map((s, idx) => (
                <React.Fragment key={s.step}>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      currentStep > s.step 
                        ? 'bg-emerald-600 text-white' 
                        : currentStep === s.step 
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' 
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {currentStep > s.step ? <Check className="w-4 h-4" /> : s.step}
                    </div>
                    <span className={`text-xs font-semibold hidden md:inline ${
                      currentStep === s.step ? 'text-indigo-900 font-bold' : 'text-slate-500'
                    }`}>
                      {s.title}
                    </span>
                  </div>
                  {idx < 3 && (
                    <div className={`flex-1 h-0.5 mx-2 ${
                      currentStep > s.step ? 'bg-emerald-500' : 'bg-slate-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* STEP 1: UPLOAD ZONE */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-10 md:p-14 text-center cursor-pointer transition-all ${
                  isDragOver 
                    ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]' 
                    : 'border-slate-300 hover:border-indigo-400 bg-white hover:bg-slate-50/60'
                }`}
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  onChange={handleFileChange}
                  accept=".xlsx,.xls,.csv,.tsv,.dxf,.dwg,.ifc,.pdf,.docx,.doc,.json"
                  className="hidden" 
                />

                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
                  {isParsing ? (
                    <RefreshCw className="w-8 h-8 animate-spin" />
                  ) : (
                    <UploadCloud className="w-8 h-8" />
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-800">
                  {isParsing 
                    ? 'กำลังอ่านและประมวลผลโครงสร้างไฟล์...' 
                    : 'ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์จากคอมพิวเตอร์'}
                </h3>
                <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
                  รองรับ Excel (.xlsx, .xls), CSV, CAD (.dxf, .dwg), PDF, Word (.docx), JSON ขนาดไฟล์สูงสุด 25MB
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    .xlsx / .xls
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    .csv
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    CAD .dxf
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    .pdf (BOQ Tables)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    .docx (Spec Table)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                    .json
                  </span>
                </div>
              </div>

              {parseError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">เกิดข้อผิดพลาดในการอ่านไฟล์:</span> {parseError}
                  </div>
                </div>
              )}

              {/* Quick Demo Test Buttons */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {isEnglish ? 'Instant Quick-Test Data (No file required)' : 'ทดลองนำเข้าข้อมูลตัวอย่างทันที (ไม่ต้องมีไฟล์จริง)'}
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => handleLoadDemoData('inventory')}
                    className="p-3 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 rounded-xl text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">1. คลังพัสดุกลาง</span>
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">ทดลองโหลดข้อมูล SKU คลังพัสดุก่อสร้าง (Excel)</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLoadDemoData('cad')}
                    className="p-3 bg-white border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 rounded-xl text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-amber-700">2. ถอดแบบ CAD (.dxf)</span>
                      <Layers className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">ทดลองถอดแบบปริมาณงานโครงสร้าง/ไฟฟ้า M&E</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLoadDemoData('pr')}
                    className="p-3 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 rounded-xl text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">3. ใบขอซื้อ / BOQ</span>
                      <FileText className="w-4 h-4 text-indigo-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">ทดลองโหลดรายการขอซื้อวัสดุไซต์งาน (PR)</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLoadDemoData('vendors')}
                    className="p-3 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 rounded-xl text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700">4. ทะเบียนคู่ค้า (CSV)</span>
                      <Database className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">ทดลองโหลดรายชื่อผู้ขายและผู้รับเหมา</p>
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200">
                  <Link
                    to="/integrations"
                    className="p-3 bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Cloud className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">
                          ต้องการซิงค์สดจาก Google Sheets, Google Drive, หรือ Dropbox โดยไม่ต้องอัปโหลดไฟล์ซ้ำๆ?
                        </span>
                        <p className="text-[11px] text-slate-500">
                          ใช้ระบบเชื่อมต่อคลาวด์ Serverless เชื่อมตรงไปยัง Sheets ของบริษัทและแจ้งเตือนเข้า LINE กลุ่มไซต์งาน
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 shrink-0 self-start sm:self-center">
                      เปิดระบบเชื่อมต่อคลาวด์ <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CLASSIFICATION & MAPPING MATRIX */}
          {currentStep === 2 && parsedData && (
            <div className="space-y-6">
              {/* File Info Bar */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{parsedData.fileName}</h4>
                    <p className="text-xs text-slate-500">
                      ประเภทไฟล์: <span className="font-semibold uppercase">{parsedData.fileType}</span> | ขนาด: {parsedData.fileSizeFormatted} | พบ {parsedData.rawRows.length} แถวข้อมูล ({parsedData.headers.length} คอลัมน์)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetImport}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer self-start md:self-center"
                >
                  เลือกไฟล์ใหม่
                </button>
              </div>

              {/* CAD Metadata Highlight (if CAD file) */}
              {parsedData.cadMetadata && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers3 className="w-5 h-5 text-amber-700" />
                    <h4 className="text-xs font-bold text-amber-900 uppercase">
                      ผลการถอดแบบ CAD ({parsedData.cadMetadata.format}) - วัสดุและเลเยอร์ที่ตรวจพบ
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {parsedData.cadMetadata.layers.map((layer, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md bg-white border border-amber-200 font-mono text-[11px] text-amber-900 shadow-sm">
                        Layer: {layer}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Module Auto-Detection & Manual Override Selector */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      โมดูลปลายทางในระบบจัดซื้อ (Target System Module)
                    </label>
                    <p className="text-xs text-slate-500">
                      ระบบตรวจจับโมดูลที่เหมาะสมที่สุดให้อัตโนมัติ คุณสามารถเปลี่ยนไปยังโมดูลอื่นได้ตามต้องการ
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {(['inventory', 'pr', 'vendors', 'po'] as TargetModule[]).map(mod => {
                      const def = MODULE_DEFINITIONS[mod];
                      const isSelected = targetModule === mod;
                      return (
                        <button
                          key={mod}
                          type="button"
                          onClick={() => handleTargetModuleChange(mod)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {def.nameEn.split('&')[0].trim()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    กำลังเชื่อมต่อกับ: <strong>{MODULE_DEFINITIONS[targetModule].nameTh}</strong> ({MODULE_DEFINITIONS[targetModule].descriptionTh})
                  </span>
                </div>
              </div>

              {/* Column Mapping Matrix */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      ตารางจับคู่คอลัมน์ (Column Mapping & Smart Synonyms)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      ระบบจับคู่หัวตารางภาษาไทย/อังกฤษให้อัตโนมัติ คุณสามารถปรับเปลี่ยนหัวข้อที่ต้องการจับคู่ได้
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    {MODULE_DEFINITIONS[targetModule].fields.length} ฟิลด์ระบบ
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4">ฟิลด์ปลายทางในระบบ</th>
                        <th className="py-3 px-4">จำเป็น?</th>
                        <th className="py-3 px-4">คอลัมน์ในไฟล์ที่อัปโหลด</th>
                        <th className="py-3 px-4">ตัวอย่างข้อมูล (แถวแรก)</th>
                        <th className="py-3 px-4 text-center">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {MODULE_DEFINITIONS[targetModule].fields.map(field => {
                        const mappedCol = columnMapping[field.key] || '';
                        const sampleVal = mappedCol && parsedData.rawRows[0] 
                          ? String(parsedData.rawRows[0][mappedCol] ?? '-') 
                          : '-';
                        const isMapped = Boolean(mappedCol);

                        return (
                          <tr key={field.key} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">{field.labelTh}</div>
                              <div className="text-[11px] text-slate-400 font-mono">{field.key} ({field.labelEn})</div>
                            </td>
                            <td className="py-3 px-4">
                              {field.required ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                  จำเป็น
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                                  ไม่บังคับ
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={mappedCol}
                                onChange={(e) => setColumnMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                                className="w-full max-w-xs py-1.5 px-3 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="">-- ไม่เลือก / ละเว้นฟิลด์นี้ --</option>
                                {parsedData.headers.map(h => (
                                  <option key={h} value={h}>{h}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-3 px-4 text-slate-600 font-mono text-[11px] max-w-xs truncate">
                              {sampleVal}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {isMapped ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                                  <CheckCircle2 className="w-4 h-4" /> จับคู่แล้ว
                                </span>
                              ) : field.required ? (
                                <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-[11px]">
                                  <AlertCircle className="w-4 h-4" /> ยังไม่จับคู่
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-white cursor-pointer"
                  >
                    ย้อนกลับ
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 flex items-center gap-2 cursor-pointer"
                  >
                    ถัดไป: ตรวจสอบตัวอย่างและเลือกโหมดผสาน <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW, VALIDATION & MERGE STRATEGY */}
          {currentStep === 3 && parsedData && (
            <div className="space-y-6">
              {/* Summary Stats Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-xs text-slate-500 font-medium">แถวทั้งหมดในไฟล์</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{parsedData.rawRows.length} รายการ</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm bg-emerald-50/20">
                  <div className="text-xs text-emerald-700 font-medium">พร้อมนำเข้าเข้าสู่ระบบ</div>
                  <div className="text-2xl font-black text-emerald-600 mt-1">{normalizedData.validRows.length} รายการ</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-xs text-slate-500 font-medium">แถวที่ข้อมูลไม่ครบถ้วน</div>
                  <div className="text-2xl font-black text-amber-600 mt-1">{normalizedData.errorRows.length} รายการ</div>
                </div>
              </div>

              {/* Merge Mode Strategy Cards */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900">
                  เลือกโหมดการจัดการและผสานข้อมูล (Merge & Conflict Resolution Mode)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      id: 'merge' as ImportMergeMode,
                      title: 'ผสานข้อมูลเดิม (Merge & Update)',
                      badge: 'แนะนำสำหรับงานก่อสร้าง',
                      desc: 'ตรวจจับรหัส SKU หรือชื่อพัสดุเดิม หากมีจะรวมจำนวนคงเหลือและอัปเดตราคาให้เป็นปัจจุบัน หากไม่มีจะเพิ่มรายการใหม่',
                      color: 'border-indigo-600 bg-indigo-50/40'
                    },
                    {
                      id: 'append' as ImportMergeMode,
                      title: 'เพิ่มรายการใหม่เท่านั้น (Append New)',
                      badge: 'สร้างรายการใหม่',
                      desc: 'สร้างรหัสรายการใหม่และบันทึกลงในระบบทุกแถว โดยไม่กระทบหรือเขียนทับข้อมูลเดิมที่มีอยู่',
                      color: 'border-blue-500 bg-blue-50/30'
                    },
                    {
                      id: 'replace' as ImportMergeMode,
                      title: 'แทนที่ทั้งหมด (Replace All)',
                      badge: 'ล้างข้อมูลเดิม',
                      desc: 'ลบข้อมูลเดิมในโมดูลนี้ออกทั้งหมด และแทนที่ด้วยชุดข้อมูลใหม่จากไฟล์นี้ (โปรดใช้ด้วยความระมัดระวัง)',
                      color: 'border-rose-500 bg-rose-50/30'
                    }
                  ].map(mode => {
                    const isSelected = mergeMode === mode.id;
                    return (
                      <div
                        key={mode.id}
                        onClick={() => setMergeMode(mode.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected ? mode.color : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{mode.title}</span>
                          <input 
                            type="radio" 
                            name="mergeMode" 
                            checked={isSelected} 
                            onChange={() => setMergeMode(mode.id)} 
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                        </div>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-700">
                          {mode.badge}
                        </span>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                          {mode.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase">
                      ตัวอย่างข้อมูลที่แปลงรูปแล้ว (Normalized Preview - แสดงสูงสุด 15 แถวแรก)
                    </h4>
                  </div>
                  <span className="text-xs text-slate-500">
                    แสดง {Math.min(15, normalizedData.validRows.length)} จาก {normalizedData.validRows.length} รายการ
                  </span>
                </div>

                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px] z-10">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        {MODULE_DEFINITIONS[targetModule].fields.slice(0, 7).map(f => (
                          <th key={f.key} className="py-2.5 px-3">{f.labelTh}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {normalizedData.validRows.slice(0, 15).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-slate-400 font-sans">{idx + 1}</td>
                          {MODULE_DEFINITIONS[targetModule].fields.slice(0, 7).map(f => {
                            const val = row[f.key];
                            return (
                              <td key={f.key} className="py-2 px-3 text-slate-800">
                                {Array.isArray(val) ? val.join(', ') : String(val ?? '-')}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-white cursor-pointer"
                  >
                    ย้อนกลับไปแก้ไขคอลัมน์
                  </button>

                  <button
                    type="button"
                    onClick={handleExecuteImport}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-200 flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    ยืนยันนำเข้าข้อมูลเข้าสู่ระบบทันที ({normalizedData.validRows.length} รายการ)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS COMPLETION */}
          {currentStep === 4 && importResult && (
            <div className="bg-white p-8 md:p-12 rounded-3xl border border-emerald-200 shadow-sm text-center max-w-2xl mx-auto space-y-6">
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border-4 border-emerald-100 flex items-center justify-center mx-auto shadow-inner">
                <Check className="w-10 h-10" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  นำเข้าและผสานข้อมูลสำเร็จเรียบร้อย!
                </h2>
                <p className="text-sm text-slate-600 mt-2">
                  ข้อมูลจากไฟล์ <strong>{parsedData?.fileName}</strong> ถูกเชื่อมต่อไปยังระบบ <strong>{MODULE_DEFINITIONS[importResult.module].nameTh}</strong> เรียบร้อยแล้ว
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <div>
                  <div className="text-xs text-slate-500">นำเข้าทั้งหมด</div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">{importResult.total} รายการ</div>
                </div>
                <div>
                  <div className="text-xs text-emerald-700">เพิ่มใหม่</div>
                  <div className="text-xl font-black text-emerald-600 mt-0.5">{importResult.added} รายการ</div>
                </div>
                <div>
                  <div className="text-xs text-indigo-700">อัปเดตข้อมูลเดิม</div>
                  <div className="text-xl font-black text-indigo-600 mt-0.5">{importResult.updated} รายการ</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                {importResult.module === 'inventory' && (
                  <Link
                    to="/inventory"
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
                  >
                    เปิดดูในหน้าคลังสินค้า <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
                {importResult.module === 'pr' && (
                  <Link
                    to="/pr"
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
                  >
                    เปิดดูในหน้าระบบขอซื้อ (PR) <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
                {importResult.module === 'vendors' && (
                  <Link
                    to="/vendors"
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
                  >
                    เปิดดูในหน้าทะเบียนคู่ค้า <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
                {importResult.module === 'po' && (
                  <Link
                    to="/po"
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
                  >
                    เปิดดูในหน้าระบบจัดซื้อ (PO) <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleResetImport}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  นำเข้าไฟล์อื่นเพิ่มเติม
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: IMPORT HISTORY LOG */}
      {/* ============================================================== */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                ประวัติการนำเข้าไฟล์และบันทึกระบบ (Import History & Audit Log)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                บันทึกการนำเข้าไฟล์ย้อนหลัง {importHistory.length} รายการล่าสุด พร้อมระบุผู้ดำเนินการและผลการประมวลผล
              </p>
            </div>

            {importHistory.length > 0 && (
              <button
                type="button"
                onClick={clearImportHistory}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
              >
                <Trash2 className="w-3.5 h-3.5" /> ล้างประวัติทั้งหมด
              </button>
            )}
          </div>

          {importHistory.length === 0 ? (
            <div className="py-16 text-center">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700">ยังไม่มีประวัติการนำเข้าไฟล์</h4>
              <p className="text-xs text-slate-400 mt-1">
                เมื่อคุณนำเข้าไฟล์ข้อมูลผ่านระบบ ประวัติและสถานะจะถูกบันทึกไว้ที่นี่
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">วันและเวลา</th>
                    <th className="py-3 px-4">ชื่อไฟล์</th>
                    <th className="py-3 px-4">ประเภทไฟล์</th>
                    <th className="py-3 px-4">โมดูลปลายทาง</th>
                    <th className="py-3 px-4">โหมดการผสาน</th>
                    <th className="py-3 px-4">จำนวนแถว</th>
                    <th className="py-3 px-4">ผู้นำเข้า</th>
                    <th className="py-3 px-4">รายละเอียด</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {importHistory.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(rec.timestamp).toLocaleString('th-TH')}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {rec.fileName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 font-mono">
                          {rec.fileType}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {rec.targetModule.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {rec.mode === 'merge' ? 'ผสานข้อมูล (Merge)' : rec.mode === 'append' ? 'เพิ่มใหม่ (Append)' : 'แทนที่ (Replace)'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-emerald-700">{rec.successCount}</span>
                        <span className="text-slate-400"> / {rec.totalRows}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {rec.importedBy}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {rec.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: DOWNLOAD TEMPLATES LIBRARY */}
      {/* ============================================================== */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              คลังดาวน์โหลดไฟล์แม่แบบมาตรฐาน (Standard Template Library)
            </h3>
            <p className="text-xs text-slate-500">
              ดาวน์โหลดไฟล์เทมเพลตมาตรฐานสำหรับกรอกข้อมูล เพื่อให้นำเข้าสู่ระบบได้อย่างแม่นยำ 100% พร้อมหัวคอลัมน์มาตรฐาน
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Template 1: Inventory Master */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">คลังพัสดุและ SKU กลาง</h4>
                <p className="text-xs text-slate-500 mt-1">
                  เทมเพลตรายการวัสดุก่อสร้าง, รหัส SKU, หมวดหมู่, จุดจัดเก็บในคลัง และเกณฑ์สต็อกขั้นต่ำ
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => downloadSampleTemplate('inventory', 'xlsx')}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-100"
                >
                  <Download className="w-3.5 h-3.5" /> โหลด .XLSX
                </button>
                <button
                  type="button"
                  onClick={() => downloadSampleTemplate('inventory', 'csv')}
                  className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  .CSV
                </button>
              </div>
            </div>

            {/* Template 2: CAD Takeoff */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">แบบถอดปริมาณงาน CAD (.DXF)</h4>
                <p className="text-xs text-slate-500 mt-1">
                  ไฟล์แบบแปลนโครงสร้าง CAD DXF แยกเลเยอร์คาน เสา พื้น ท่อร้อยสายไฟ พร้อมสำหรับการถอดแบบอัตโนมัติ
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => downloadSampleTemplate('pr', 'dxf')}
                  className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-amber-100"
                >
                  <Download className="w-3.5 h-3.5" /> ดาวน์โหลด CAD .DXF
                </button>
              </div>
            </div>

            {/* Template 3: BOQ / PR Takeoff */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">ใบขอซื้อและรายการ BOQ โครงการ</h4>
                <p className="text-xs text-slate-500 mt-1">
                  เทมเพลตรายการขอซื้อวัสดุไซต์งาน รายละเอียดสเปกวิศวกรรม ราคาประเมิน และเหตุผลขอซื้อ
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => downloadSampleTemplate('pr', 'xlsx')}
                  className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-100"
                >
                  <Download className="w-3.5 h-3.5" /> โหลด .XLSX
                </button>
                <button
                  type="button"
                  onClick={() => downloadSampleTemplate('pr', 'csv')}
                  className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  .CSV
                </button>
              </div>
            </div>

            {/* Template 4: Vendors Directory */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                  <Database className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">ทะเบียนคู่ค้าและผู้รับเหมา</h4>
                <p className="text-xs text-slate-500 mt-1">
                  เทมเพลตรายชื่อร้านค้า ซัพพลายเออร์ เลขผู้เสียภาษี เงื่อนไขการชำระเงิน (Credit Terms) และคะแนนประเมิน
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => downloadSampleTemplate('vendors', 'xlsx')}
                  className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-blue-100"
                >
                  <Download className="w-3.5 h-3.5" /> โหลด .XLSX
                </button>
                <button
                  type="button"
                  onClick={() => downloadSampleTemplate('vendors', 'json')}
                  className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  .JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
