import { useState, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Camera, 
  Wifi, 
  HardDrive, 
  Bell, 
  Send, 
  ShieldCheck, 
  Package, 
  ArrowRight,
  Loader2,
  Sliders,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useProcurement } from '../contexts/ProcurementContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  runSystemDiagnostics, 
  executeAutoRepair, 
  SystemDiagnosticsReport, 
  DiagnosticItem,
  getDeviceInfo
} from '../services/systemDiagnosticsService';
import { 
  getStoredChatHistory, 
  saveChatHistory, 
  askAICopilot, 
  ChatMessage 
} from '../services/aiAssistantService';

export function AIToolsHub() {
  const { isEnglish } = useLanguage();
  const { prs = [], inventory = [] } = useProcurement();
  const { activeRole } = useAuth();
  const navigate = useNavigate();

  // Diagnostics
  const [report, setReport] = useState<SystemDiagnosticsReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [repairingKey, setRepairingKey] = useState<string | null>(null);
  const [repairFeedback, setRepairFeedback] = useState<string | null>(null);

  // AI Chat
  const [messages, setMessages] = useState<ChatMessage[]>(() => getStoredChatHistory());
  const [inputText, setInputText] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  // Simulator
  const [simulatedAmount, setSimulatedAmount] = useState<number>(75000);

  const pendingPRsCount = (prs || []).filter(pr => pr && pr.status === 'Pending Approval').length;
  const lowStockItems = (inventory || []).filter(item => item && item.quantity <= (item.minQuantity || 10));
  const deviceInfo = getDeviceInfo();

  useEffect(() => {
    handleRunScan();
  }, []);

  const handleRunScan = async () => {
    setIsScanning(true);
    setRepairFeedback(null);
    try {
      const rep = await runSystemDiagnostics();
      setReport(rep);
    } finally {
      setIsScanning(false);
    }
  };

  const handleExecuteRepair = async (actionKey: string) => {
    setRepairingKey(actionKey);
    setRepairFeedback(null);
    try {
      const res = await executeAutoRepair(actionKey);
      setRepairFeedback(isEnglish ? res.messageEn : res.messageTh);
      setTimeout(async () => {
        const rep = await runSystemDiagnostics();
        setReport(rep);
      }, 500);
    } finally {
      setRepairingKey(null);
    }
  };

  const handleRepairAll = async () => {
    setRepairingKey('all');
    setRepairFeedback(null);
    try {
      await executeAutoRepair('repair_camera');
      await executeAutoRepair('repair_storage');
      await executeAutoRepair('repair_sync');
      setRepairFeedback(isEnglish ? 'All safe auto-repairs executed successfully!' : 'ดำเนินการตรวจสอบและซ่อมแซมระบบครบทุกจุดเรียบร้อยแล้ว');
      const rep = await runSystemDiagnostics();
      setReport(rep);
    } finally {
      setRepairingKey(null);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isAsking) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    saveChatHistory(newHistory);
    setInputText('');
    setIsAsking(true);

    try {
      const result = await askAICopilot(text, {
        userRole: activeRole,
        pendingPRsCount,
        lowStockCount: lowStockItems.length,
        overallHealthScore: report?.overallScore,
      });

      const assistantMsg: ChatMessage = {
        id: `assistant_${Date.now()}`,
        sender: 'assistant',
        text: result.reply,
        suggestedAction: result.suggestedAction,
        isAiOnline: result.isAiOnline,
        timestamp: new Date().toISOString(),
      };

      const updated = [...newHistory, assistantMsg];
      setMessages(updated);
      saveChatHistory(updated);
    } finally {
      setIsAsking(false);
    }
  };

  const quickQuestions = isEnglish ? [
    'Camera barcode scanner permission is blocked',
    'Why is my PR not approved yet?',
    'How to clear cache without losing saved drafts?',
    'Which items need immediate reorder?',
  ] : [
    'กล้องสแกน Barcode/QR Code ใช้งานไม่ได้',
    'ทำไมใบขอซื้อ (PR) ของฉันยังไม่อนุมัติ?',
    'ล้างแคชระบบอย่างไร โดยข้อมูลร่างไม่หาย?',
    'มีสินค้าอะไรบ้างที่ต้องสั่งซื้อด่วน?',
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-[#fcfdfa] via-[#f5f8f4] to-[#edf3ee] text-stone-900 rounded-3xl p-6 sm:p-8 shadow-xs border border-emerald-900/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/90 text-[#154c38] border border-emerald-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#154c38]" />
                {isEnglish ? 'Enterprise AI Self-Service' : 'ระบบ AI ผู้ช่วยและศูนย์ซ่อมแซมตัวเอง'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-600 border border-stone-200 font-mono">
                24/7 Always-On
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900">
              {isEnglish ? 'AI Copilot & Auto-Repair Hub' : 'ศูนย์ผู้ช่วย AI และระบบตรวจสอบ-ซ่อมแซมตนเอง'}
            </h1>
            <p className="text-stone-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {isEnglish 
                ? 'Empowering teams to diagnose issues, resolve camera/cache blockers, and manage procurement operations without relying solely on IT admins.'
                : 'ช่วยให้พนักงานและผู้ใช้งานทุกคนสามารถตรวจสอบ แก้ไขปัญหาทางเทคนิค และจัดการเครื่องมือได้ด้วยตนเองทันที โดยไม่ต้องรอแอดมิน'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleRunScan}
              disabled={isScanning}
              className="px-4 py-2.5 bg-white hover:bg-stone-50 text-stone-800 rounded-full text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer border border-stone-200 shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 text-stone-700 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isEnglish ? 'Scan System' : 'ตรวจสภาพระบบ'}</span>
            </button>
            <button
              type="button"
              onClick={handleRepairAll}
              disabled={repairingKey === 'all'}
              className="px-4 py-2.5 bg-[#154c38] hover:bg-[#103b2b] text-white rounded-full text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer border border-[#154c38]"
            >
              {repairingKey === 'all' ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-white" />
              )}
              <span>{isEnglish ? '1-Click Auto-Repair All' : 'ซ่อมแซมระบบทั้งหมดอัตโนมัติ'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Repair Feedback Banner */}
      {repairFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in duration-200 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{repairFeedback}</span>
        </div>
      )}

      {/* Main Grid: Diagnostics & AI Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Diagnostics Cards (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-indigo-600" />
                  {isEnglish ? 'Hardware & System Status' : 'สถานะฮาร์ดแวร์และสภาพระบบ'}
                </h3>
                <p className="text-slate-500 text-xs">
                  {report ? `${isEnglish ? 'Health Score' : 'ระดับความสมบูรณ์'}: ${report.overallScore}%` : '...'}
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                report?.overallStatus === 'healthy' 
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {report?.overallStatus === 'healthy' ? 'Healthy 100%' : 'Action Needed'}
              </span>
            </div>

            {/* Diagnostic Items */}
            <div className="space-y-3">
              {report?.items.map((item: DiagnosticItem) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-indigo-200 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                        item.status === 'healthy' 
                          ? 'bg-emerald-100 text-emerald-700'
                          : item.status === 'warning'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {item.category === 'camera' && <Camera className="w-4 h-4" />}
                        {item.category === 'cache' && <RefreshCw className="w-4 h-4" />}
                        {item.category === 'network' && <Wifi className="w-4 h-4" />}
                        {item.category === 'storage' && <HardDrive className="w-4 h-4" />}
                        {item.category === 'notifications' && <Bell className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-800">
                            {isEnglish ? item.titleEn : item.titleTh}
                          </h4>
                          {item.status === 'healthy' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {isEnglish ? item.summaryEn : item.summaryTh}
                        </p>
                        {item.details && (
                          <p className="text-[10px] text-slate-400 mt-1 italic">
                            {item.details}
                          </p>
                        )}
                      </div>
                    </div>

                    {item.canAutoFix && item.fixActionKey && (
                      <button
                        type="button"
                        onClick={() => handleExecuteRepair(item.fixActionKey!)}
                        disabled={repairingKey === item.fixActionKey}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs transition-colors border border-indigo-200 shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        {repairingKey === item.fixActionKey ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Wrench className="w-3 h-3" />
                        )}
                        <span>{isEnglish ? item.fixButtonTextEn : item.fixButtonTextTh}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Device Environment Info */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
              <span>{deviceInfo.browser} ({deviceInfo.os})</span>
              <span className="flex items-center gap-1">
                {deviceInfo.isStandalonePWA ? '📱 PWA App' : '🌐 Web Browser'} | 
                <span className={deviceInfo.isSecureContext ? 'text-emerald-600 font-medium' : 'text-amber-600'}>
                  {deviceInfo.isSecureContext ? ' HTTPS Secure' : ' Non-HTTPS'}
                </span>
              </span>
            </div>
          </div>

          {/* Quick Tools Box */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              {isEnglish ? 'Approval Matrix Tier Simulator' : 'จำลองสายการอนุมัติตามยอดเงิน'}
            </h3>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                {isEnglish ? 'Test Total PR Amount (THB)' : 'ลองใส่ยอดวงเงินที่ต้องการขอซื้อ (บาท)'}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={simulatedAmount}
                  onChange={(e) => setSimulatedAmount(Number(e.target.value) || 0)}
                  className="flex-1 text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setSimulatedAmount(200000)}
                  className="text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium"
                >
                  200k
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedAmount(600000)}
                  className="text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium"
                >
                  600k
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">1</span>
                <span>ผู้ขอซื้อ (Requested By)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">2</span>
                <span>ผู้ตรวจสอบด้านเทคนิค/วิศวกรสนาม (Technical Checker)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">3</span>
                <span>แผนกควบคุมงบประมาณ (Cost Control)</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-indigo-900 bg-indigo-100/70 p-2 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">4</span>
                <span>
                  {simulatedAmount > 500000 
                    ? 'กรรมการผู้จัดการ (Managing Director / MD)'
                    : simulatedAmount > 100000
                    ? 'ผู้จัดการฝ่าย / ผู้อำนวยการ (Department Director)'
                    : 'ผู้จัดการแผนก / หัวหน้างาน (Department Manager)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Interactive Copilot (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden h-[740px]">
          {/* Header of Chat */}
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">
                  {isEnglish ? 'Conerage AI Operational Copilot' : 'ถาม-ตอบและแก้ปัญหาผ่าน AI อัจฉริยะ'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {isEnglish ? 'Ask anything regarding PR, PO, Inventory, or System fixes' : 'ตอบคำถามทุกขั้นตอนการใช้งานและแนวทางแก้ปัญหาเทคนิค'}
                </p>
              </div>
            </div>

            <Link
              to="/manual"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>{isEnglish ? 'Full Manual' : 'คู่มือระบบ'}</span>
            </Link>
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-start gap-3 max-w-[85%]">
                  {msg.sender === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-2xs whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                    }`}
                  >
                    {msg.text}

                    {/* Action buttons inside message */}
                    {msg.suggestedAction && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-2">
                        {msg.suggestedAction === 'repair_camera' && (
                          <button
                            type="button"
                            onClick={() => handleExecuteRepair('repair_camera')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs transition-colors border border-indigo-200 cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>{isEnglish ? 'Test & Fix Camera' : 'ทดสอบและขอสิทธิ์กล้องทันที'}</span>
                          </button>
                        )}
                        {msg.suggestedAction === 'repair_cache' && (
                          <button
                            type="button"
                            onClick={() => handleExecuteRepair('repair_cache')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold rounded-lg text-xs transition-colors border border-amber-200 cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>{isEnglish ? 'Flush Cache & Reload' : 'ล้างแคชและอัปเดตระบบทันที'}</span>
                          </button>
                        )}
                        {msg.suggestedAction === 'navigate_pr' && (
                          <button
                            type="button"
                            onClick={() => navigate('/pr')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs transition-colors border border-indigo-200 cursor-pointer"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                            <span>{isEnglish ? 'Go to Purchase Requests' : 'ไปที่หน้ารายการขอซื้อ (PR)'}</span>
                          </button>
                        )}
                        {msg.suggestedAction === 'navigate_inventory' && (
                          <button
                            type="button"
                            onClick={() => navigate('/inventory')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-lg text-xs transition-colors border border-emerald-200 cursor-pointer"
                          >
                            <Package className="w-3.5 h-3.5" />
                            <span>{isEnglish ? 'Go to Inventory' : 'ไปที่หน้าระบบคลังสินค้า'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {isAsking && (
              <div className="flex items-center gap-2 text-slate-500 text-xs py-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-2xs">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>{isEnglish ? 'Formulating expert solution...' : 'AI กำลังประมวลผลคำตอบและตรวจจับวิธีแก้ปัญหา...'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                className="text-xs whitespace-nowrap bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-3 py-1.5 rounded-full transition-colors shrink-0 border border-slate-200 cursor-pointer shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isEnglish ? "Type your question or system problem..." : "พิมพ์คำถาม ปัญหาการใช้งาน หรือข้อสงสัยในการทำงาน..."}
                className="flex-1 text-xs sm:text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                disabled={isAsking}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isAsking}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer font-semibold text-xs sm:text-sm flex items-center gap-1.5 shrink-0 shadow-xs"
              >
                <span>{isEnglish ? 'Send' : 'ส่งคำถาม'}</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
