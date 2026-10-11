import { useState } from 'react';
import { User, Building, Bell, Shield, Globe, Save, Database, CheckCircle2, Languages, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
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
                <h3 className="text-lg font-bold text-slate-800">การแจ้งเตือน</h3>
                <p className="text-sm text-slate-500 mt-1">เลือกช่องทางและเหตุการณ์ที่คุณต้องการรับการแจ้งเตือน</p>
              </div>
              <hr className="border-slate-100" />
              <div className="space-y-5">
                <div className="flex items-start justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                     <h4 className="text-sm font-bold text-slate-800">การขออนุมัติ PR (สำหรับผู้อนุมัติ)</h4>
                     <p className="text-sm text-slate-500 mt-0.5">แจ้งเตือนเมื่อมีใบขอซื้อรอการอนุมัติของคุณ</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 text-sm text-slate-600 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      <span>Email</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm text-slate-600 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      <span>In-app</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-start justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                     <h4 className="text-sm font-bold text-slate-800">สถานะเอกสารเปลี่ยนแปลง</h4>
                     <p className="text-sm text-slate-500 mt-0.5">แจ้งเตือนเมื่อเอกสารที่คุณสร้างได้รับการอนุมัติ ปฏิเสธ หรือรับของ</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 text-sm text-slate-600 cursor-pointer">
                      <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      <span>Email</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm text-slate-600 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      <span>In-app</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-start justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                     <h4 className="text-sm font-bold text-slate-800">แจ้งเตือนสต็อกขั้นต่ำ (Reorder Point)</h4>
                     <p className="text-sm text-slate-500 mt-0.5">แจ้งเตือนเมื่อสินค้าในคลังลดลงต่ำกว่าจุดสั่งซื้อ</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 text-sm text-slate-600 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      <span>Email</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm text-slate-600 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      <span>In-app</span>
                    </label>
                  </div>
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
