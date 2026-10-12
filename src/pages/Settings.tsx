import { useState, useEffect } from 'react';
import { 
  User, 
  Building, 
  Bell, 
  Shield, 
  Globe, 
  Save, 
  Database, 
  CheckCircle2, 
  Languages, 
  Check, 
  Smartphone, 
  BellRing, 
  Send, 
  AlertCircle, 
  Sparkles,
  Wifi,
  RotateCw,
  QrCode,
  Barcode,
  FileText,
  ShoppingCart,
  Download,
  Zap,
  ClipboardCheck,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Eye,
  Upload,
  Image as ImageIcon,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useProcurement, DEFAULT_COMPANY_PROFILE } from '../contexts/ProcurementContext';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useOnlineStatus } from '../components/OfflineIndicator';
import { ApprovalMatrixDocumentTable } from '../components/ApprovalMatrixDocumentTable';
import { DEFAULT_APPROVAL_MATRIX } from '../data/defaultApprovalMatrix';
import type { ApprovalMatrixStep } from '../types';
import { cn } from '../lib/utils';

export function SettingsPage() {
  const { t, language, setLanguage, isEnglish } = useLanguage();
  const { permission, requestPermission, addNotification, broadcastSystemUpdate } = useNotifications();
  const { isInstalled, clearCacheAndUpdate } = usePWAInstall();
  const { 
    approvalMatrix, 
    updateApprovalMatrix, 
    resetApprovalMatrix: contextResetApprovalMatrix,
    companyProfile,
    updateCompanyProfile,
    resetCompanyProfile
  } = useProcurement();
  const isOnline = useOnlineStatus();
  const [testSent, setTestSent] = useState(false);
  const [updateAlertSent, setUpdateAlertSent] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Company Profile State
  const [companyForm, setCompanyForm] = useState(companyProfile);
  const [companySavedAlert, setCompanySavedAlert] = useState(false);

  useEffect(() => {
    setCompanyForm(companyProfile);
  }, [companyProfile]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      alert(isEnglish ? 'File size must not exceed 2.5MB' : 'ไฟล์รูปภาพต้องมีขนาดไม่เกิน 2.5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCompanyForm(prev => ({ ...prev, logoUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setCompanyForm(prev => ({ ...prev, logoUrl: '' }));
  };

  const handleSaveCompany = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateCompanyProfile(companyForm);
    setCompanySavedAlert(true);
    setTimeout(() => setCompanySavedAlert(false), 4000);
  };

  const handleResetCompany = () => {
    if (confirm(isEnglish ? 'Reset company settings and logo to default?' : 'ยืนยันคืนค่าข้อมูลและตราสัญลักษณ์บริษัทเป็นค่ามาตรฐานเริ่มต้น?')) {
      resetCompanyProfile();
      setCompanyForm(DEFAULT_COMPANY_PROFILE);
      setCompanySavedAlert(true);
      setTimeout(() => setCompanySavedAlert(false), 3000);
    }
  };

  // Approval Matrix State
  const [matrixState, setMatrixState] = useState<ApprovalMatrixStep[]>(approvalMatrix);
  const [previewDocType, setPreviewDocType] = useState<'PR' | 'PO'>('PR');
  const [matrixSavedAlert, setMatrixSavedAlert] = useState(false);

  useEffect(() => {
    setMatrixState(approvalMatrix);
  }, [approvalMatrix]);

  const handleStepChange = (id: string, field: keyof ApprovalMatrixStep, value: unknown) => {
    setMatrixState(prev => prev.map(step => {
      if (step.id !== id) return step;
      return { ...step, [field]: value };
    }));
  };

  const handleToggleApplyForm = (id: string, form: 'PR' | 'PO') => {
    setMatrixState(prev => prev.map(step => {
      if (step.id !== id) return step;
      const current = step.appliesTo || [];
      const updated = current.includes(form)
        ? current.filter(f => f !== form)
        : [...current, form];
      return { ...step, appliesTo: updated.length > 0 ? updated : [form] };
    }));
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= matrixState.length) return;
    const newItems = [...matrixState];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, moved);
    setMatrixState(newItems.map((item, idx) => ({ ...item, stepNumber: idx + 1 })));
  };

  const handleAddStep = () => {
    const newStep: ApprovalMatrixStep = {
      id: `step-${Date.now()}`,
      stepNumber: matrixState.length + 1,
      roleKey: `reviewer_${Date.now().toString(36)}`,
      titleTh: `ผู้พิจารณาขั้นตอนที่ ${matrixState.length + 1}`,
      titleEn: `Approver Level ${matrixState.length + 1}`,
      defaultName: '',
      defaultPosition: 'ผู้จัดการแผนก',
      department: 'ฝ่ายบริหาร',
      minAmount: 0,
      appliesTo: ['PR', 'PO'],
      isRequired: true
    };
    setMatrixState(prev => [...prev, newStep]);
  };

  const handleRemoveStep = (id: string) => {
    if (matrixState.length <= 1) {
      alert('สายการอนุมัติต้องมีอย่างน้อย 1 ขั้นตอน');
      return;
    }
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบขั้นตอนนี้?')) {
      const filtered = matrixState.filter(s => s.id !== id);
      setMatrixState(filtered.map((item, idx) => ({ ...item, stepNumber: idx + 1 })));
    }
  };

  const handleSaveApprovalMatrix = () => {
    updateApprovalMatrix(matrixState);
    setMatrixSavedAlert(true);
    addNotification({
      title: isEnglish ? 'Approval Matrix Updated' : 'อัปเดตสายการอนุมัติสำเร็จ',
      message: isEnglish ? 'Corporate Approval Matrix saved and linked to all PR & PO forms.' : 'บันทึกสายการอนุมัติองค์กรและเชื่อมโยงกับแบบฟอร์ม PR / PO เรียบร้อยแล้ว',
      type: 'approval',
      link: '/settings'
    });
    setTimeout(() => setMatrixSavedAlert(false), 3500);
  };

  const handleResetApprovalMatrix = () => {
    if (window.confirm('คุณต้องการรีเซ็ตสายการอนุมัติกลับเป็นค่ามาตรฐานองค์กร 4 ขั้นตอนใช่หรือไม่?')) {
      contextResetApprovalMatrix();
      setMatrixState(DEFAULT_APPROVAL_MATRIX);
      setMatrixSavedAlert(true);
      setTimeout(() => setMatrixSavedAlert(false), 3500);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('บันทึกการตั้งค่าเรียบร้อยแล้ว');
    }, 800);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">{t('settings.title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('settings.subtitle')}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto pb-2 md:pb-0">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'profile' 
                  ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <User className="h-4 w-4 mr-3" />
              {t('settings.tabProfile')}
            </button>
            <button
              onClick={() => setActiveTab('company')}
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'company' 
                  ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Building className="h-4 w-4 mr-3" />
              {t('settings.tabCompany')}
            </button>
            <button
              onClick={() => setActiveTab('approvalMatrix')}
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'approvalMatrix' 
                  ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <ClipboardCheck className="h-4 w-4 mr-3 text-indigo-600" />
              {t('settings.tabApprovalMatrix')}
            </button>
            <button
              onClick={() => setActiveTab('language')}
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'language' 
                  ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Languages className="h-4 w-4 mr-3" />
              {t('settings.tabLanguage')}
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'notifications' 
                  ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Bell className="h-4 w-4 mr-3" />
              {t('settings.tabNotifications')}
            </button>
            <button
              onClick={() => setActiveTab('pwa')}
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'pwa' 
                  ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Smartphone className="h-4 w-4 mr-3" />
              {isEnglish ? 'PWA & App Install' : 'PWA / ติดตั้งแอป'}
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'security' 
                  ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Shield className="h-4 w-4 mr-3" />
              {t('settings.tabSecurity')}
            </button>
            <button
              onClick={() => setActiveTab('backup')}
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'backup' 
                  ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Database className="h-4 w-4 mr-3" />
              {t('settings.tabBackup')}
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {activeTab === 'profile' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">ข้อมูลส่วนตัว</h3>
                <p className="text-sm text-slate-500 mt-1">อัปเดตข้อมูลส่วนตัวและรูปโปรไฟล์ของคุณ</p>
              </div>
              <hr className="border-slate-100" />
              <div className="flex items-center space-x-6">
                <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                  <User className="h-8 w-8 text-slate-400" />
                </div>
                <div>
                  <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
                    เปลี่ยนรูปโปรไฟล์
                  </button>
                  <p className="text-xs text-slate-500 mt-2">JPG, GIF หรือ PNG ขนาดสูงสุด 5MB</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">ชื่อ</label>
                  <input type="text" defaultValue="สมชาย" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">นามสกุล</label>
                  <input type="text" defaultValue="ใจดี" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700">อีเมล</label>
                  <input type="email" defaultValue="somchai@company.com" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-500" readOnly />
                  <p className="text-xs text-slate-500 mt-1">ใช้อีเมลนี้สำหรับการเข้าสู่ระบบ</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">ตำแหน่ง</label>
                  <input type="text" defaultValue="ผู้จัดการฝ่ายจัดซื้อ" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">แผนก</label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option>ฝ่ายจัดซื้อ</option>
                    <option>ฝ่ายบัญชี</option>
                    <option>ฝ่ายบริหาร</option>
                    <option>คลังสินค้า</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'company' && (
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                      <Building className="h-5 w-5" />
                    </span>
                    <h3 className="text-lg font-bold text-slate-800">
                      {isEnglish ? 'Company Profile & Branding' : 'ข้อมูลและตราสัญลักษณ์บริษัท'}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    {isEnglish 
                      ? 'Configure company branding, logo, and legal information to appear automatically on PR, PO documents, and system navigation.'
                      : 'จัดการข้อมูลนิติบุคคล ตราสัญลักษณ์ (Logo) และรูปแบบรหัสเอกสาร โดยเชื่อมโยงโดยตรงกับแบบฟอร์มขอซื้อ (PR) ใบสั่งซื้อ (PO) และแถบเมนู'}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleResetCompany}
                    className="inline-flex items-center px-3 py-2 border border-slate-200 text-xs font-semibold rounded-lg text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
                    title={isEnglish ? 'Reset to default company info' : 'คืนค่าข้อมูลบริษัทเริ่มต้น'}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                    {isEnglish ? 'Reset Default' : 'รีเซ็ตมาตรฐาน'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCompany}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
                  >
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    {isEnglish ? 'Save Changes' : 'บันทึกข้อมูลบริษัท'}
                  </button>
                </div>
              </div>

              {companySavedAlert && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2 animate-in fade-in duration-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    {isEnglish 
                      ? 'Company profile and logo saved successfully! All forms and navigation updated immediately.'
                      : 'บันทึกข้อมูลบริษัทและตราสัญลักษณ์สำเร็จแล้ว! แบบฟอร์มขอซื้อ (PR), สั่งซื้อ (PO) และแถบเมนูทั้งหมดได้รับการอัปเดตทันที'}
                  </span>
                </div>
              )}

              {/* 1. Logo / Icon Upload Section */}
              <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-slate-50/80 via-white to-indigo-50/20 shadow-2xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  {/* Logo Preview */}
                  <div className="relative group shrink-0">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl border-2 border-slate-200 bg-white flex items-center justify-center p-2 shadow-xs overflow-hidden">
                      {companyForm.logoUrl ? (
                        <img 
                          src={companyForm.logoUrl} 
                          alt="Company Logo Preview" 
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 text-center p-2">
                          <ImageIcon className="w-8 h-8 text-slate-300 mb-1" />
                          <span className="text-[11px] font-medium leading-tight">ไม่มีโลโก้</span>
                          <span className="text-[9px] text-slate-400">(ใช้ PS ค่าเริ่มต้น)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Logo Controls */}
                  <div className="space-y-2.5 flex-1 min-w-0">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>{isEnglish ? 'Company Logo / Icon' : 'ตราสัญลักษณ์ / โลโก้บริษัท'}</span>
                        {companyForm.logoUrl && (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {isEnglish ? 'Logo Active' : 'ใช้งานอยู่'}
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isEnglish 
                          ? 'Upload your corporate logo to be displayed on official PR/PO forms, headers, and sidebar.' 
                          : 'อัปโหลดรูปภาพตราสัญลักษณ์ขององค์กรเพื่อแสดงบนหัวเอกสารใบขอซื้อ (PR), ใบสั่งซื้อ (PO), และแถบเมนู'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <label 
                        htmlFor="company-logo-input" 
                        className="inline-flex items-center px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                        {isEnglish ? 'Upload Logo' : 'อัปโหลดไฟล์รูปภาพ'}
                      </label>
                      <input 
                        id="company-logo-input"
                        type="file" 
                        accept="image/png, image/jpeg, image/svg+xml, image/webp" 
                        onChange={handleLogoUpload}
                        className="hidden" 
                      />

                      {companyForm.logoUrl && (
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="inline-flex items-center px-3 py-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1 text-rose-500" />
                          {isEnglish ? 'Remove Logo' : 'ลบโลโก้'}
                        </button>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400">
                      * รองรับไฟล์ PNG, JPG, WebP, SVG ขนาดไม่เกิน 2.5MB (แนะนำพื้นหลังโปร่งใส Transparent หรือสีขาว)
                    </div>

                    {/* Direct URL Input fallback */}
                    <div className="pt-1">
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        หรือระบุ URL รูปภาพโลโก้โดยตรง:
                      </label>
                      <input 
                        type="text" 
                        value={companyForm.logoUrl || ''} 
                        onChange={(e) => setCompanyForm(prev => ({ ...prev, logoUrl: e.target.value }))}
                        placeholder="https://example.com/logo.png หรือ Data URL"
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-white" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Company Information Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    ชื่อบริษัท (ภาษาไทย) <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={companyForm.nameTh || ''} 
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, nameTh: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    ชื่อบริษัท (English) <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={companyForm.nameEn || ''} 
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, nameEn: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    เลขประจำตัวผู้เสียภาษี (Tax ID 13 หลัก) <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={companyForm.taxId || ''} 
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, taxId: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    เบอร์โทรศัพท์ติดต่อ
                  </label>
                  <input 
                    type="text" 
                    value={companyForm.phone || ''} 
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">
                    อีเมลฝ่ายจัดซื้อ / บริษัท
                  </label>
                  <input 
                    type="email" 
                    value={companyForm.email || ''} 
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">
                    ที่อยู่สำนักงาน / สถานประกอบการ (สำหรับพิมพ์บนเอกสาร)
                  </label>
                  <textarea 
                    rows={2}
                    value={companyForm.address || ''} 
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
              </div>

              {/* 3. Document Numbering Format */}
              <div className="space-y-2 border border-slate-200 rounded-xl p-4 bg-slate-50/70">
                <label className="text-xs font-bold text-slate-700 flex items-center">
                  <Globe className="h-4 w-4 mr-1.5 text-indigo-600" />
                  รูปแบบการตั้งรหัสเอกสารอัตโนมัติ (Document Code Format)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">ใบขอซื้อ (PR)</label>
                    <input 
                      type="text" 
                      value={companyForm.docFormatPR || 'PR-YYYY-XXX'} 
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, docFormatPR: e.target.value }))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono bg-white" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">ใบสั่งซื้อ (PO)</label>
                    <input 
                      type="text" 
                      value={companyForm.docFormatPO || 'PO-YYYY-XXX'} 
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, docFormatPO: e.target.value }))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono bg-white" 
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">คำอธิบาย: YYYY = ปี ค.ศ., XXX = Running Number ลำดับเอกสาร</p>
              </div>

              {/* 4. Live Letterhead Preview */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-indigo-600" />
                    <span>ตัวอย่างหัวเอกสารจริง (Official Letterhead Preview)</span>
                  </div>
                  <span className="text-[11px] text-slate-400">ขนาด A4 จริงที่ใช้พิมพ์</span>
                </div>

                <div className="border border-slate-300 rounded-sm p-4 bg-white text-slate-900 text-xs font-sans shadow-2xs">
                  <div className="flex items-start gap-3.5">
                    {companyForm.logoUrl ? (
                      <div className="w-14 h-14 rounded-sm bg-white flex items-center justify-center shrink-0 border border-slate-200 p-1 overflow-hidden shadow-2xs">
                        <img src={companyForm.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-sm bg-slate-900 text-white flex items-center justify-center font-bold text-lg shrink-0 font-mono shadow-2xs">
                        PS
                      </div>
                    )}
                    <div className="min-w-0 flex-1 text-[11px] leading-tight">
                      <div className="font-bold text-[14px] text-slate-900 leading-snug tracking-tight">
                        {companyForm.nameTh || 'ชื่อบริษัทภาษาไทย'}
                      </div>
                      <div className="font-bold text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                        {companyForm.nameEn || 'COMPANY NAME ENGLISH'}
                      </div>
                      <div className="text-[10px] text-slate-600 mt-1 leading-relaxed">
                        {companyForm.address || 'ที่อยู่บริษัท'}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                        เลขประจำตัวผู้เสียภาษี: <span className="font-mono font-semibold text-slate-800">{companyForm.taxId || '-'}</span> • โทร: {companyForm.phone || '-'} • อีเมล: {companyForm.email || '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'approvalMatrix' && (
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                      <ClipboardCheck className="h-5 w-5" />
                    </span>
                    <h3 className="text-lg font-bold text-slate-800">
                      การตรวจสอบและอนุมัติ (APPROVAL MATRIX)
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    กำหนดและปรับแต่งชื่อ ตำแหน่ง วงเงิน และแบบฟอร์มที่ต้องขออนุมัติ สำหรับแต่ละองค์กร โดยเชื่อมโยงโดยตรงกับแบบฟอร์มขอซื้อ (PR) และสั่งซื้อ (PO)
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleResetApprovalMatrix}
                    className="inline-flex items-center px-3 py-2 border border-slate-200 text-xs font-semibold rounded-lg text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
                    title="คืนค่าตารางการอนุมัติมาตรฐานองค์กร 4 ขั้นตอน"
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                    รีเซ็ตมาตรฐาน
                  </button>
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="inline-flex items-center px-3 py-2 border border-indigo-200 text-xs font-semibold rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors shadow-2xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                    เพิ่มขั้นตอน
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveApprovalMatrix}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
                  >
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    บันทึกการตั้งค่า
                  </button>
                </div>
              </div>

              {matrixSavedAlert && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2 animate-in fade-in duration-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>บันทึกสายการอนุมัติ (Approval Matrix) สำเร็จแล้ว! แบบฟอร์มขอซื้อและสั่งซื้อทั้งหมดจะอัปเดตทันที</span>
                </div>
              )}

              {/* Steps List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span>ลำดับขั้นตอนการอนุมัติในระบบ ({matrixState.length} ขั้นตอน)</span>
                  <span className="text-[11px] text-indigo-600 font-normal">
                    * ปรับเปลี่ยนชื่อ ตำแหน่ง และวงเงินได้ตามโครงสร้างของแต่ละองค์กร
                  </span>
                </div>

                {matrixState.map((step, idx) => (
                  <div 
                    key={step.id} 
                    className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-4 hover:border-slate-300 transition-all shadow-2xs"
                  >
                    {/* Step Card Header */}
                    <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-sm text-slate-800">
                            {step.titleTh || `ขั้นตอนที่ ${idx + 1}`}
                          </span>
                          <span className="text-xs text-slate-400 ml-2 font-mono">
                            ({step.titleEn || 'Approver'})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveStep(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 rounded hover:bg-white transition-colors"
                          title="เลื่อนขึ้น"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveStep(idx, 'down')}
                          disabled={idx === matrixState.length - 1}
                          className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 rounded hover:bg-white transition-colors"
                          title="เลื่อนลง"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(step.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors ml-1"
                          title="ลบขั้นตอนนี้"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Step Fields Form */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                      {/* Step Title TH */}
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">ชื่อขั้นตอน (ภาษาไทย)</label>
                        <input
                          type="text"
                          value={step.titleTh}
                          onChange={(e) => handleStepChange(step.id, 'titleTh', e.target.value)}
                          placeholder="เช่น ผู้ขอซื้อ, ผู้ตรวจสอบ, ผู้อนุมัติ"
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Step Title EN */}
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">ชื่อขั้นตอน (English)</label>
                        <input
                          type="text"
                          value={step.titleEn}
                          onChange={(e) => handleStepChange(step.id, 'titleEn', e.target.value)}
                          placeholder="e.g. Requested By, Approved By"
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Default Position */}
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">ตำแหน่งทางการในองค์กร</label>
                        <input
                          type="text"
                          value={step.defaultPosition || ''}
                          onChange={(e) => handleStepChange(step.id, 'defaultPosition', e.target.value)}
                          placeholder="เช่น วิศวกรโครงการ, ผู้อำนวยการสายงาน"
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Default Signer Name */}
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">
                          ชื่อ-สกุล ผู้มีอำนาจประจำตำแหน่ง
                          <span className="text-[10px] text-slate-400 font-normal ml-1">(ระบุเพื่อแสดงเป็นค่าตั้งต้น)</span>
                        </label>
                        <input
                          type="text"
                          value={step.defaultName || ''}
                          onChange={(e) => handleStepChange(step.id, 'defaultName', e.target.value)}
                          placeholder="เว้นว่างหากผู้ใช้แต่ละคนเป็นผู้ลงนาม"
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Department */}
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">ฝ่าย / แผนก</label>
                        <input
                          type="text"
                          value={step.department || ''}
                          onChange={(e) => handleStepChange(step.id, 'department', e.target.value)}
                          placeholder="เช่น โครงการ, บัญชี, บริหาร"
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Min Amount */}
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">
                          วงเงินขั้นต่ำที่ต้องอนุมัติ (บาท)
                          <span className="text-[10px] text-slate-400 font-normal ml-1">(0 = ทุกวงเงิน)</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={step.minAmount ?? 0}
                          onChange={(e) => handleStepChange(step.id, 'minAmount', Number(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Applies to Forms & Options */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60 text-xs">
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-slate-600">เชื่อมโยงกับแบบฟอร์ม:</span>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-700 hover:text-slate-900">
                          <input
                            type="checkbox"
                            checked={step.appliesTo?.includes('PR') ?? true}
                            onChange={() => handleToggleApplyForm(step.id, 'PR')}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="font-medium">ใบขอซื้อ (PR)</span>
                        </label>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-700 hover:text-slate-900">
                          <input
                            type="checkbox"
                            checked={step.appliesTo?.includes('PO') ?? true}
                            onChange={() => handleToggleApplyForm(step.id, 'PO')}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="font-medium">ใบสั่งซื้อ (PO)</span>
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-600">
                          <input
                            type="checkbox"
                            checked={step.isRequired ?? true}
                            onChange={(e) => handleStepChange(step.id, 'isRequired', e.target.checked)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>จำเป็นต้องลงนาม (Required)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Live A4 Document Preview */}
              <div className="mt-8 pt-6 border-t border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-amber-50 text-amber-700 rounded">
                      <Eye className="h-4 w-4" />
                    </span>
                    <h4 className="font-bold text-sm text-slate-800">
                      พรีวิวตารางการลงนามจริงในเอกสารมาตรฐาน A4 (Live Document Preview)
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-medium">
                      <button
                        type="button"
                        onClick={() => setPreviewDocType('PR')}
                        className={cn(
                          "px-3 py-1 rounded-md transition-all",
                          previewDocType === 'PR' 
                            ? "bg-white text-indigo-700 font-bold shadow-2xs" 
                            : "text-slate-600 hover:text-slate-900"
                        )}
                      >
                        แบบฟอร์มขอซื้อ (PR)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewDocType('PO')}
                        className={cn(
                          "px-3 py-1 rounded-md transition-all",
                          previewDocType === 'PO' 
                            ? "bg-white text-indigo-700 font-bold shadow-2xs" 
                            : "text-slate-600 hover:text-slate-900"
                        )}
                      >
                        แบบฟอร์มสั่งซื้อ (PO)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-x-auto">
                  <p className="text-[11px] text-slate-500 mb-2 font-medium">
                    * รูปแบบตารางการลงนามด้านล่างนี้จะแสดงผลอัตโนมัติบนแบบฟอร์ม A4 สำหรับพิมพ์และดาวน์โหลด PDF ของเอกสาร {previewDocType}:
                  </p>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    <ApprovalMatrixDocumentTable
                      steps={matrixState}
                      documentType={previewDocType}
                      documentTotalAmount={374500}
                      isApproved={true}
                      fallbackRequester={{
                        name: 'นายสมชาย ช่างก่อสร้าง',
                        position: 'วิศวกรสนาม (Site Engineer)',
                        date: new Date().toISOString()
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'language' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{t('settings.languageSelectTitle')}</h3>
                <p className="text-sm text-slate-500 mt-1">{t('settings.languageSelectDesc')}</p>
              </div>
              <hr className="border-slate-100" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Thai Option */}
                <div 
                  onClick={() => setLanguage('th')}
                  className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${
                    language === 'th' 
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' 
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">🇹🇭</div>
                      <div>
                        <h4 className="text-base font-bold text-slate-800">ภาษาไทย</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Thai Language (ค่าเริ่มต้น)</p>
                      </div>
                    </div>
                    {language === 'th' && (
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    แสดงผลเมนู, แบบฟอร์มขอซื้อ (PR), การอนุมัติ, และเอกสารทางการเป็นภาษาไทย
                  </div>
                </div>

                {/* English Option */}
                <div 
                  onClick={() => setLanguage('en')}
                  className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${
                    language === 'en' 
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' 
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">🇬🇧</div>
                      <div>
                        <h4 className="text-base font-bold text-slate-800">English</h4>
                        <p className="text-xs text-slate-500 mt-0.5">English Language</p>
                      </div>
                    </div>
                    {language === 'en' && (
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    Display menus, Purchase Request (PR) forms, approvals, and documents in English
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  {language === 'th' 
                    ? 'คุณสามารถสลับภาษาได้ตลอดเวลาจากแถบด้านบน (Header) หรือหน้าการตั้งค่านี้' 
                    : 'You can switch languages anytime from the top header or from this settings page.'}
                </span>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {isEnglish ? 'Notification Preferences' : 'การแจ้งเตือน'}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {isEnglish 
                    ? 'Configure system alerts, browser push notifications, and email channels' 
                    : 'เลือกช่องทางและเหตุการณ์ที่คุณต้องการรับการแจ้งเตือน'}
                </p>
              </div>
              <hr className="border-slate-100" />

              {/* Push & Device Notifications Section */}
              <div className="p-5 rounded-2xl border border-indigo-100 bg-indigo-50/50 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                      <BellRing className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {isEnglish ? 'Device & PWA Push Notifications' : 'การแจ้งเตือนบนอุปกรณ์ (Web / PWA Notifications)'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        {isEnglish 
                          ? 'Get real-time browser popups on desktop or lock-screen notifications on mobile.' 
                          : 'รับการแจ้งเตือนทันทีบนโทรศัพท์มือถือหรือหน้าจอคอมพิวเตอร์เมื่อมีใบขอซื้อรออนุมัติ หรือสถานะเอกสารเปลี่ยนแปลง'}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {permission === 'granted' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{isEnglish ? 'Enabled' : 'เปิดใช้งานแล้ว'}</span>
                      </span>
                    ) : permission === 'denied' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                        <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>{isEnglish ? 'Blocked' : 'ถูกบล็อกในเบราว์เซอร์'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                        <span>{isEnglish ? 'Permission Required' : 'ยังไม่ได้ขอสิทธิ์'}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-indigo-100">
                  {permission !== 'granted' && (
                    <button
                      type="button"
                      onClick={async () => {
                        const granted = await requestPermission();
                        if (granted) {
                          alert(isEnglish ? 'Notifications enabled successfully!' : 'เปิดการแจ้งเตือนสำเร็จแล้ว!');
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>{isEnglish ? 'Request Notification Permission' : 'ขอสิทธิ์เปิดแจ้งเตือนบนอุปกรณ์'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      addNotification({
                        title: isEnglish ? 'Test Alert: PR-2025-001 Approved' : 'ทดสอบแจ้งเตือน: PR-2025-001 ได้รับอนุมัติ',
                        message: isEnglish ? 'ProcureSync PWA notification system is working perfectly!' : 'ระบบแจ้งเตือนของ ProcureSync PWA ทำงานได้อย่างถูกต้องและสมบูรณ์แบบ',
                        type: 'approval',
                        link: '/approvals'
                      });
                      setTestSent(true);
                      setTimeout(() => setTestSent(false), 3000);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{testSent ? (isEnglish ? 'Notification Sent!' : 'ส่งแจ้งเตือนแล้ว!') : (isEnglish ? 'Send Test Notification' : 'ทดสอบส่งการแจ้งเตือน')}</span>
                  </button>
                </div>
              </div>

              {/* Event Subscriptions */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {isEnglish ? 'Alert Events' : 'ประเภทเหตุการณ์ที่ต้องการรับแจ้งเตือน'}
                </h4>

                <div className="flex items-start justify-between p-4 border border-slate-200 rounded-xl bg-white">
                  <div>
                     <h4 className="text-sm font-bold text-slate-800">การขออนุมัติ PR (สำหรับผู้อนุมัติ)</h4>
                     <p className="text-xs text-slate-500 mt-0.5">แจ้งเตือนเมื่อมีใบขอซื้อรอการอนุมัติของคุณในระบบ</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      <span>Email</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      <span>In-app / Push</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-start justify-between p-4 border border-slate-200 rounded-xl bg-white">
                  <div>
                     <h4 className="text-sm font-bold text-slate-800">สถานะเอกสารเปลี่ยนแปลง</h4>
                     <p className="text-xs text-slate-500 mt-0.5">แจ้งเตือนเมื่อเอกสารที่คุณสร้างได้รับการอนุมัติ ปฏิเสธ หรือรับของ</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                      <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      <span>Email</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      <span>In-app / Push</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-start justify-between p-4 border border-slate-200 rounded-xl bg-white">
                  <div>
                     <h4 className="text-sm font-bold text-slate-800">แจ้งเตือนสต็อกขั้นต่ำ (Reorder Point)</h4>
                     <p className="text-xs text-slate-500 mt-0.5">แจ้งเตือนเมื่อสินค้าในคลังลดลงต่ำกว่าเกณฑ์ความปลอดภัย</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      <span>Email</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      <span>In-app / Push</span>
                    </label>
                  </div>
                </div>

                {/* System Update Notification */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-2 border-indigo-100 rounded-xl bg-indigo-50/40">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-indigo-100 text-indigo-700">
                        <Sparkles className="w-3.5 h-3.5" />
                      </span>
                      <h4 className="text-sm font-bold text-slate-800">
                        {isEnglish ? 'System Update & Maintenance Alerts' : 'การแจ้งเตือนการอัพเดตระบบและเวอร์ชันใหม่'}
                      </h4>
                      <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                        v2.5.0
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isEnglish 
                        ? 'Receive real-time notifications when new features, official document templates, or system improvements are deployed.' 
                        : 'แจ้งเตือนเมื่อมีการอัพเดตระบบ เช่น แบบฟอร์มมาตรฐานขาว/ดำ (PR/PO A4 ISO 9001:2015), ระบบ Approval Matrix และบาร์โค้ด SKU คลังกลาง'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                        <span>Email</span>
                      </label>
                      <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                        <span>In-app / Push</span>
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        broadcastSystemUpdate(
                          '2.5.0', 
                          isEnglish 
                            ? 'ProcureSync v2.5.0: Standard Monochrome Forms (PR/PO A4 ISO 9001:2015), Dynamic Approval Matrix & Multi-platform SKU Barcodes.'
                            : 'ระบบ ProcureSync อัพเดตเป็น v2.5.0: แบบฟอร์มทางการ A4 ขาว/ดำ 100%, ระบบ Approval Matrix ปรับแต่งได้ตามองค์กร และบาร์โค้ด Master SKU'
                        );
                        window.dispatchEvent(new CustomEvent('procuresync:show-system-update'));
                        setUpdateAlertSent(true);
                        setTimeout(() => setUpdateAlertSent(false), 3500);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                      title={isEnglish ? 'Send update alert notification to all users' : 'ส่งการแจ้งเตือนการอัพเดตระบบทันที'}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{updateAlertSent ? (isEnglish ? 'Alert Broadcasted!' : 'ส่งแจ้งเตือนแล้ว!') : (isEnglish ? 'Broadcast Update Alert' : 'ส่งแจ้งเตือนอัพเดตระบบ')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pwa' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {isEnglish ? 'Progressive Web App (PWA) & Mobile System' : 'การจัดการระบบแอปและการใช้งาน (PWA & Mobile)'}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {isEnglish 
                    ? 'ProcureSync PWA provides native-like standalone app experience, camera QR scanning, offline caching, and instant home screen shortcuts.' 
                    : 'ระบบ PWA ทำงานเสมือนแอปจริงบนมือถือและคอมพิวเตอร์ รองรับการเปิดกล้องสแกน QR Code โหมดออฟไลน์ และเมนูลัด'}
                </p>
              </div>
              <hr className="border-slate-100" />

              {/* 1. Main Install & Header Banner */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 space-y-5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-bold shadow-md shadow-indigo-200 shrink-0">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">ProcureSync Enterprise PWA</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isInstalled 
                          ? 'โหมดแอปพลิเคชันเดี่ยว (Standalone Mode) • Service Worker v2.4 Active' 
                          : 'พร้อมติดตั้งลงอุปกรณ์ • ทำงานออฟไลน์ • สแกน QR Real-time'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <PWAInstallButton variant="settings" />
                  </div>
                </div>

                {/* Live Diagnostics Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-slate-200/60 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">สถานะการทำงาน</span>
                    <div className="font-bold text-slate-800 flex items-center gap-1.5 mt-1">
                      <span className={`w-2 h-2 rounded-full ${isInstalled ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                      <span>{isInstalled ? 'Standalone App' : 'Web Browser'}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">การเชื่อมต่อเน็ต</span>
                    <div className="font-bold text-slate-800 flex items-center gap-1.5 mt-1">
                      <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span>{isOnline ? 'Online (เชื่อมต่อแล้ว)' : 'Offline (ใช้ออฟไลน์)'}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Service Worker</span>
                    <div className="font-bold text-emerald-700 flex items-center gap-1.5 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Active (v2.5)</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">แคชระบบ (Cache)</span>
                    <div className="font-bold text-indigo-700 flex items-center gap-1.5 mt-1">
                      <Zap className="w-3.5 h-3.5 text-indigo-600" />
                      <span>พร้อมทำงาน</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. PWA App Shortcuts Showcase */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>เมนูลัดของแอป (App Shortcuts บนไอคอนหน้าจอหลัก)</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">แตะค้างที่ไอคอนแอปเพื่อเปิดด่วน</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-slate-900 block font-bold">1. ขอซื้อพัสดุ (PR)</strong>
                      <span className="text-slate-500 text-[11px]">เปิดใบขอซื้อพัสดุหน้างาน</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                      <Barcode className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-slate-900 block font-bold">2. สแกนบาร์โค้ด SKU</strong>
                      <span className="text-slate-500 text-[11px]">ยิงบาร์โค้ด/กล้องส่องเบิกของ</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-slate-900 block font-bold">3. จัดซื้อ & ตรวจรับ (PO)</strong>
                      <span className="text-slate-500 text-[11px]">ตรวจรับสินค้าหน้างาน</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-slate-900 block font-bold">4. คู่มือระบบ (SOP)</strong>
                      <span className="text-slate-500 text-[11px]">อ่านคู่มือมาตรฐานการทำงาน</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Cache & Update Maintenance Box with Changelog */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <RotateCw className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-sm font-bold text-slate-800">
                        การจัดการแคชและการอัปเดตระบบ (System Version & Cache Sync)
                      </h4>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                        v2.5.0
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      หากมีการอัปเดตระบบใหม่ สามารถกดปุ่มนี้เพื่อล้างไฟล์แคช บังคับโหลดเวอร์ชันล่าสุด และแจ้งเตือนผู้ใช้ทุกคน
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        broadcastSystemUpdate('2.5.0');
                        window.dispatchEvent(new CustomEvent('procuresync:show-system-update'));
                        setUpdateAlertSent(true);
                        setTimeout(() => setUpdateAlertSent(false), 3500);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors shrink-0 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{updateAlertSent ? 'ส่งแจ้งเตือนแล้ว!' : 'แจ้งเตือนอัพเดต'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        setIsClearingCache(true);
                        await clearCacheAndUpdate();
                      }}
                      disabled={isClearingCache}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isClearingCache ? 'animate-spin' : ''}`} />
                      <span>{isClearingCache ? 'กำลังซิงก์...' : 'ล้างแคชและอัปเดตระบบ'}</span>
                    </button>
                  </div>
                </div>

                {/* Changelog Highlights */}
                <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                  <div className="font-bold text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ไฮไลต์การอัพเดตระบบล่าสุด (Release Notes v2.5.0):</span>
                  </div>
                  <ul className="text-slate-600 space-y-1 pl-5 list-disc text-[11.5px] leading-relaxed">
                    <li><strong>แบบฟอร์มเอกสารมาตรฐาน A4 ขาว/ดำ 100%:</strong> ทั้งใบขอซื้อ (PR) และใบสั่งซื้อ (PO) กำหนดพื้นหลังสีขาวบริสุทธิ์ ตัวอักษรและเส้นขอบสีดำ รองรับมาตรฐาน ISO 9001:2015</li>
                    <li><strong>ระบบสายการอนุมัติ (Approval Matrix):</strong> กำหนดขั้นตอน วงเงิน ตำแหน่ง และชื่อผู้มีอำนาจลงนามได้ยืดหยุ่น เชื่อมโยงตรงกับทุกแบบฟอร์ม</li>
                    <li><strong>ระบบบาร์โค้ด Master SKU:</strong> รองรับการยิงสแกนบาร์โค้ด 1D Code 128 คลังสินค้าแกนกลาง เชื่อมโยงหลายแพลตฟอร์ม (Shopee, Lazada, TikTok Shop, POS)</li>
                  </ul>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'security' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">ความปลอดภัย</h3>
                <p className="text-sm text-slate-500 mt-1">จัดการรหัสผ่านและประวัติการเข้าสู่ระบบ</p>
              </div>
              <hr className="border-slate-100" />
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-3">เปลี่ยนรหัสผ่าน</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                       <label className="text-sm font-bold text-slate-700">รหัสผ่านเดิม</label>
                       <input type="password" placeholder="••••••••" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-sm font-bold text-slate-700">รหัสผ่านใหม่</label>
                       <input type="password" placeholder="••••••••" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-sm font-bold text-slate-700">ยืนยันรหัสผ่านใหม่</label>
                       <input type="password" placeholder="••••••••" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>
                </div>
                
                <hr className="border-slate-100" />
                
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-slate-800">Two-Factor Authentication (2FA)</h4>
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">ปิดใช้งาน</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-3">เพิ่มความปลอดภัยอีกระดับให้บัญชีของคุณด้วยการยืนยันตัวตนแบบสองขั้นตอน</p>
                  <button className="px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
                    ตั้งค่า 2FA
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">ฐานข้อมูลและสำรองข้อมูล (Database & Backup)</h3>
                <p className="text-sm text-slate-500 mt-1">ตั้งค่าความถี่ในการสำรองข้อมูลระบบอัตโนมัติ</p>
              </div>
              <hr className="border-slate-100" />
              <div className="space-y-6">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">สำรองข้อมูลอัตโนมัติลงฐานข้อมูล (Database)</h4>
                      <p className="text-xs text-slate-500 mt-1">ระบบจะบันทึกข้อมูลทั้งหมดและแยกเก็บต่างหากเพื่อความปลอดภัย</p>
                    </div>
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 mt-4">
                    <label className="text-sm font-bold text-slate-700">ความถี่ในการสำรองข้อมูล</label>
                    <div className="flex items-center space-x-3">
                      <select defaultValue="3" className="w-48 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                        <option value="1">ทุก 1 วัน</option>
                        <option value="3">ทุก 3 วัน</option>
                        <option value="7">ทุก 7 วัน</option>
                        <option value="30">ทุก 30 วัน</option>
                      </select>
                      <button className="px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center">
                        <Save className="h-4 w-4 mr-2" />
                        สำรองข้อมูลเดี๋ยวนี้
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                   <h4 className="text-sm font-bold text-slate-800 mb-3">ประวัติการสำรองข้อมูลล่าสุด</h4>
                   <div className="border border-slate-200 rounded-lg overflow-hidden">
                     <table className="w-full text-sm text-left">
                       <thead className="bg-slate-50 text-xs text-slate-500 font-bold uppercase tracking-wide border-b border-slate-200">
                         <tr>
                           <th className="px-4 py-3">วันที่เวลา</th>
                           <th className="px-4 py-3">ประเภท</th>
                           <th className="px-4 py-3">สถานะ</th>
                           <th className="px-4 py-3 text-right">ขนาด</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                         <tr className="bg-white">
                           <td className="px-4 py-3 text-slate-600">19/05/2026, 02:00 น.</td>
                           <td className="px-4 py-3 text-slate-600">อัตโนมัติ (รอบ 3 วัน)</td>
                           <td className="px-4 py-3 text-emerald-600 font-medium whitespace-nowrap"><span className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> สำเร็จ</span></td>
                           <td className="px-4 py-3 text-slate-500 text-right">12.4 MB</td>
                         </tr>
                         <tr className="bg-white">
                           <td className="px-4 py-3 text-slate-600">16/05/2026, 02:00 น.</td>
                           <td className="px-4 py-3 text-slate-600">อัตโนมัติ (รอบ 3 วัน)</td>
                           <td className="px-4 py-3 text-emerald-600 font-medium whitespace-nowrap"><span className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> สำเร็จ</span></td>
                           <td className="px-4 py-3 text-slate-500 text-right">12.1 MB</td>
                         </tr>
                       </tbody>
                     </table>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70"
            >
              {isSaving ? (
                <>บันทึกข้อมูล...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  บันทึกการตั้งค่า
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
