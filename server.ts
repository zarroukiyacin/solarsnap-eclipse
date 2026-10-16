import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import JSZip from "jszip";

dotenv.config();

// Helper to recursively package the repository for GitHub and APK building
function addFolderToZip(folderPath: string, zipFolder: JSZip) {
  const items = fs.readdirSync(folderPath);
  for (const item of items) {
    // Exclude heavy caches, installed modules, git metadata, and build outputs
    if (
      item === "node_modules" ||
      item === "dist" ||
      item === ".git" ||
      item === ".gradle" ||
      item === "build" ||
      item === "build-output" ||
      item === "captures" ||
      item === ".idea" ||
      item === "bun.lock"
    ) {
      continue;
    }
    const fullPath = path.join(folderPath, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      const subZip = zipFolder.folder(item);
      if (subZip) {
        addFolderToZip(fullPath, subZip);
      }
    } else {
      const content = fs.readFileSync(fullPath);
      zipFolder.file(item, content);
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));

  // API Health Check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "SolarSnap Eclipse Camera" });
  });

  // Export full project as a downloadable ZIP for GitHub & APK build
  app.get("/api/download-project-zip", async (_req, res) => {
    try {
      const zip = new JSZip();
      const rootDir = process.cwd();
      addFolderToZip(rootDir, zip);
      const buffer = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });
      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="solarsnap-eclipse-camera.zip"'
      );
      res.send(buffer);
    } catch (err: any) {
      console.error("ZIP Generation Error:", err);
      res.status(500).json({ error: "Failed to generate ZIP archive" });
    }
  });

  // AI Solar Eclipse Photography & Exposure Advisor API using Gemini
  app.post("/api/ai-advisor", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "Clé API Gemini non configurée dans l'environnement.",
        });
      }

      const { prompt, eclipsePhase, filterType, cameraSettings, userImageBase64 } = req.body;

      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `Tu es un expert astrophotographe spécialisé dans la photographie d'éclipses solaires et conseiller technique pour l'application SolarSnap.
Tu donnes des conseils précis et bienveillants en français pour régler l'appareil photo, choisir les filtres solaires (ex: Solar Snap velcro filter, ND5.0, Mylar, verre soudure #14), respecter la sécurité oculaire et réussir les clichés lors de chaque phase d'éclipse (C1, grains de Baily, anneau de diamant, totalité C2-C3, couronne solaire, protubérances, C4).
Format des réponses: clair, structuré avec des données concrètes (ISO recommandé, Vitesse d'obturation, Valeur d'exposition EV, statut de sécurité du filtre).`;

      const parts: any[] = [];
      
      let contextMsg = `Demande de l'utilisateur: ${prompt || "Analyse mes réglages pour la phase actuelle"}\n`;
      if (eclipsePhase) contextMsg += `Phase de l'éclipse: ${eclipsePhase}\n`;
      if (filterType) contextMsg += `Filtre utilisé: ${filterType}\n`;
      if (cameraSettings) contextMsg += `Réglages actuels: ISO ${cameraSettings.iso}, Expo ${cameraSettings.exposure}EV, Zoom ${cameraSettings.zoom}x, FPS/Intervalle: ${cameraSettings.interval || "Manuel"}\n`;

      parts.push({ text: contextMsg });

      if (userImageBase64) {
        // Strip data header if present
        const cleanBase64 = userImageBase64.replace(/^data:image\/\w+;base64,/, "");
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: cleanBase64,
          },
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: parts,
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });

      res.json({ result: response.text });
    } catch (err: any) {
      console.error("Gemini Advisor Error:", err);
      res.status(500).json({ error: err?.message || "Erreur lors de l'analyse AI" });
    }
  });

  // Serve static files in prod or use Vite middleware in dev
  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SolarSnap Express Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
