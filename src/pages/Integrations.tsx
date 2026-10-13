import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  FileSpreadsheet, 
  Database, 
  Share2, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  Info, 
  Zap, 
  FolderPlus,
  BellRing,
  HelpCircle,
  FileCode,
  ArrowRight,
  Flame,
  UploadCloud,
  DownloadCloud,
  Radio,
  HardDrive
} from 'lucide-react';
import { useProcurement } from '../contexts/ProcurementContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  extractGoogleSheetId, 
  GOOGLE_APPS_SCRIPT_TEMPLATE 
} from '../lib/integrations/cloudSync';
import { 
  getFirebaseStats, 
  type FirebaseCollectionStats, 
  firebaseConfig 
} from '../lib/firebaseSync';
import type { IntegrationProviderId } from '../types';
import { Link } from 'react-router-dom';

export function IntegrationsPage() {
  const { isEnglish } = useLanguage();
  const {
    integrations,
    updateIntegrationConfig,
    syncGoogleSheetsData,
    backupSystemToCloud,
    testLineAlert,
    syncToFirebase,
    pullFromFirebase,
    testFirebase
  } = useProcurement();

  const [activeTab, setActiveTab] = useState<'all' | 'storage' | 'notifications'>('all');
  const [copiedScript, setCopiedScript] = useState(false);
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [sheetSyncResult, setSheetSyncResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [isSendingLine, setIsSendingLine] = useState(false);
  const [lineResult, setLineResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [backupResult, setBackupResult] = useState<{ fileName: string; sizeBytes: number } | null>(null);
  const [showAppsScriptModal, setShowAppsScriptModal] = useState(false);

  // Firebase states
  const [isTestingFirebase, setIsTestingFirebase] = useState(false);
  const [firebaseTestResult, setFirebaseTestResult] = useState<{ success: boolean; latencyMs?: number; error?: string; projectId?: string; databaseId?: string } | null>(null);
  const [isSyncingFirebase, setIsSyncingFirebase] = useState(false);
  const [firebaseSyncResult, setFirebaseSyncResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [isPullingFirebase, setIsPullingFirebase] = useState(false);
  const [firebasePullResult, setFirebasePullResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [firebaseStats, setFirebaseStats] = useState<FirebaseCollectionStats | null>(null);
  const [copiedProjectId, setCopiedProjectId] = useState(false);

  useEffect(() => {
    getFirebaseStats().then(setFirebaseStats).catch(() => {});
  }, []);

  // Form local states for inputs
  const gsConfig = integrations.google_sheets?.googleSheets || {};
  const [sheetUrlInput, setSheetUrlInput] = useState(gsConfig.sheetUrl || '');
  const [sheetModuleInput, setSheetModuleInput] = useState<'inventory' | 'pr' | 'vendors'>(gsConfig.targetModule || 'inventory');

  const gdConfig = integrations.google_drive?.googleDrive || {};
  const [driveFolderInput, setDriveFolderInput] = useState(gdConfig.folderName || '');
  const [driveLinkInput, setDriveLinkInput] = useState(gdConfig.shareLink || '');

  const dbConfig = integrations.dropbox?.dropbox || {};
  const [dropboxPathInput, setDropboxPathInput] = useState(dbConfig.folderPath || '');
  const [dropboxLinkInput, setDropboxLinkInput] = useState(dbConfig.sharedLink || '');

  const lineConfig = integrations.line_notify?.lineNotify || {};
  const [lineChannelInput, setLineChannelInput] = useState(lineConfig.targetChannelName || '');
  const [lineTokenInput, setLineTokenInput] = useState(lineConfig.token || '');

  // Firebase Handlers
  const handleTestFirebase = async () => {
    setIsTestingFirebase(true);
    setFirebaseTestResult(null);
    try {
      const res = await testFirebase();
      setFirebaseTestResult(res);
      const stats = await getFirebaseStats();
      setFirebaseStats(stats);
    } catch (err: any) {
      setFirebaseTestResult({ success: false, error: err.message || 'Failed to ping Firebase' });
    } finally {
      setIsTestingFirebase(false);
    }
  };

  const handleSyncToFirebase = async () => {
    setIsSyncingFirebase(true);
    setFirebaseSyncResult(null);
    try {
      const res = await syncToFirebase();
      setFirebaseSyncResult({ success: true, msg: res.message });
      const stats = await getFirebaseStats();
      setFirebaseStats(stats);
    } catch (err: any) {
      setFirebaseSyncResult({ success: false, msg: err.message || 'เกิดข้อผิดพลาดในการซิงก์ขึ้น Firebase' });
    } finally {
      setIsSyncingFirebase(false);
    }
  };

  const handlePullFromFirebase = async () => {
    if (!window.confirm('คุณต้องการดึงข้อมูลล่าสุดจาก Firebase Cloud Firestore เข้ามาอัปเดตข้อมูลในเครื่องใช่หรือไม่?')) {
      return;
    }
    setIsPullingFirebase(true);
    setFirebasePullResult(null);
    try {
      const res = await pullFromFirebase();
      setFirebasePullResult({ success: true, msg: res.message });
      const stats = await getFirebaseStats();
      setFirebaseStats(stats);
    } catch (err: any) {
      setFirebasePullResult({ success: false, msg: err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลจาก Firebase' });
    } finally {
      setIsPullingFirebase(false);
    }
  };

  const handleCopyProjectId = () => {
    navigator.clipboard.writeText(firebaseConfig.projectId);
    setCopiedProjectId(true);
    setTimeout(() => setCopiedProjectId(false), 2000);
  };

  // Copy Google Apps Script template
  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  // Google Sheets Sync
  const handleSyncGoogleSheets = async () => {
    setIsSyncingSheet(true);
    setSheetSyncResult(null);

    // Save configuration first
    updateIntegrationConfig('google_sheets', {
      isEnabled: true,
      googleSheets: {
        ...gsConfig,
        sheetUrl: sheetUrlInput,
        sheetId: extractGoogleSheetId(sheetUrlInput),
        targetModule: sheetModuleInput
      }
    });

    try {
      const res = await syncGoogleSheetsData(sheetModuleInput);
      setSheetSyncResult({ success: true, msg: `[MVP Mock Preview] ${res.message} (โหมดจำลองการทำงานสำหรับการนำเสนอ)` });
    } catch (err: any) {
      setSheetSyncResult({ 
        success: false, 
        msg: err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลจาก Google Sheets' 
      });
    } finally {
      setIsSyncingSheet(false);
    }
  };

  // Backup System to Cloud
  const handleCloudBackup = () => {
    const res = backupSystemToCloud();
    setBackupResult(res);
    setTimeout(() => setBackupResult(null), 5000);
  };

  // Test LINE Alert
  const handleTestLine = async () => {
    setIsSendingLine(true);
    setLineResult(null);

    // Save config
    updateIntegrationConfig('line_notify', {
      isEnabled: true,
      lineNotify: {
        ...lineConfig,
        targetChannelName: lineChannelInput,
        token: lineTokenInput
      }
    });

    try {
      const res = await testLineAlert();
      setLineResult({ success: true, msg: `[MVP Mock Preview] ${res.message} (จำลองการแจ้งเตือน ไม่ส่งออกภายนอกจริง)` });
    } catch (err: any) {
      setLineResult({ success: false, msg: err.message || 'ส่งข้อความไม่สำเร็จ' });
    } finally {
      setIsSendingLine(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 w-full">
      {/* MVP Mock Sandbox Notice */}
      <div className="bg-stone-50 border border-stone-200 text-stone-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#154c38] text-white font-bold shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs sm:text-sm font-bold text-stone-900">
                ระบบจำลองเพื่อการนำเสนอ (MVP Mock Preview & Simulation Sandbox)
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-[#154c38] border border-emerald-200 uppercase">
                Demo Only
              </span>
            </div>
            <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
              ฟังก์ชันเชื่อมต่อ API และคลาวด์ทั้งหมดถูกกำหนดให้อยู่ในโหมดจำลอง (Mock Sandbox) สำหรับการนำเสนอผู้บริหาร/ผู้มีส่วนได้ส่วนเสีย ไม่มีการส่งข้อมูลจริงไปยังระบบภายนอก
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 font-bold text-xs shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#154c38]" />
            Sandbox Locked
          </span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#fcfdfa] via-[#f5f8f4] to-[#edf3ee] text-stone-900 p-6 sm:p-8 rounded-3xl border border-emerald-900/10 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2 rounded-xl bg-emerald-50 text-[#154c38] border border-emerald-200/80">
                <Cloud className="w-5 h-5 text-[#154c38]" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
                {isEnglish ? 'Serverless Cloud & Plugins Integration' : 'ศูนย์เชื่อมต่อคลาวด์และปลั๊กอิน (Cloud & Plugins)'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100/90 text-[#154c38] border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#154c38]" />
                100% Serverless • ไม่ต้องมีเซิร์ฟเวอร์
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {isEnglish 
                ? 'Connect easily to Google Sheets as a live database, Google Drive, Dropbox, and LINE Notify directly from your browser. Perfect for construction teams without dedicated IT infrastructure.' 
                : 'เชื่อมต่อเครื่องมือที่ทุกคนใช้งานง่าย: ใช้ Google Sheets เป็นฐานข้อมูลสด, Google Drive และ Dropbox สำหรับเก็บเอกสารและแบบ CAD, พร้อมระบบแจ้งเตือนเข้ากลุ่ม LINE หน้างาน ทำงานได้ทันทีบนคอมพิวเตอร์ของคุณโดยไม่ต้องเช่าเซิร์ฟเวอร์ราคาแพง'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleCloudBackup}
              className="px-4 py-2.5 rounded-full bg-[#154c38] hover:bg-[#103b2b] text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4 text-white" />
              {isEnglish ? 'Instant Cloud Backup' : 'สำรองข้อมูลทั้งระบบ (1-Click Backup)'}
            </button>
          </div>
        </div>

        {backupResult && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-[#154c38] flex items-center gap-2 animate-in fade-in duration-300">
            <CheckCircle2 className="w-4 h-4 text-[#154c38] shrink-0" />
            <span>
              สร้างไฟล์สำรองข้อมูล <strong>{backupResult.fileName}</strong> เรียบร้อยแล้ว (ขนาด: {(backupResult.sizeBytes / 1024).toFixed(1)} KB)
            </span>
          </div>
        )}
      </div>

      {/* Philosophy / Value Highlight Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-stone-200 hover:border-[#154c38] shadow-xs flex items-start gap-3 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-[#154c38] text-white flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900">ไม่ต้องมี Server หรือ Database ซับซ้อน</h4>
            <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
              เหมาะสำหรับบริษัทรับเหมาและธุรกิจทั่วไป ไม่ต้องมีทีม IT คอยดูแล ไม่เสียค่าบริการเซิร์ฟเวอร์รายเดือน
            </p>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-stone-200 hover:border-[#154c38] shadow-xs flex items-start gap-3 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-[#154c38] text-white flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900">Google Sheets คือ Database ของคุณ</h4>
            <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
              คนทั่วไปเปิดและแก้ข้อมูลใน Google Sheets จากมือถือหรือคอมพิวเตอร์ ระบบจะดึงสต็อกเข้ามาซิงค์ได้ทันที
            </p>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-stone-200 hover:border-[#154c38] shadow-xs flex items-start gap-3 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-[#154c38] text-white flex items-center justify-center shrink-0">
            <BellRing className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900">แจ้งเตือนเข้า LINE กลุ่มไซต์งาน</h4>
            <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
              วิศวกรและโฟร์แมนรับการแจ้งเตือนเมื่อมีใบขอซื้อ (PR) อนุมัติ หรือพัสดุมาส่งถึงคลัง ผ่านแอป LINE ที่ใช้ทุกวัน
            </p>
          </div>
        </div>
      </div>

      {/* Integration Providers Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            รายการปลั๊กอินและบริการคลาวด์ที่รองรับ
          </h2>
          <span className="text-xs text-slate-500">
            เปิดใช้งานอยู่ {Object.values(integrations).filter(x => x.isEnabled).length} จาก {Object.keys(integrations).length} บริการ
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ============================================================== */}
          {/* 0. FIREBASE CLOUD FIRESTORE (ENTERPRISE REAL-TIME DATABASE) */}
          {/* ============================================================== */}
          <div className="col-span-1 lg:col-span-2 bg-gradient-to-br from-[#122b20] via-[#154c38] to-[#1c3e30] text-white rounded-3xl border border-emerald-900/40 shadow-md overflow-hidden p-6 sm:p-7 space-y-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center shrink-0 shadow-inner">
                  <Flame className="w-7 h-7 text-emerald-200" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Firebase Cloud Firestore
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-emerald-200 border border-white/20">
                      Google Cloud Enterprise
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Connected
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
                    ระบบเชื่อมต่อกับ Google Firebase Firestore ในตัว จัดเก็บและซิงค์ข้อมูลใบขอซื้อ (PR), สั่งซื้อ (PO), คลังสต็อก และประวัติการทำงาน (Audit Logs) ข้ามอุปกรณ์แบบ Real-time
                  </p>
                </div>
              </div>

              {/* Enable Toggle */}
              <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                <span className="text-xs text-emerald-100 font-medium">
                  {integrations.firebase?.isEnabled ? 'เปิดใช้งานอยู่' : 'ปิดใช้งาน'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={integrations.firebase?.isEnabled !== false}
                    onChange={(e) => updateIntegrationConfig('firebase', { isEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-emerald-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>

            {/* Config & Diagnostics Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10">
                <span className="text-[10px] text-emerald-200/80 uppercase font-bold tracking-wider block">Project ID</span>
                <div className="flex items-center justify-between gap-1 mt-1">
                  <span className="font-mono text-xs text-white truncate" title={firebaseConfig.projectId}>
                    {firebaseConfig.projectId}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyProjectId}
                    className="p-1 hover:bg-white/10 rounded text-emerald-200 hover:text-white transition-colors cursor-pointer"
                    title="คัดลอก Project ID"
                  >
                    {copiedProjectId ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10">
                <span className="text-[10px] text-emerald-200/80 uppercase font-bold tracking-wider block">Firestore Database</span>
                <span className="font-mono text-xs text-white truncate block mt-1" title={firebaseConfig.firestoreDatabaseId || '(default)'}>
                  {firebaseConfig.firestoreDatabaseId || '(default)'}
                </span>
              </div>

              <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10">
                <span className="text-[10px] text-emerald-200/80 uppercase font-bold tracking-wider block">Auth & Security Rules</span>
                <div className="font-semibold text-white flex items-center gap-1 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Anonymous / Token Auth</span>
                </div>
              </div>

              <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10">
                <span className="text-[10px] text-emerald-200/80 uppercase font-bold tracking-wider block">สถานะการเชื่อมต่อล่าสุด</span>
                <div className="font-semibold text-white flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{firebaseTestResult?.latencyMs ? `ออนไลน์ (${firebaseTestResult.latencyMs}ms)` : 'พร้อมทำงาน (Connected)'}</span>
                </div>
              </div>
            </div>

            {/* Collection Stats Badges */}
            <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-300" />
                  <span>จำนวนข้อมูลใน Firestore Collections บนคลาวด์:</span>
                </span>
                <span className="text-[11px] text-emerald-200/80">
                  ตรวจสอบล่าสุด: {firebaseStats?.lastChecked || 'กำลังโหลด...'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                <div className="p-2.5 bg-black/20 rounded-xl border border-white/10">
                  <span className="text-[10px] text-emerald-200/80 block">ใบขอซื้อ (prs)</span>
                  <span className="font-bold text-sm text-white font-mono mt-0.5 block">{firebaseStats?.prsCount ?? '0'}</span>
                </div>
                <div className="p-2.5 bg-black/20 rounded-xl border border-white/10">
                  <span className="text-[10px] text-emerald-200/80 block">ใบสั่งซื้อ (pos)</span>
                  <span className="font-bold text-sm text-white font-mono mt-0.5 block">{firebaseStats?.posCount ?? '0'}</span>
                </div>
                <div className="p-2.5 bg-black/20 rounded-xl border border-white/10">
                  <span className="text-[10px] text-emerald-200/80 block">สต็อก (inventory)</span>
                  <span className="font-bold text-sm text-white font-mono mt-0.5 block">{firebaseStats?.inventoryCount ?? '0'}</span>
                </div>
                <div className="p-2.5 bg-black/20 rounded-xl border border-white/10">
                  <span className="text-[10px] text-emerald-200/80 block">คู่ค้า (vendors)</span>
                  <span className="font-bold text-sm text-white font-mono mt-0.5 block">{firebaseStats?.vendorsCount ?? '0'}</span>
                </div>
                <div className="p-2.5 bg-black/20 rounded-xl border border-white/10 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-emerald-200/80 block">บันทึก (audit_logs)</span>
                  <span className="font-bold text-sm text-white font-mono mt-0.5 block">{firebaseStats?.logsCount ?? '0'}</span>
                </div>
              </div>
            </div>

            {/* Results Feedback */}
            {firebaseTestResult && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-200 ${
                firebaseTestResult.success 
                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30' 
                  : 'bg-rose-500/20 text-rose-200 border border-rose-500/30'
              }`}>
                {firebaseTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                <span>
                  {firebaseTestResult.success 
                    ? `เชื่อมต่อ Firebase สำเร็จ! เวลาตอบสนอง: ${firebaseTestResult.latencyMs} ms (Project: ${firebaseTestResult.projectId})`
                    : `การเชื่อมต่อผิดพลาด: ${firebaseTestResult.error}`}
                </span>
              </div>
            )}

            {firebaseSyncResult && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-200 ${
                firebaseSyncResult.success 
                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30' 
                  : 'bg-rose-500/20 text-rose-200 border border-rose-500/30'
              }`}>
                {firebaseSyncResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                <span>{firebaseSyncResult.msg}</span>
              </div>
            )}

            {firebasePullResult && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-200 ${
                firebasePullResult.success 
                  ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30' 
                  : 'bg-rose-500/20 text-rose-200 border border-rose-500/30'
              }`}>
                {firebasePullResult.success ? <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                <span>{firebasePullResult.msg}</span>
              </div>
            )}

            {/* Action Buttons Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleTestFirebase}
                  disabled={isTestingFirebase}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 border border-white/20"
                >
                  <Radio className={`w-3.5 h-3.5 text-white ${isTestingFirebase ? 'animate-pulse' : ''}`} />
                  <span>{isTestingFirebase ? 'กำลังทดสอบ...' : 'ทดสอบเชื่อมต่อ (Ping)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSyncToFirebase}
                  disabled={isSyncingFirebase}
                  className="px-4 py-2 rounded-full bg-white hover:bg-emerald-50 text-[#154c38] font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <UploadCloud className={`w-4 h-4 text-[#154c38] ${isSyncingFirebase ? 'animate-bounce' : ''}`} />
                  <span>{isSyncingFirebase ? 'กำลังส่งข้อมูลขึ้น Firestore...' : 'ซิงก์ข้อมูลขึ้น Cloud (Push)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePullFromFirebase}
                  disabled={isPullingFirebase}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <DownloadCloud className={`w-4 h-4 text-white ${isPullingFirebase ? 'animate-bounce' : ''}`} />
                  <span>{isPullingFirebase ? 'กำลังดึงข้อมูล...' : 'ดึงข้อมูลจาก Cloud (Pull)'}</span>
                </button>
              </div>

              <span className="text-[11px] text-emerald-200/80">
                Firestore Database • Google Cloud Platform
              </span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 1. GOOGLE SHEETS LIVE DATABASE */}
          {/* ============================================================== */}
          <div className="bg-white rounded-3xl border border-stone-200 hover:border-[#154c38] shadow-xs overflow-hidden flex flex-col justify-between transition-colors">
            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#154c38] flex items-center justify-center border border-emerald-200/80 shadow-xs">
                    <FileSpreadsheet className="w-6 h-6 text-[#154c38]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-stone-900">Google Sheets Live Database</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-[#154c38] border border-emerald-200/80">
                        MVP Mock
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5">
                      ใช้ Google Sheets เป็นฐานข้อมูลสต็อกพัสดุและรายการขอซื้อ แก้ไขบน Sheets แล้วดึงเข้าแอปได้ทันที
                    </p>
                  </div>
                </div>

                {/* Enable Toggle */}
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    checked={integrations.google_sheets?.isEnabled}
                    onChange={(e) => updateIntegrationConfig('google_sheets', { isEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#154c38]"></div>
                </label>
              </div>

              {/* Settings Inputs */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-stone-900 block mb-1">
                    Google Sheets URL หรือ Sheet ID
                  </label>
                  <input
                    type="text"
                    value={sheetUrlInput}
                    onChange={(e) => setSheetUrlInput(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5.../edit"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-[#154c38] font-mono"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    * ต้องเปิดการแชร์ลิงก์ใน Google Sheets เป็น: <strong>"ทุกคนที่มีลิงก์มีสิทธิ์ดู" (Anyone with the link can view)</strong>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-900 block mb-1">
                      โมดูลเป้าหมายที่ต้องการซิงค์
                    </label>
                    <select
                      value={sheetModuleInput}
                      onChange={(e) => setSheetModuleInput(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-[#154c38]"
                    >
                      <option value="inventory">คลังพัสดุและ SKU กลาง</option>
                      <option value="pr">รายการขอซื้อ / BOQ (PR)</option>
                      <option value="vendors">ทะเบียนคู่ค้าและผู้รับเหมา</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-900 block mb-1">
                      การซิงค์อัตโนมัติ
                    </label>
                    <div className="flex items-center h-9 text-xs text-stone-900">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-[#154c38] border border-emerald-200 font-semibold text-[11px]">
                        <Check className="w-3.5 h-3.5" /> ซิงค์สดทางตรง
                      </span>
                    </div>
                  </div>
                </div>

                {sheetSyncResult && (
                  <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    sheetSyncResult.success ? 'bg-emerald-50 text-[#154c38] border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {sheetSyncResult.success ? <CheckCircle2 className="w-4 h-4 text-[#154c38] shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                    <span>{sheetSyncResult.msg}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-stone-50/70 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowAppsScriptModal(true)}
                className="text-xs font-semibold text-[#154c38] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5" /> โค้ด Apps Script สำหรับซิงค์ 2 ทาง
              </button>

              <button
                type="button"
                onClick={handleSyncGoogleSheets}
                disabled={isSyncingSheet || !integrations.google_sheets?.isEnabled}
                className="px-4 py-2 rounded-full bg-[#154c38] hover:bg-[#103b2b] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-all"
              >
                {isSyncingSheet ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                {isSyncingSheet ? 'กำลังดึงข้อมูล...' : 'ซิงค์ข้อมูลเดี๋ยวนี้ (Sync Now)'}
              </button>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 2. GOOGLE DRIVE (CLOUD STORAGE & BACKUP) */}
          {/* ============================================================== */}
          <div className="bg-white rounded-3xl border border-stone-200 hover:border-[#154c38] shadow-xs overflow-hidden flex flex-col justify-between transition-colors">
            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#154c38] flex items-center justify-center border border-emerald-200/80 shadow-xs">
                    <Cloud className="w-6 h-6 text-[#154c38]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-stone-900">Google Drive Storage & Backup</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-[#154c38] border border-emerald-200/80">
                        MVP Mock
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5">
                      จัดเก็บเอกสารใบสั่งซื้อ ใบตรวจรับ และก้อน Backup สำรองข้อมูลระบบทั้งหมดอัตโนมัติ
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    checked={integrations.google_drive?.isEnabled}
                    onChange={(e) => updateIntegrationConfig('google_drive', { isEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#154c38]"></div>
                </label>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-stone-900 block mb-1">
                    ชื่อโฟลเดอร์ Google Drive ของบริษัท
                  </label>
                  <input
                    type="text"
                    value={driveFolderInput}
                    onChange={(e) => setDriveFolderInput(e.target.value)}
                    placeholder="Conerage store เอกสารและแบบก่อสร้าง"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-[#154c38]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-900 block mb-1">
                    ลิงก์โฟลเดอร์แชร์ใน Google Drive (Share Link)
                  </label>
                  <input
                    type="text"
                    value={driveLinkInput}
                    onChange={(e) => setDriveLinkInput(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-[#154c38] font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-stone-50/70 border-t border-stone-200 flex items-center justify-between">
              {driveLinkInput ? (
                <a
                  href={driveLinkInput}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#154c38] hover:underline flex items-center gap-1"
                >
                  เปิดโฟลเดอร์ Google Drive <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span className="text-xs text-stone-400">ยังไม่ได้ระบุลิงก์โฟลเดอร์</span>
              )}

              <button
                type="button"
                onClick={handleCloudBackup}
                className="px-4 py-2 rounded-full bg-[#154c38] hover:bg-[#103b2b] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
              >
                <Download className="w-3.5 h-3.5 text-white" /> สำรองข้อมูลขึ้น Drive
              </button>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 3. LINE NOTIFY / LINE WEBHOOK */}
          {/* ============================================================== */}
          <div className="bg-white rounded-3xl border border-stone-200 hover:border-[#154c38] transition-colors shadow-xs overflow-hidden flex flex-col justify-between">
            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#154c38] flex items-center justify-center border border-emerald-200/80 shadow-xs">
                    <BellRing className="w-6 h-6 text-[#154c38]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-stone-900">LINE Notifications (กลุ่มไลน์หน้างาน)</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-[#154c38] border border-emerald-200/80">
                        MVP Mock
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5">
                      ส่งข้อความแจ้งเตือนอัตโนมัติเข้ากลุ่ม LINE ของวิศวกร, โฟร์แมน และฝ่ายจัดซื้อ
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    checked={integrations.line_notify?.isEnabled}
                    onChange={(e) => updateIntegrationConfig('line_notify', { isEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#154c38]"></div>
                </label>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-stone-900 block mb-1">
                    ชื่อกลุ่ม LINE ที่ต้องการส่งแจ้งเตือน
                  </label>
                  <input
                    type="text"
                    value={lineChannelInput}
                    onChange={(e) => setLineChannelInput(e.target.value)}
                    placeholder="กลุ่มไลน์: จัดซื้อ & วิศวกรโครงการ"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-[#154c38] focus:ring-1 focus:ring-[#154c38]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-900 block mb-1">
                    LINE Token หรือ Webhook URL
                  </label>
                  <input
                    type="text"
                    value={lineTokenInput}
                    onChange={(e) => setLineTokenInput(e.target.value)}
                    placeholder="ใส่ LINE Notify Token หรือ Webhook URL..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-[#154c38] focus:ring-1 focus:ring-[#154c38] font-mono"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <label className="flex items-center gap-1.5 text-[11px] text-stone-700 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-[#154c38] focus:ring-[#154c38]" />
                    <span>เมื่อสร้าง PR ใหม่</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-stone-700 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-[#154c38] focus:ring-[#154c38]" />
                    <span>เมื่อ PR ได้รับอนุมัติ</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-stone-700 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-[#154c38] focus:ring-[#154c38]" />
                    <span>เมื่อตรวจรับของ (GR)</span>
                  </label>
                </div>

                {lineResult && (
                  <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                    lineResult.success ? 'bg-emerald-50 text-[#154c38] border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    <CheckCircle2 className="w-4 h-4 text-[#154c38] shrink-0" />
                    <span>{lineResult.msg}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-stone-50/70 border-t border-stone-200 flex items-center justify-between">
              <span className="text-xs text-stone-500">แจ้งเตือนฟรีไม่มีค่าใช้จ่าย</span>

              <button
                type="button"
                onClick={handleTestLine}
                disabled={isSendingLine || !integrations.line_notify?.isEnabled}
                className="px-4 py-2 rounded-full bg-[#154c38] hover:bg-[#103b2b] disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
              >
                <Send className="w-3.5 h-3.5 text-white" />
                {isSendingLine ? 'กำลังส่งทดสอบ...' : 'ทดสอบส่งเข้า LINE (Test)'}
              </button>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 4. DROPBOX & CAD FILES */}
          {/* ============================================================== */}
          <div className="bg-white rounded-3xl border border-stone-200 hover:border-[#154c38] transition-colors shadow-xs overflow-hidden flex flex-col justify-between">
            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#154c38] flex items-center justify-center border border-emerald-200/80 shadow-xs">
                    <Share2 className="w-6 h-6 text-[#154c38]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-stone-900">Dropbox File Sync</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-[#154c38] border border-emerald-200/80">
                        MVP Mock
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5">
                      จัดเก็บไฟล์แนบใบเสนอราคา, สเปกงานก่อสร้าง และแบบถอดปริมาณงาน CAD (.dxf)
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    checked={integrations.dropbox?.isEnabled}
                    onChange={(e) => updateIntegrationConfig('dropbox', { isEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#154c38]"></div>
                </label>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-stone-900 block mb-1">
                    เส้นทางโฟลเดอร์ใน Dropbox (Folder Path)
                  </label>
                  <input
                    type="text"
                    value={dropboxPathInput}
                    onChange={(e) => setDropboxPathInput(e.target.value)}
                    placeholder="/Conerage_Store/Drawings_and_Receipts"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-[#154c38] focus:ring-1 focus:ring-[#154c38] font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-900 block mb-1">
                    Dropbox Shared Folder Link
                  </label>
                  <input
                    type="text"
                    value={dropboxLinkInput}
                    onChange={(e) => setDropboxLinkInput(e.target.value)}
                    placeholder="https://www.dropbox.com/scl/fo/..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-[#154c38] focus:ring-1 focus:ring-[#154c38] font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-stone-50/70 border-t border-stone-200 flex items-center justify-between">
              {dropboxLinkInput ? (
                <a
                  href={dropboxLinkInput}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#154c38] hover:underline flex items-center gap-1"
                >
                  เปิดโฟลเดอร์ Dropbox <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span className="text-xs text-stone-400">ยังไม่ได้ระบุลิงก์โฟลเดอร์</span>
              )}

              <button
                type="button"
                onClick={() => alert('บันทึกการเชื่อมต่อ Dropbox เรียบร้อยแล้ว')}
                className="px-4 py-2 rounded-full bg-[#154c38] hover:bg-[#103b2b] text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
              >
                บันทึกการตั้งค่า
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Google Apps Script Code Generator */}
      {showAppsScriptModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-[#154c38]" />
                <h3 className="text-base font-bold text-stone-900">
                  Google Apps Script สำหรับซิงค์ 2 ทาง (ไม่ต้องมีเซิร์ฟเวอร์)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAppsScriptModal(false)}
                className="text-xs font-bold text-stone-500 hover:text-stone-900"
              >
                ปิด
              </button>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed">
              เพียงคัดลอกโค้ดสคริปต์นี้ ไปวางใน Google Sheets ที่เมนู <strong>ส่วนขยาย (Extensions) &gt; Apps Script</strong> แล้วกด <strong>ทำให้ใช้งานได้ (Deploy)</strong> คุณจะได้ Webhook URL ฟรีๆ ของ Google ไว้บันทึกข้อมูลใบขอซื้อและสต็อกลง Sheets อัตโนมัติ!
            </p>

            <div className="relative">
              <pre className="bg-stone-900 text-stone-200 p-4 rounded-2xl text-xs font-mono overflow-x-auto max-h-72 border border-stone-800">
                {GOOGLE_APPS_SCRIPT_TEMPLATE}
              </pre>
              <button
                type="button"
                onClick={handleCopyScript}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
                {copiedScript ? 'คัดลอกแล้ว!' : 'คัดลอกโค้ด'}
              </button>
            </div>

            <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 text-xs text-stone-800 flex items-start gap-2">
              <Info className="w-4 h-4 text-[#154c38] shrink-0 mt-0.5" />
              <span>
                เมื่อ Deploy แล้ว ให้เลือกสิทธิ์เข้าถึง (Who has access) เป็น <strong>"Anyone" (ทุกคน)</strong> เพื่อให้ระบบ Conerage store สามารถส่งข้อมูลเข้าไปบันทึกได้
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowAppsScriptModal(false)}
                className="px-5 py-2 rounded-full bg-[#154c38] hover:bg-[#103b2b] text-white text-xs font-bold"
              >
                เข้าใจแล้ว ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
