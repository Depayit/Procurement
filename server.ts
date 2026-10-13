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
