/**
 * AI Assistant & Self-Service Troubleshooting Client Service
 * Interacts with backend /api/ai-assistant (Gemini 2.5 Flash) and provides
 * instant offline smart expert fallback for non-admin user empowerment.
 */

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedAction?: string;
  actionDone?: boolean;
  isAiOnline?: boolean;
}

export interface SystemContextPayload {
  userRole?: string;
  pendingPRsCount?: number;
  lowStockCount?: number;
  overallHealthScore?: number;
}

const CHAT_STORAGE_KEY = 'conerage_ai_chat_history';

/**
 * Loads conversation history
 */
export function getStoredChatHistory(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(CHAT_STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const valid = parsed.filter(
          (m): m is ChatMessage =>
            !!m &&
            typeof m === 'object' &&
            typeof (m as ChatMessage).id === 'string' &&
            ((m as ChatMessage).sender === 'user' || (m as ChatMessage).sender === 'assistant') &&
            typeof (m as ChatMessage).text === 'string' &&
            typeof (m as ChatMessage).timestamp === 'string'
        );
        if (valid.length > 0) return valid;
      }
      sessionStorage.removeItem(CHAT_STORAGE_KEY);
    }
  } catch {
    // fallback
  }

  // Default welcome message
  return [
    {
      id: 'welcome_1',
      sender: 'assistant',
      text: `👋 **สวัสดีครับ! ผมคือ Conerage AI Copilot (ผู้ช่วยอัจฉริยะ 24 ชม.)**\n\nผมพร้อมช่วยแก้ปัญหาการทำงานและจัดการเครื่องมือในระบบให้คุณทันที **โดยไม่ต้องรอแอดมิน**:\n\n• 📷 **แก้ปัญหากล้อง/สแกนเนอร์**: สแกนบาร์โค้ดไม่ติด หรือติดสิทธิ์เบราว์เซอร์\n• ⏳ **เช็คสถานะขอซื้อ (PR)**: ดูว่าติดที่ใคร อนุมัติถึงขั้นตอนไหน\n• 📦 **จัดการคลังและของใกล้หมด**: ตรวจจับ Safety Stock และช่วยเปิดใบสั่งซื้อ\n• 🛠️ **ซ่อมแซมระบบ 1-Click**: ล้างแคชค้าง ดึงเวอร์ชันล่าสุด ซิงค์ข้อมูล\n\nคุณสามารถพิมพ์ถาม หรือเลือกกดปุ่มด้านล่างได้เลยครับ!`,
      timestamp: new Date().toISOString(),
      isAiOnline: true,
    }
  ];
}

/**
 * Persists chat history to session storage
 */
export function saveChatHistory(history: ChatMessage[]) {
  try {
    sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(history.slice(-30)));
  } catch {
    // ignore
  }
}

/**
 * Ask AI Copilot (Calls /api/ai-assistant or falls back to local knowledge base)
 */
export async function askAICopilot(
  userQuery: string,
  context: SystemContextPayload = {}
): Promise<{ reply: string; suggestedAction?: string; isAiOnline: boolean }> {
  try {
    const response = await fetch('/api/ai-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userQuery,
        systemContext: context,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        reply: data.reply || 'รับทราบครับ',
        suggestedAction: data.suggestedAction,
        isAiOnline: data.isAiOnline ?? true,
      };
    }
  } catch (err) {
    console.debug('[AI Assistant Client] Offline or backend unreachable, using local knowledge:', err);
  }

  // Local Offline Expert Knowledge Engine
  return generateOfflineExpertReply(userQuery, context);
}

/**
 * Offline Intelligent Expert Reply Engine
 */
function generateOfflineExpertReply(
  query: string,
  context: SystemContextPayload
): { reply: string; suggestedAction?: string; isAiOnline: boolean } {
  const lower = query.toLowerCase();

  // 1. Camera / Barcode / QR Scanner Issues
  if (lower.includes('กล้อง') || lower.includes('สแกน') || lower.includes('camera') || lower.includes('qr') || lower.includes('barcode')) {
    return {
      reply: `📷 **วิธีแก้ปัญหากล้องและเครื่องสแกนบาร์โค้ดไม่ทำงาน:**\n\n1. **อนุญาตสิทธิ์กล้อง**: กดที่ไอคอน 🔒 (แม่กุญแจ) ตรงแถบ URL ด้านบน เลือก "กล้อง" ให้เป็น "อนุญาต (Allow)"\n2. **ใช้การเชื่อมต่อแบบปลอดภัย**: กล้องจะทำงานได้เฉพาะบน HTTPS หรือ localhost เท่านั้น\n3. **ตรวจสอบว่ามีโปรแกรมอื่นใช้งานกล้องอยู่หรือไม่** เช่น LINE หรือหน้าต่างเว็บอื่น\n\n💡 *คุณสามารถกดปุ่มซ่อมแซมกล้องด้านล่างเพื่อทำการทดสอบและรีเซ็ตสิทธิ์ได้ทันทีครับ*`,
      suggestedAction: 'repair_camera',
      isAiOnline: false,
    };
  }

  // 2. PR Workflow & Stuck Approvals
  if (lower.includes('pr') || lower.includes('อนุมัติ') || lower.includes('ขอซื้อ') || lower.includes('ค้าง') || lower.includes('ทำไมยังไม่')) {
    return {
      reply: `⏳ **แนวทางการติดตามและแก้ไขสถานะใบขอซื้อ (PR):**\n\n1. **ลำดับสายการอนุมัติ (Approval Matrix)**:\n   • ขั้นที่ 1: ผู้ขอซื้อ (สร้างและส่งเอกสาร)\n   • ขั้นที่ 2: ผู้ตรวจสอบงานเทคนิค / วิศวกรโครงการ\n   • ขั้นที่ 3: แผนกควบคุมงบประมาณ (Cost Control)\n   • ขั้นที่ 4: ผู้มีอำนาจอนุมัติ (หากเกิน 100,000 บาท ต้องถึงระดับ ผจก.ฝ่าย หรือ MD)\n2. **ตรวจสอบในหน้า 'อนุมัติ (Approvals)'**: หากเอกสารถูกตีกลับ จะมีคอมเมนต์ระบุเหตุผลว่าต้องแก้ไขรายการหรือแนบสเปกเพิ่มเติม\n3. ขณะนี้ในระบบมีใบ PR รอดำเนินการอยู่ทั้งหมด **${context.pendingPRsCount ?? 0}** รายการครับ`,
      suggestedAction: 'navigate_approvals',
      isAiOnline: false,
    };
  }

  // 3. Stale Cache, Reload, White Screen, Updates
  if (lower.includes('แคช') || lower.includes('cache') || lower.includes('ไม่อัปเดต') || lower.includes('ค้าง') || lower.includes('รีเฟรช') || lower.includes('หน้าขาว')) {
    return {
      reply: `🛠️ **วิธีแก้ไขระบบค้าง หรือข้อมูลไม่อัปเดตเป็นเวอร์ชันล่าสุด:**\n\n1. **ล้างแคชระบบ (Flush Cache)**: ระบบ PWA อาจจดจำไฟล์เวอร์ชันเดิมไว้ แนะนำให้กดปุ่ม "ล้างแคชและอัปเดตระบบ" ด้านล่าง\n2. **โหลดหน้าใหม่แบบบังคับ (Hard Reload)**: กดปุ่ม **Ctrl + F5** (หรือปิดแท็บแล้วเปิดใหม่)\n3. ข้อมูลแบบร่างและข้อมูลผู้ใช้ของคุณจะไม่สูญหายครับ`,
      suggestedAction: 'repair_cache',
      isAiOnline: false,
    };
  }

  // 4. Low Stock / Safety Stock Reorder
  if (lower.includes('สต็อก') || lower.includes('หมด') || lower.includes('safety') || lower.includes('พัสดุ') || lower.includes('คลัง')) {
    return {
      reply: `📦 **การจัดการพัสดุใกล้หมดสต็อก (Safety Stock):**\n\n1. ตรวจพบพัสดุในคลังที่อยู่ในเกณฑ์ต่ำกว่าจุดสั่งซื้อทั้งหมด **${context.lowStockCount ?? 0}** รายการ\n2. คุณสามารถเปิดดูรายการพัสดุเหล่านี้ในหน้า "คลังสินค้า" เพื่อตรวจสอบจำนวนคงเหลือและซัพพลายเออร์เดิม\n3. สามารถกดยื่นขอซื้อ (PR) ด่วน เพื่อเติมสต็อกได้ทันทีโดยไม่ต้องรอแอดมินเปิดรายการให้ครับ`,
      suggestedAction: 'navigate_inventory',
      isAiOnline: false,
    };
  }

  // 5. Default General Help
  return {
    reply: `💡 **คำแนะนำการใช้งานระบบ Conerage store:**\n\nคุณสามารถเลือกใช้งานเครื่องมือแก้ปัญหาอัตโนมัติด้านล่างได้ทันที:\n• **ตรวจเช็คสภาพระบบ (Diagnostics)**: ตรวจสุขภาพกล้อง เน็ต แคช และพื้นที่จัดเก็บ\n• **ล้างแคชระบบ**: ดึงไฟล์เวอร์ชันล่าสุด\n• **ตรวจสอบใบขอซื้อ**: ติดตามสายการอนุมัติ\n\nหากต้องการให้ช่วยอะไรเพิ่มเติม สามารถพิมพ์ถามรายละเอียดได้เลยครับ!`,
    suggestedAction: 'run_diagnostics',
    isAiOnline: false,
  };
}
