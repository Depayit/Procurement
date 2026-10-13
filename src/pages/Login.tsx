import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  KeyRound,
  UserCheck,
  Globe2,
  Cpu,
  Calendar
} from 'lucide-react';
import { useAuth, PRESET_USERS } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useProcurement } from '../contexts/ProcurementContext';
import { getCurrentYearBE, getCurrentYearCE, getCurrentThaiDateString, cn } from '../lib/utils';
import { LanguageToggle } from '../components/LanguageToggle';

const QUICK_ROLES = [
  {
    role: 'Admin',
    name: 'สมชาย ใจดี (Admin)',
    email: 'admin@coneragestore.local',
    labelTh: 'ผู้ดูแลระบบสูงสุด',
    labelEn: 'Administrator',
    color: 'from-indigo-600 to-indigo-700 text-white',
    badge: 'Super Admin',
    descTh: 'เข้าถึงทุกระบบ 100%'
  },
  {
    role: 'Purchasing Manager',
    name: 'วิภาวี สุขขี',
    email: 'wipawee.pm@coneragestore.local',
    labelTh: 'ผจก. บริหารงานจัดซื้อ',
    labelEn: 'Purchasing Manager',
    color: 'from-blue-600 to-cyan-600 text-white',
    badge: 'Manager',
    descTh: 'อนุมัติ PR/PO และตรวจสอบราคา'
  },
  {
    role: 'Purchasing Staff',
    name: 'สมปอง จัดซื้อ',
    email: 'sompong.buyer@coneragestore.local',
    labelTh: 'เจ้าหน้าที่จัดซื้อ (Buyer)',
    labelEn: 'Purchasing Staff',
    color: 'from-sky-600 to-blue-700 text-white',
    badge: 'Buyer',
    descTh: 'ออกใบสั่งซื้อ PO และติดต่อผู้ขาย'
  },
  {
    role: 'Approver',
    name: 'นายธีรภัทร บริหารงาน',
    email: 'teerapat.dir@coneragestore.local',
    labelTh: 'คณะกรรมการอนุมัติโครงการ',
    labelEn: 'Executive Approver',
    color: 'from-emerald-600 to-teal-700 text-white',
    badge: 'Approver',
    descTh: 'อนุมัติงบประมาณและวงเงิน'
  },
  {
    role: 'Inventory Control',
    name: 'บุญมี สต๊อก',
    email: 'boonmee.wh@coneragestore.local',
    labelTh: 'เจ้าหน้าที่คลังพัสดุ (Stock)',
    labelEn: 'Inventory Control',
    color: 'from-amber-600 to-orange-600 text-white',
    badge: 'Stock/GR',
    descTh: 'ตรวจรับสินค้า (GR) และตัดสต็อก'
  },
  {
    role: 'Site Engineer',
    name: 'สมชาย ช่างก่อสร้าง',
    email: 'somchai.eng@coneragestore.local',
    labelTh: 'วิศวกรสนาม (Site Engineer)',
    labelEn: 'Site Engineer',
    color: 'from-violet-600 to-purple-700 text-white',
    badge: 'Engineer',
    descTh: 'เปิดใบขอซื้อ PR หน้างาน'
  }
];

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { t, isEnglish } = useLanguage();
  const { companyProfile } = useProcurement();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('admin@coneragestore.local');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in, redirect to destination
  const from = (location.state as any)?.from?.pathname || '/';

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage(isEnglish ? 'Please enter your email' : 'กรุณาระบุอีเมลผู้ใช้งาน');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setErrorMessage(res.error || (isEnglish ? 'Authentication failed' : 'เข้าสู่ระบบไม่สำเร็จ'));
      }
    } catch {
      setErrorMessage(isEnglish ? 'An unexpected error occurred' : 'เกิดข้อผิดพลาดในการเชื่อมต่อระบบ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword('••••••••');
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await login(quickEmail, '123456');
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setErrorMessage(res.error || 'Quick login failed');
      }
    } catch {
      setErrorMessage(isEnglish ? 'Error logging in' : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setIsLoading(false);
    }
  };

  const currentBE = getCurrentYearBE();
  const currentCE = getCurrentYearCE();
  const todayThai = getCurrentThaiDateString(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-between relative selection:bg-indigo-500 selection:text-white">
      {/* Background Glow Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Language Selector & Year Tag */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-4 flex items-center justify-between border-b border-slate-700/50 bg-slate-900/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {companyProfile?.logoUrl ? (
            <img 
              src={companyProfile.logoUrl} 
              alt="Logo" 
              className="w-8 h-8 rounded-lg object-contain bg-white p-0.5 shadow-xs" 
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
              CS
            </div>
          )}
          <div>
            <span className="font-bold text-white text-sm tracking-tight block">
              {companyProfile?.nameTh || 'บริษัท โคนเนอเรจ สโตร์ จำกัด'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium hidden sm:block">
              {companyProfile?.nameEn || 'CONERAGE STORE CO., LTD.'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-indigo-300 font-medium">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>ปี พ.ศ. {currentBE} ({currentCE})</span>
          </div>
          <LanguageToggle />
        </div>
      </header>

      {/* Main Login Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden">
          
          {/* Left Column: Login Form */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
            <div>
              {/* Form Title & Subtitle */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-3">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Enterprise Single Sign-On / Cloud ERP</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {isEnglish ? 'Sign In to Your Workspace' : 'เข้าสู่ระบบจัดการจัดซื้อ'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
                  {isEnglish 
                    ? `Procurement & Inventory Cloud Management Portal • Fiscal Year ${currentCE}` 
                    : `ระบบสารสนเทศจัดซื้อและควบคุมพัสดุก่อสร้าง • ประจำปี พ.ศ. ${currentBE}`}
                </p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{errorMessage}</div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isEnglish ? 'Email Address' : 'อีเมลผู้ใช้งาน (Email)'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@coneragestore.local"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-xl text-sm text-slate-900 outline-none transition-all focus:ring-4 focus:ring-indigo-100 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      {isEnglish ? 'Password' : 'รหัสผ่าน (Password)'}
                    </label>
                    <button 
                      type="button" 
                      onClick={() => alert(isEnglish ? 'Demo mode: Any password accepted or use 1-click Quick Login.' : 'โหมดจำลอง: สามารถใช้รหัสผ่านใดก็ได้ หรือกดเลือกผู้ใช้ด่วนทางขวามือ')}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      {isEnglish ? 'Forgot Password?' : 'ลืมรหัสผ่าน?'}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-xl text-sm text-slate-900 outline-none transition-all focus:ring-4 focus:ring-indigo-100 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-600 font-medium">
                      {isEnglish ? 'Remember session' : 'จดจำการเข้าสู่ระบบบนอุปกรณ์นี้'}
                    </span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">v2.6.0 (2026)</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{isEnglish ? 'Sign In to System' : 'เข้าสู่ระบบ'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Note */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isEnglish ? 'System Online • Secure 256-bit' : 'ระบบออนไลน์พร้อมใช้งาน • พ.ศ. ' + currentBE}</span>
              </span>
              <span>{todayThai}</span>
            </div>
          </div>

          {/* Right Column: 1-Click Quick Demo Login */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100/90 p-6 sm:p-8 border-t lg:border-t-0 lg:border-l border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-800">
                  {isEnglish ? 'Quick Demo Login (1-Click)' : 'เข้าสู่ระบบด่วน 1-คลิก (จำลองบทบาท)'}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                {isEnglish 
                  ? 'Select any corporate persona below to test RBAC permissions, approvals, and workflows instantly:'
                  : 'เลือกบทบาทเจ้าหน้าที่ด้านล่างเพื่อทดสอบระบบจำลองสิทธิ์การเข้าถึง และขั้นตอนการทำงานได้ทันที:'}
              </p>

              {/* Roles List */}
              <div className="space-y-2">
                {QUICK_ROLES.map((r) => {
                  const isCurrent = email === r.email;
                  return (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => handleQuickLogin(r.email)}
                      disabled={isLoading}
                      className={cn(
                        "w-full text-left p-2.5 rounded-xl border transition-all flex items-center gap-3 cursor-pointer group text-xs",
                        isCurrent
                          ? "bg-white border-indigo-600 shadow-sm ring-1 ring-indigo-500"
                          : "bg-white/80 hover:bg-white border-slate-200/80 hover:border-indigo-300 hover:shadow-2xs"
                      )}
                    >
                      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 bg-gradient-to-br", r.color)}>
                        {r.role.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-900 truncate leading-snug">
                            {isEnglish ? r.labelEn : r.labelTh}
                          </p>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 shrink-0">
                            {r.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
                          {r.email}
                        </p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Help Tip */}
            <div className="mt-5 p-3 rounded-xl bg-indigo-50/80 border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed">
              <span className="font-bold block mb-0.5">💡 เคล็ดลับการทดสอบระบบ:</span>
              สามารถสลับบทบาทขณะใช้งานระบบได้ตลอดเวลาจากเมนูมุมขวาบนของหน้าจอ
            </div>
          </div>

        </div>
      </main>

      {/* Footer with Buddhist Era & Company Profile */}
      <footer className="relative z-10 w-full px-4 py-3 text-center text-xs text-slate-400 border-t border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <p>
          © {currentBE} ({currentCE}) {companyProfile?.nameTh || 'บริษัท โคนเนอเรจ สโตร์ จำกัด'} • ระบบจัดซื้อจัดจ้างและบริหารคลังพัสดุมาตรฐานองค์กร (Conerage store ERP)
        </p>
      </footer>
    </div>
  );
}
