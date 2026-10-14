import { useState, useEffect, useRef } from 'react';
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
  MessageSquare, 
  ChevronRight, 
  ChevronLeft,
  Loader2, 
  X,
  Package,
  ArrowRight,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Mic,
  MicOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useProcurement } from '../contexts/ProcurementContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  runSystemDiagnostics, 
  executeAutoRepair, 
  SystemDiagnosticsReport, 
  DiagnosticItem 
} from '../services/systemDiagnosticsService';
import { 
  getStoredChatHistory, 
  saveChatHistory, 
  askAICopilot, 
  ChatMessage 
} from '../services/aiAssistantService';

export function AICopilotWidget() {
  const { isEnglish } = useLanguage();
  const { prs = [], inventory = [] } = useProcurement();
  const { activeRole } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'diagnostics' | 'tools'>('chat');

  // Edge Docking & Touch Slide Gesture State
  const [isHovered, setIsHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);

  // Mobile drawer swipe-to-dismiss gesture state
  const [drawerTouchStartX, setDrawerTouchStartX] = useState<number | null>(null);
  const [drawerTouchStartY, setDrawerTouchStartY] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setTouchDeltaX(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = touchStartX - currentX; // positive when swiping/dragging left
    const diffY = Math.abs(touchStartY - currentY);
    // Only capture if swipe is predominantly horizontal
    if (diffX > 0 && diffX > diffY) {
      setTouchDeltaX(Math.min(diffX, 120));
    }
  };

  const handleTouchEnd = () => {
    if (touchDeltaX > 30) {
      setIsOpen(true);
    }
    setTouchStartX(null);
    setTouchStartY(null);
    setTouchDeltaX(0);
  };

  const handleDrawerTouchStart = (e: React.TouchEvent) => {
    setDrawerTouchStartX(e.touches[0].clientX);
    setDrawerTouchStartY(e.touches[0].clientY);
  };

  const handleDrawerTouchEnd = (e: React.TouchEvent) => {
    if (drawerTouchStartX === null || drawerTouchStartY === null) return;
    const currentX = e.changedTouches[0].clientX;
    const currentY = e.changedTouches[0].clientY;
    const diffX = currentX - drawerTouchStartX; // positive when swiping right (towards edge)
    const diffY = Math.abs(currentY - drawerTouchStartY);
    if (diffX > 60 && diffX > diffY) {
      setIsOpen(false);
    }
    setDrawerTouchStartX(null);
    setDrawerTouchStartY(null);
  };

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>(() => getStoredChatHistory());
  const [inputText, setInputText] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Speech-to-Text Voice Input State (Mobile & Desktop)
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(isEnglish ? 'Voice input is not supported in this browser. Please type your message.' : 'เบราว์เซอร์นี้ยังไม่รองรับการพิมพ์ด้วยเสียง กรุณาพิมพ์คำถามในช่องข้อความ');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = isEnglish ? 'en-US' : 'th-TH';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setInputText(prev => prev ? `${prev} ${transcript}` : transcript);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Diagnostics State
  const [report, setReport] = useState<SystemDiagnosticsReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [repairingKey, setRepairingKey] = useState<string | null>(null);
  const [repairFeedback, setRepairFeedback] = useState<string | null>(null);

  // Tools Simulation State
  const [simulatedAmount, setSimulatedAmount] = useState<number>(35000);

  // Compute live contextual counts
  const pendingPRsCount = (prs || []).filter(pr => pr && pr.status === 'Pending Approval').length;
  const lowStockItems = (inventory || []).filter(item => item && item.quantity <= (item.minQuantity || 10));

  // Auto-scroll chat
  useEffect(() => {
    if (activeTab === 'chat' && isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab, isOpen]);

  // Initial diagnostics scan on open
  useEffect(() => {
    if (isOpen && !report) {
      handleRunScan();
    }
  }, [isOpen]);

  // Listen for global open event
  useEffect(() => {
    const handleOpenCopilot = (e: Event) => {
      const custom = e as CustomEvent<{ tab?: 'chat' | 'diagnostics' | 'tools' }>;
      setIsOpen(true);
      if (custom.detail?.tab) {
        setActiveTab(custom.detail.tab);
      }
    };
    window.addEventListener('app:open-ai-copilot', handleOpenCopilot);
    return () => window.removeEventListener('app:open-ai-copilot', handleOpenCopilot);
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
      // Re-scan after fix
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
      setRepairFeedback(isEnglish ? 'All safe repairs executed successfully!' : 'ดำเนินการตรวจสอบและซ่อมแซมจุดสำคัญทั้งหมดเรียบร้อยแล้ว');
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
    } catch {
      // safe fallback
    } finally {
      setIsAsking(false);
    }
  };

  const handleActionClick = (actionKey: string) => {
    if (actionKey === 'repair_camera') {
      setActiveTab('diagnostics');
      handleExecuteRepair('repair_camera');
    } else if (actionKey === 'repair_cache') {
      setActiveTab('diagnostics');
      handleExecuteRepair('repair_cache');
    } else if (actionKey === 'run_diagnostics') {
      setActiveTab('diagnostics');
      handleRunScan();
    } else if (actionKey === 'navigate_pr') {
      setIsOpen(false);
      navigate('/pr');
    } else if (actionKey === 'navigate_inventory') {
      setIsOpen(false);
      navigate('/inventory');
    } else if (actionKey === 'navigate_approvals') {
      setIsOpen(false);
      navigate('/approvals');
    }
  };

  const quickPrompts = isEnglish ? [
    '📷 Scanner camera not working, how to fix?',
    '⏳ Where is my PR approval stuck?',
    '📦 Which items are below safety stock?',
    '🛠️ Screen frozen or not updating latest version',
  ] : [
    '📷 กล้องสแกน Barcode/QR ไม่ติด แก้ยังไง?',
    '⏳ PR ติดอยู่ที่ใคร ทำไมยังไม่อนุมัติ?',
    '📦 สินค้าใกล้หมดสต็อก มีรายการอะไรบ้าง?',
    '🛠️ ระบบค้าง หรือไม่อัปเดตเวอร์ชันล่าสุด',
  ];

  return (
    <>
      {/* Edge-Docked Folding AI Trigger Handle (Desktop only; on mobile it is in the center of the bottom navigation bar) */}
      {!isOpen && (
        <div 
          className={cn(
            "hidden lg:block fixed right-0 top-[48%] -translate-y-1/2 z-40 select-none",
            touchDeltaX > 0 ? "transition-none" : "transition-transform duration-300 ease-out"
          )}
          style={{
            transform: touchDeltaX > 0 ? `translate(-${touchDeltaX}px, -50%)` : undefined
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button
            id="ai-copilot-floating-trigger"
            type="button"
            onClick={() => setIsOpen(true)}
            className={cn(
              "group relative flex items-center cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] touch-manipulation active:scale-95",
              "bg-gradient-to-l from-indigo-700 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-500",
              "text-white shadow-[-3px_3px_15px_rgba(79,70,229,0.3)] hover:shadow-[-6px_6px_25px_rgba(79,70,229,0.5)]",
              "border-y border-l border-white/30 rounded-l-2xl backdrop-blur-md",
              "before:absolute before:inset-y-[-10px] before:-left-4 before:right-0 before:content-['']",
              isHovered 
                ? "translate-x-0 pr-4 pl-2 py-2.5 sm:py-3" 
                : "translate-x-[calc(100%-11px)] sm:translate-x-[calc(100%-13px)] pr-1 pl-1.5 py-2.5 sm:py-2.5 hover:translate-x-0 hover:pr-4 hover:pl-2"
            )}
            title={isEnglish ? "Slide or tap to open AI Copilot" : "สไลด์หรือแตะเพื่อเปิด AI Copilot"}
            aria-label="Open AI Copilot"
          >
            {/* Edge Grip Indicator (always visible at the edge when folded) */}
            <div className="flex items-center justify-center shrink-0 w-2.5 sm:w-3 text-white/90 mr-1.5">
              <div className="w-1 h-6 sm:h-7 rounded-full bg-white/80 group-hover:bg-white shadow-xs transition-colors" />
            </div>

            {/* Slide-out indicator chevron */}
            <div className="mr-1 flex items-center justify-center text-indigo-200 group-hover:text-white transition-all shrink-0">
              <ChevronLeft className="w-3.5 h-3.5 animate-pulse group-hover:-translate-x-0.5 transition-transform" />
            </div>

            {/* Glowing Bot Icon */}
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center border border-white/20 shadow-inner group-hover:rotate-6 transition-transform">
                <Bot className="w-5 h-5 text-indigo-100" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 border border-white"></span>
              </span>
            </div>

            {/* Expandable Label (peeks out on slide or hover) */}
            <div className="flex flex-col text-left ml-2 min-w-0 pr-1 whitespace-nowrap overflow-hidden transition-all duration-300">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold tracking-tight">AI Copilot</span>
                <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
              </div>
              <span className="text-[10px] text-indigo-100/90 leading-tight">
                {isEnglish ? "Slide or tap to open" : "สไลด์หรือแตะเปิด 24 ชม."}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Main Slide-over / Modal Hub */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          {/* Backdrop on mobile */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div 
            onTouchStart={handleDrawerTouchStart}
            onTouchEnd={handleDrawerTouchEnd}
            className={`relative flex flex-col bg-white shadow-2xl transition-all duration-300 z-10 w-full sm:w-[540px] ${
            isExpanded ? 'sm:w-[780px]' : ''
          } h-[100dvh] border-l border-slate-200 animate-in slide-in-from-right duration-300`}
          >
            
            {/* Header */}
            <div className="flex items-center justify-between px-3.5 sm:px-4 py-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-950/40 shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-md shrink-0">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-bold text-xs sm:text-sm tracking-tight text-white truncate">
                      Conerage AI Copilot
                    </h3>
                    <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                      24/7 Active
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-300 truncate">
                    {isEnglish ? 'Self-Service Assistant & Auto-Repair' : 'ศูนย์ผู้ช่วยแก้ปัญหาและซ่อมแซมระบบอัตโนมัติ'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer mr-0.5"
                  title={isEnglish ? 'Fold back to edge' : 'พับเก็บติดขอบจอ'}
                >
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-[10.5px] sm:text-[11px] font-medium">{isEnglish ? 'Fold' : 'พับติดขอบ'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="hidden sm:inline-flex p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title={isExpanded ? 'Minimize' : 'Maximize'}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title={isEnglish ? 'Close' : 'ปิด'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs (3-column responsive grid on mobile) */}
            <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50/90 p-1.5 gap-1.5 shrink-0 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'chat'
                    ? 'bg-white text-indigo-700 shadow-xs border border-slate-200 font-bold'
                    : 'text-slate-600 hover:bg-white/60'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0 text-indigo-600" />
                <span className="truncate">{isEnglish ? 'AI Chat' : 'ถาม AI'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('diagnostics')}
                className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl transition-all cursor-pointer relative ${
                  activeTab === 'diagnostics'
                    ? 'bg-white text-indigo-700 shadow-xs border border-slate-200 font-bold'
                    : 'text-slate-600 hover:bg-white/60'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                <span className="truncate">{isEnglish ? 'Repair' : 'ตรวจ & ซ่อม'}</span>
                {report && report.overallStatus !== 'healthy' && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tools')}
                className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'tools'
                    ? 'bg-white text-indigo-700 shadow-xs border border-slate-200 font-bold'
                    : 'text-slate-600 hover:bg-white/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-purple-600" />
                <span className="truncate">{isEnglish ? 'Tools' : 'เครื่องมือ'}</span>
              </button>
            </div>

            {/* TAB 1: AI Chat Assistant */}
            {activeTab === 'chat' && (
              <div className="flex flex-col flex-1 min-h-0 bg-slate-50/40">
                {/* Messages stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-start gap-2.5 max-w-[88%]">
                        {msg.sender === 'assistant' && (
                          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                            <Bot className="w-4 h-4" />
                          </div>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-3 text-xs sm:text-[13px] leading-relaxed shadow-2xs whitespace-pre-line ${
                            msg.sender === 'user'
                              ? 'bg-indigo-600 text-white rounded-tr-xs'
                              : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                          }`}
                        >
                          {msg.text}

                          {/* Interactive Action Prompt inside AI response */}
                          {msg.suggestedAction && (
                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-2">
                              {msg.suggestedAction === 'repair_camera' && (
                                <button
                                  type="button"
                                  onClick={() => handleActionClick('repair_camera')}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs transition-colors border border-indigo-200 cursor-pointer"
                                >
                                  <Camera className="w-3.5 h-3.5" />
                                  <span>{isEnglish ? 'Test & Repair Camera' : 'ทดสอบและขอสิทธิ์กล้องทันที'}</span>
                                </button>
                              )}
                              {msg.suggestedAction === 'repair_cache' && (
                                <button
                                  type="button"
                                  onClick={() => handleActionClick('repair_cache')}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold rounded-lg text-xs transition-colors border border-amber-200 cursor-pointer"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span>{isEnglish ? 'Flush Cache & Reload' : 'ล้างแคชและอัปเดตระบบทันที'}</span>
                                </button>
                              )}
                              {msg.suggestedAction === 'run_diagnostics' && (
                                <button
                                  type="button"
                                  onClick={() => handleActionClick('run_diagnostics')}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-lg text-xs transition-colors border border-purple-200 cursor-pointer"
                                >
                                  <Wrench className="w-3.5 h-3.5" />
                                  <span>{isEnglish ? 'Run Full Scan' : 'ตรวจสุขภาพระบบครบ 5 จุด'}</span>
                                </button>
                              )}
                              {msg.suggestedAction === 'navigate_inventory' && (
                                <button
                                  type="button"
                                  onClick={() => handleActionClick('navigate_inventory')}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-lg text-xs transition-colors border border-emerald-200 cursor-pointer"
                                >
                                  <Package className="w-3.5 h-3.5" />
                                  <span>{isEnglish ? 'View Low Stock Items' : 'ดูรายการพัสดุใกล้หมด'}</span>
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
                      <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 animate-spin" />
                      </div>
                      <div className="bg-white border border-slate-200 px-3 py-2 rounded-xl flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                        <span className="text-slate-500">
                          {isEnglish ? 'Analyzing system & formulating answer...' : 'AI กำลังประมวลผลคำตอบและตรวจจับวิธีแก้ปัญหา...'}
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts Chips */}
                <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(prompt)}
                      className="text-xs whitespace-nowrap bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-3 py-2 rounded-full transition-all shrink-0 border border-slate-200 cursor-pointer active:scale-95 font-medium flex items-center gap-1 shadow-2xs"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Chat Input Bar with Voice Input (Speech-to-Text) */}
                <div className="p-3 bg-white border-t border-slate-200 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    {/* Voice Input Button */}
                    <button
                      type="button"
                      onClick={toggleVoiceInput}
                      className={cn(
                        "p-2.5 rounded-xl border transition-all cursor-pointer shrink-0 flex items-center justify-center touch-manipulation active:scale-90",
                        isListening
                          ? "bg-red-500 text-white border-red-600 animate-pulse shadow-md"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                      )}
                      title={isListening 
                        ? (isEnglish ? 'Listening... Tap to stop' : 'กำลังฟังเสียง... แตะเพื่อหยุด') 
                        : (isEnglish ? 'Voice input (Speech-to-text)' : 'พูดเพื่อถาม AI (พิมพ์ด้วยเสียง)')}
                      aria-label="Voice input"
                    >
                      {isListening ? <MicOff className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
                    </button>

                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={isListening 
                        ? (isEnglish ? "Listening... speak now" : "กำลังฟังเสียงของคุณ...") 
                        : (isEnglish ? "Ask AI or tap mic..." : "พิมพ์ถาม AI หรือกดไมค์พูด...")}
                      className="flex-1 text-base sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                      disabled={isAsking}
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim() || isAsking}
                      className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0 touch-manipulation active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 2: Self-Service Auto-Repair & System Diagnostics */}
            {activeTab === 'diagnostics' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {/* Health Score Overview Card */}
                <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 shadow-md relative overflow-hidden">
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-indigo-300 font-semibold">
                        {isEnglish ? 'System Health Status' : 'สถานะความสมบูรณ์ของระบบ'}
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-extrabold text-white">
                          {report ? `${report.overallScore}%` : '...'}
                        </span>
                        <span className="text-xs text-indigo-200">
                          {report?.overallStatus === 'healthy' 
                            ? (isEnglish ? 'All Systems Healthy' : 'ระบบปกติ 100% พร้อมใช้งาน')
                            : (isEnglish ? 'Issues Detected' : 'พบข้อแนะนำที่ควรซ่อมแซม')}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRunScan}
                      disabled={isScanning}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                      <span>{isEnglish ? 'Rescan' : 'สแกนใหม่'}</span>
                    </button>
                  </div>

                  {/* 1-Click Repair All Button */}
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                    <p className="text-[11px] text-slate-300">
                      {isEnglish 
                        ? '1-Click self-repair checks camera, cache, and sync' 
                        : 'กดปุ่มเพื่อสั่งซ่อมแซมระบบอัตโนมัติ ไม่ต้องโทรตามแอดมิน'}
                    </p>
                    <button
                      type="button"
                      onClick={handleRepairAll}
                      disabled={repairingKey === 'all'}
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {repairingKey === 'all' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5" />
                      )}
                      <span>{isEnglish ? 'Auto-Repair All' : 'ซ่อมแซมระบบทั้งหมด'}</span>
                    </button>
                  </div>
                </div>

                {/* Repair Feedback Notice */}
                {repairFeedback && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">{repairFeedback}</span>
                  </div>
                )}

                {/* Diagnostic Items List */}
                <div className="space-y-3">
                  {report?.items.map((item: DiagnosticItem) => (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs hover:border-indigo-200 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                            item.status === 'healthy' 
                              ? 'bg-emerald-50 text-emerald-600'
                              : item.status === 'warning'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-rose-50 text-rose-600'
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
                              ) : item.status === 'warning' ? (
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-rose-500" />
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
                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-[11px] transition-colors border border-indigo-200 shrink-0 cursor-pointer flex items-center gap-1"
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
              </div>
            )}

            {/* TAB 3: Operational Helpers (Quick Self-Service Tools) */}
            {activeTab === 'tools' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {/* Tool 1: Low-Stock Reorder Assistant */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">
                          {isEnglish ? 'Safety Stock Reorder Assistant' : 'ตัวช่วยขอซื้อพัสดุใกล้หมดสต็อก'}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {isEnglish ? `${lowStockItems.length} items below minimum safety level` : `พบพัสดุต่ำกว่าเกณฑ์ ${lowStockItems.length} รายการ`}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        navigate('/inventory');
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isEnglish ? 'View All' : 'ดูทั้งหมด'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {lowStockItems.length > 0 ? (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {lowStockItems.slice(0, 5).map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="font-medium text-slate-700 truncate max-w-[200px]">{item.name}</span>
                          <span className="text-rose-600 font-bold">
                            {item.quantity} / {item.minQuantity || 10} {item.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-600 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                      ✅ {isEnglish ? 'All inventory stocks are within safe levels.' : 'พัสดุทุกรายการอยู่ในเกณฑ์สต็อกปลอดภัย'}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/pr');
                    }}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>{isEnglish ? 'Open New PR with Low-Stock Items' : 'เปิดใบขอซื้อ (PR) เติมสต็อก'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Tool 2: Approval Matrix Tier Simulator */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        {isEnglish ? 'Approval Matrix Simulator' : 'ตัวจำลองสายการอนุมัติตามยอดเงิน'}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {isEnglish ? 'Simulate required approvers before submitting PR' : 'ตรวจสอบว่ายอดขอซื้อนี้ต้องส่งให้ใครอนุมัติบ้าง'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      {isEnglish ? 'Estimated PR Amount (THB)' : 'ระบุยอดรวมที่ต้องการขอซื้อ (บาท)'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={simulatedAmount}
                        onChange={(e) => setSimulatedAmount(Number(e.target.value) || 0)}
                        className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setSimulatedAmount(150000)}
                        className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                      >
                        150k
                      </button>
                      <button
                        type="button"
                        onClick={() => setSimulatedAmount(500000)}
                        className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                      >
                        500k
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">1</span>
                      <span>ผู้ขอซื้อ (Requested By)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">2</span>
                      <span>ผู้ตรวจสอบด้านเทคนิค (Technical Checker)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">3</span>
                      <span>แผนกตรวจสอบงบประมาณ (Cost Control)</span>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-indigo-900 bg-indigo-50/80 p-2 rounded-lg">
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
            )}

            {/* Footer Status Banner */}
            <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shrink-0 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{isEnglish ? 'Conerage AI Engine: Ready' : 'ระบบ AI อัตโนมัติ: พร้อมบริการ 24 ชม.'}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/manual');
                }}
                className="text-indigo-600 hover:underline font-medium"
              >
                {isEnglish ? 'Open System Manual' : 'เปิดดูคู่มือระบบ 5 ส่วน'} &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
