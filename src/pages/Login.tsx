import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ShieldCheck, 
  Calendar,
  HelpCircle,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useProcurement } from '../contexts/ProcurementContext';
import { getCurrentYearBE, getCurrentYearCE, getCurrentThaiDateString } from '../lib/utils';
import { LanguageToggle } from '../components/LanguageToggle';

function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.41 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.25C.45 8.16 0 9.98 0 12c0 2.02.45 3.84 1.25 5.43l4.03-3.14z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.59 1.25 6.57l4.03 3.14c.95-2.83 3.6-4.96 6.72-4.96z"
      />
    </svg>
  );
}

export function LoginPage() {
  const { login, loginWithGoogle, isAuthenticated } = useAuth();
  const { isEnglish } = useLanguage();
  const { companyProfile } = useProcurement();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('admin@coneragestore.local');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

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

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);

    try {
      const res = await loginWithGoogle();
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setErrorMessage(res.error || (isEnglish ? 'Google sign-in failed' : 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ'));
      }
    } catch (err: any) {
      setErrorMessage(err?.message || (isEnglish ? 'Failed to sign in with Google' : 'เกิดข้อผิดพลาดในการเชื่อมต่อ Google Account'));
    } finally {
      setIsGoogleLoading(false);
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
        <div className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/80 p-6 sm:p-10 flex flex-col justify-between relative">
          <div>
            {/* Header / Brand Badge */}
            <div className="mb-6 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
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
                <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {/* Google Account Sign-In Button */}
            <div className="mb-5">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading || isGoogleLoading}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 active:border-indigo-500 text-slate-800 font-bold text-sm shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 group"
              >
                {isGoogleLoading ? (
                  <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <GoogleIcon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
                    <span>{isEnglish ? 'Sign in with Google Account' : 'เข้าสู่ระบบด้วย Google Account'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {isEnglish ? 'Or sign in with corporate email' : 'หรือเข้าสู่ระบบด้วยอีเมลองค์กร'}
              </div>
            </div>

            {/* Form */}
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
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
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
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
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
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 font-medium">
                    {isEnglish ? 'Remember session' : 'จดจำการเข้าสู่ระบบบนอุปกรณ์นี้'}
                  </span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">v2.6.0 (2026)</span>
              </div>

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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

          {/* Bottom Security / System Status */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isEnglish ? 'System Online • Secure 256-bit' : 'ระบบออนไลน์พร้อมใช้งาน • พ.ศ. ' + currentBE}</span>
            </span>
            <span>{todayThai}</span>
          </div>

          {/* Forgot Password Modal */}
          {showForgotModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {isEnglish ? 'Need Help Signing In?' : 'ช่วยเหลือการเข้าสู่ระบบ'}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {isEnglish
                    ? 'For enterprise security, password resets must be requested via your IT ERP Administrator or company Helpdesk. Alternatively, you can use your official corporate Google Account to sign in directly.'
                    : 'ตามนโยบายความปลอดภัยของระบบ ERP องค์กร การขอรหัสผ่านใหม่ต้องแจ้งผ่านผู้ดูแลระบบ (IT ERP Administrator) หรือหัวหน้าฝ่ายจัดซื้อ หรือท่านสามารถเข้าสู่ระบบด้วยบัญชี Google Account (Google Workspace) ขององค์กรได้ทันที'}
                </p>
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                  <div className="font-semibold text-slate-900">
                    {isEnglish ? 'IT Support Contact:' : 'ช่องทางติดต่อฝ่ายไอทีและระบบจัดซื้อ:'}
                  </div>
                  <div>📧 อีเมล: <span className="font-mono text-indigo-600">admin@coneragestore.local</span></div>
                  <div>🏢 ฝ่าย: เทคโนโลยีสารสนเทศ (IT ERP & Governance)</div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full mt-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  {isEnglish ? 'Close' : 'เข้าใจแล้ว / ปิดหน้าต่าง'}
                </button>
              </div>
            </div>
          )}
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
