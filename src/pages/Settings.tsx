import { useState } from 'react';
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
  Zap
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../contexts/NotificationContext';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useOnlineStatus } from '../components/OfflineIndicator';

export function SettingsPage() {
  const { t, language, setLanguage, isEnglish } = useLanguage();
  const { permission, requestPermission, addNotification } = useNotifications();
  const { isInstalled, clearCacheAndUpdate } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const [testSent, setTestSent] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
              <div>
                <h3 className="text-lg font-bold text-slate-800">ข้อมูลบริษัท</h3>
                <p className="text-sm text-slate-500 mt-1">จัดการข้อมูลพื้นฐานของบริษัทสำหรับใช้ในเอกสารต่างๆ</p>
              </div>
              <hr className="border-slate-100" />
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">ชื่อบริษัท</label>
                  <input type="text" defaultValue="บริษัท ตัวอย่างการก่อสร้าง จำกัด" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">เลขประจำตัวผู้เสียภาษี</label>
                  <input type="text" defaultValue="01055xxxxxxxx" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-1.5 border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <label className="text-sm font-bold text-slate-700 flex items-center mb-3">
                    <Globe className="h-4 w-4 mr-2" />
                    รูปแบบการตั้งรหัสเอกสาร (Format)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600">ใบขอซื้อ (PR)</label>
                      <input type="text" defaultValue="PR-YYYY-XXX" className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600">ใบสั่งซื้อ (PO)</label>
                      <input type="text" defaultValue="PO-YYYY-XXX" className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">คำอธิบาย: YYYY = ปี ค.ศ., XXX = Running Number 3 หลัก</p>
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
                      <span>Active (v2.4)</span>
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

              {/* 3. Cache & Update Maintenance Box */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <RotateCw className="w-4 h-4 text-indigo-600" />
                      <span>การจัดการแคชและการอัปเดตระบบ (Cache & Version Sync)</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      หากมีการอัปเดตระบบใหม่ สามารถกดปุ่มนี้เพื่อล้างไฟล์แคชและโหลดเวอร์ชันล่าสุดมาใช้งาน
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      setIsClearingCache(true);
                      await clearCacheAndUpdate();
                    }}
                    disabled={isClearingCache}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${isClearingCache ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
                    <span>{isClearingCache ? 'กำลังซิงก์...' : 'ล้างแคชและอัปเดตระบบ'}</span>
                  </button>
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
