import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Real-time Version & Deployment API endpoint (Strict no-cache headers)
  app.get(["/api/version", "/version.json"], (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");

    const distPath = path.join(process.cwd(), "dist", "version.json");
    const publicPath = path.join(process.cwd(), "public", "version.json");
    const targetPath = fs.existsSync(distPath) ? distPath : (fs.existsSync(publicPath) ? publicPath : null);

    if (targetPath) {
      try {
        const data = fs.readFileSync(targetPath, "utf-8");
        return res.setHeader("Content-Type", "application/json").send(data);
      } catch {
        // fallback
      }
    }

    return res.json({
      version: "3.0.0",
      buildId: "deploy_" + Date.now(),
      buildTime: new Date().toISOString(),
      appName: "Conerage store"
    });
  });

  // API routes
  // AI Copilot & Self-Service Troubleshooting Endpoint
  app.post("/api/ai-assistant", async (req, res) => {
    try {
      const { message, systemContext = {} } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      const userRole = systemContext.userRole || "พนักงานทั่วไป";
      const pendingPRs = systemContext.pendingPRsCount ?? 0;
      const lowStockCount = systemContext.lowStockCount ?? 0;

      // Detect potential quick action trigger
      let suggestedAction: string | null = null;
      const lowerMsg = (message || "").toLowerCase();

      if (lowerMsg.includes("กล้อง") || lowerMsg.includes("สแกน") || lowerMsg.includes("camera") || lowerMsg.includes("qr") || lowerMsg.includes("barcode")) {
        suggestedAction = "repair_camera";
      } else if (lowerMsg.includes("แคช") || lowerMsg.includes("cache") || lowerMsg.includes("ค้าง") || lowerMsg.includes("ไม่อัปเดต") || lowerMsg.includes("หน้าขาว") || lowerMsg.includes("reload")) {
        suggestedAction = "repair_cache";
      } else if (lowerMsg.includes("ตรวจ") || lowerMsg.includes("เช็คระบบ") || lowerMsg.includes("diagnos") || lowerMsg.includes("ซ่อม")) {
        suggestedAction = "run_diagnostics";
      } else if (lowerMsg.includes("ขอซื้อ") || lowerMsg.includes("pr ") || lowerMsg.includes("ใบขอซื้อ")) {
        suggestedAction = "navigate_pr";
      } else if (lowerMsg.includes("สต็อก") || lowerMsg.includes("สินค้าหมด") || lowerMsg.includes("safety stock") || lowerMsg.includes("คลัง")) {
        suggestedAction = "navigate_inventory";
      }

      // If Gemini API Key is available, use Gemini 2.5 Flash
      if (apiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey });

          const systemPrompt = `คุณคือ "Conerage AI Copilot" ผู้ช่วยอัจฉริยะประจำระบบจัดซื้อและคลังพัสดุ Conerage store
หน้าที่หลักของคุณคือ: ช่วยเหลือพนักงานทุกคน (วิศวกรสนาม, ผู้ขอซื้อ, ผู้จัดการ, เจ้าหน้าที่คลัง, จัดซื้อ) ให้แก้ไขปัญหาการใช้งานระบบและจัดการเครื่องมือได้ด้วยตนเองทันที โดยไม่ต้องรอหรือพึ่งพา System Admin เพียงคนเดียว

บริบทปัจจุบันของผู้ใช้งาน:
- ตำแหน่ง/สิทธิ์ที่ใช้งาน: ${userRole}
- ใบขอซื้อ (PR) ค้างรออนุมัติในระบบ: ${pendingPRs} ใบ
- พัสดุต่ำกว่าจุดสั่งซื้อ (Safety Stock): ${lowStockCount} รายการ

องค์ความรู้ระบบที่คุณเชี่ยวชาญ:
1. การขอซื้อ (PR): การสร้างรายการ, กรอกราคา, ภาษี VAT 7%, การแนบไฟล์สเปก, เอกสารด่วน (Normal, Urgent, Emergency)
2. สายการอนุมัติ (Approval Matrix): ผู้ขอซื้อ -> ผู้ตรวจสอบงานเทคนิค -> แผนกงบประมาณ -> ผู้มีอำนาจอนุมัติตามวงเงิน (เช่น ยอดเกิน 100,000 บาท ต้องถึง ผจก.ฝ่าย/MD)
3. ระบบคลังและเครื่องสแกนบาร์โค้ด: รับเข้า (Stock In), จ่ายออก (Stock Out), ปรับยอด (Adjust), การสแกนผ่านกล้องมือถือ/Webcam หรือเครื่องยิงบาร์โค้ด USB/Bluetooth
4. การออกใบสั่งซื้อ (PO) และตรวจรับพัสดุ: แปลง PR เป็น PO, การตรวจรับบางส่วน (Partial Receiving), ตรวจรับครบ
5. การแก้ปัญหาเทคนิคด้วยตนเอง (Self-Healing Auto-Fix):
   - หากกล้องไม่เปิด: แนะนำให้กดปุ่ม "ทดสอบและขอสิทธิ์กล้องใหม่" หรือคลิกแม่กุญแจ 🔒 ที่แถบ URL ของเบราว์เซอร์แล้วเลือก Allow Camera
   - หากหน้าจอค้าง / ข้อมูลไม่อัปเดต: แนะนำให้กดปุ่ม "ล้างแคชและอัปเดตระบบ (Flush Cache)"
   - หากเน็ตหลุด / ออฟไลน์: ยืนยันว่าระบบมี Local Storage บันทึกร่างเอกสารไว้ ข้อมูลไม่สูญหายแน่นอน และจะซิงค์ขึ้นเซิร์ฟเวอร์ให้อัตโนมัติเมื่อต่อเน็ต

รูปแบบการตอบ:
- สุภาพ กระชับ มั่นใจ ชัดเจน เป็นขั้นตอน 1, 2, 3
- หากเป็นปัญหาทางเทคนิค ให้บอกวิธีแก้ทันที และบอกว่าสามารถกดปุ่มเครื่องมือด้านล่างเพื่อแก้ปัญหาได้เลย`;

          const prompt = `${systemPrompt}\n\nคำถามจากผู้ใช้:\n${message}`;

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
          });

          return res.json({
            reply: response.text,
            suggestedAction,
            isAiOnline: true,
          });
        } catch (genAiErr) {
          console.warn("[AI Assistant] Gemini API error, falling back to local expert:", genAiErr);
        }
      }

      // Intelligent Local Expert Fallback (Works 100% offline or without API Key)
      let fallbackReply = "";
      if (lowerMsg.includes("กล้อง") || lowerMsg.includes("สแกน") || lowerMsg.includes("camera") || lowerMsg.includes("qr") || lowerMsg.includes("barcode")) {
        fallbackReply = `📷 **แนวทางแก้ปัญหากล้องและระบบสแกนบาร์โค้ด:**
1. **อนุญาตสิทธิ์กล้องในเบราว์เซอร์**: แตะที่ไอคอนแม่กุญแจ 🔒 ที่แถบกรอกที่อยู่เว็บไซต์ด้านบนสุด แล้วเปลี่ยนค่า "กล้อง (Camera)" เป็น **อนุญาต (Allow)**
2. **ใช้งานผ่าน HTTPS**: กล้องมือถือจะทำงานได้เฉพาะเมื่อเข้าใช้งานผ่านระบบความปลอดภัย HTTPS เท่านั้น
3. **ตรวจสอบว่ามีแอปอื่นเปิดกล้องค้างอยู่หรือไม่**: เช่น LINE, Zoom หรือกล้องถ่ายรูปทั่วไป
4. 💡 **ซ่อมแซมทันที**: คุณสามารถกดปุ่ม **"ทดสอบและขอสิทธิ์กล้องใหม่"** ด้านล่างเพื่อให้ระบบช่วยรีเซ็ตได้ทันทีครับ`;
      } else if (lowerMsg.includes("อนุมัติ") || lowerMsg.includes("pr") || lowerMsg.includes("ค้าง") || lowerMsg.includes("ทำไมยังไม่")) {
        fallbackReply = `⏳ **วิธีตรวจสอบสถานะและการอนุมัติใบขอซื้อ (PR):**
1. **ตรวจขั้นตอน Approval Matrix**: เอกสารต้องผ่านขั้นตอนตามลำดับ (1. ผู้ขอซื้อ &rarr; 2. ผู้ตรวจสอบเทคนิค &rarr; 3. ผู้ตรวจสอบงบประมาณ &rarr; 4. ผู้อนุมัติ)
2. **ตรวจสอบเพดานวงเงิน**: หากยอดรวมเกิน 100,000 บาท เอกสารจะถูกส่งต่อไปยังระดับผู้จัดการฝ่ายหรือกรรมการผู้จัดการโดยอัตโนมัติ
3. **เช็คในหน้า 'อนุมัติ' (Approvals)**: หากคุณมีสิทธิ์อนุมัติ จะมีแท็บรายการรอดำเนินการขึ้นให้กดอนุมัติหรือตีกลับพร้อมระบุเหตุผลได้ทันที
4. ปัจจุบันในระบบมีใบ PR รอดำเนินการอยู่ทั้งหมด **${pendingPRs}** รายการครับ`;
      } else if (lowerMsg.includes("แคช") || lowerMsg.includes("ค้าง") || lowerMsg.includes("ไม่อัปเดต") || lowerMsg.includes("หน้าขาว") || lowerMsg.includes("ช้า")) {
        fallbackReply = `🛠️ **วิธีแก้ปัญหาระบบค้าง / ข้อมูลไม่อัปเดต:**
1. **ล้างแคชระบบ (Flush Cache)**: กดปุ่ม **"ล้างแคชและอัปเดตระบบ"** ในแท็บตรวจสภาพระบบด้านล่าง ระบบจะเคลียร์ไฟล์เก่าและดึงโค้ดเวอร์ชันล่าสุดมาทันที
2. **รีเฟรชหน้าเว็บ**: กดปุ่ม Ctrl + F5 (หรือกดปุ่ม Reload บนมือถือ)
3. **ความปลอดภัยของข้อมูล**: การล้างแคชจะไม่ทำให้ประวัติใบขอซื้อหรือรหัสผ่านของคุณสูญหายครับ`;
      } else if (lowerMsg.includes("สต็อก") || lowerMsg.includes("หมด") || lowerMsg.includes("safety") || lowerMsg.includes("คลัง")) {
        fallbackReply = `📦 **ระบบจัดการสินค้าคงคลังและจุดสั่งซื้อขั้นต่ำ:**
1. ขณะนี้มีพัสดุในคลังที่อยู่ในเกณฑ์ต่ำกว่าเกณฑ์ปลอดภัย (Safety Stock) ทั้งหมด **${lowStockCount}** รายการ
2. คุณสามารถไปที่เมนู **"คลังสินค้า (Inventory)"** เพื่อดูรายชื่อพัสดุที่ต้องเติม
3. กดปุ่ม **"สร้าง PR เติมสต็อกอัตโนมัติ"** เพื่อให้ระบบดึงรายการพัสดุที่ใกล้หมดไปใส่ในใบขอซื้อทันที ไม่ต้องพิมพ์ทีละรายการครับ`;
      } else {
        fallbackReply = `👋 **สวัสดีครับ! ผมคือ Conerage AI Copilot ผู้ช่วยจัดการระบบ**

ผมพร้อมช่วยเหลือคุณในทุกขั้นตอนเพื่อให้ทำงานต่อได้ทันทีโดยไม่ต้องรอแอดมิน:
- 📷 **แก้ปัญหากล้อง/สแกนเนอร์**: สแกนบาร์โค้ดไม่ติด หรือเบราว์เซอร์บล็อกกล้อง
- 📝 **ระบบขอซื้อ (PR)**: ตรวจสอบสถานะการอนุมัติ, ตรวจเช็คยอดงบประมาณ, แนบไฟล์
- 📦 **ระบบคลังพัสดุ**: เช็คของใกล้หมด, สแกนรับของเข้า-จ่ายออก, ปรับยอดสต็อก
- 🛠️ **ซ่อมแซมระบบ 1-Click**: ล้างแคชค้าง, ดึงเวอร์ชันล่าสุด, ซิงค์ข้อมูลออฟไลน์

💬 คุณสามารถพิมพ์คำถามหรือเลือกฟังก์ชันตรวจสภาพระบบด้านล่างได้เลยครับ!`;
      }

      return res.json({
        reply: fallbackReply,
        suggestedAction,
        isAiOnline: false,
      });
    } catch (err: any) {
      console.error("[AI Assistant Error]:", err);
      return res.status(500).json({
        error: "AI Assistant internal error",
        details: err.message,
      });
    }
  });
  app.post("/api/generate-po-description", async (req, res) => {
    try {
      const { items } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not set." });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `Based on the following purchase request items, write a short, professional purchase order description (1-2 sentences) summarizing the order for the vendor:\n\n${JSON.stringify(items, null, 2)}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      
      res.json({ description: response.text });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: 'Failed to generate PO description', details: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
