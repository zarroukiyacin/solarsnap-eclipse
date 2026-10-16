var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "25mb" }));
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "SolarSnap Eclipse Camera" });
  });
  app.post("/api/ai-advisor", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "Cl\xE9 API Gemini non configur\xE9e dans l'environnement."
        });
      }
      const { prompt, eclipsePhase, filterType, cameraSettings, userImageBase64 } = req.body;
      const ai = new import_genai.GoogleGenAI({ apiKey });
      const systemInstruction = `Tu es un expert astrophotographe sp\xE9cialis\xE9 dans la photographie d'\xE9clipses solaires et conseiller technique pour l'application SolarSnap.
Tu donnes des conseils pr\xE9cis et bienveillants en fran\xE7ais pour r\xE9gler l'appareil photo, choisir les filtres solaires (ex: Solar Snap velcro filter, ND5.0, Mylar, verre soudure #14), respecter la s\xE9curit\xE9 oculaire et r\xE9ussir les clich\xE9s lors de chaque phase d'\xE9clipse (C1, grains de Baily, anneau de diamant, totalit\xE9 C2-C3, couronne solaire, protub\xE9rances, C4).
Format des r\xE9ponses: clair, structur\xE9 avec des donn\xE9es concr\xE8tes (ISO recommand\xE9, Vitesse d'obturation, Valeur d'exposition EV, statut de s\xE9curit\xE9 du filtre).`;
      const parts = [];
      let contextMsg = `Demande de l'utilisateur: ${prompt || "Analyse mes r\xE9glages pour la phase actuelle"}
`;
      if (eclipsePhase) contextMsg += `Phase de l'\xE9clipse: ${eclipsePhase}
`;
      if (filterType) contextMsg += `Filtre utilis\xE9: ${filterType}
`;
      if (cameraSettings) contextMsg += `R\xE9glages actuels: ISO ${cameraSettings.iso}, Expo ${cameraSettings.exposure}EV, Zoom ${cameraSettings.zoom}x, FPS/Intervalle: ${cameraSettings.interval || "Manuel"}
`;
      parts.push({ text: contextMsg });
      if (userImageBase64) {
        const cleanBase64 = userImageBase64.replace(/^data:image\/\w+;base64,/, "");
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: cleanBase64
          }
        });
      }
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: parts,
        config: {
          systemInstruction,
          temperature: 0.4
        }
      });
      res.json({ result: response.text });
    } catch (err) {
      console.error("Gemini Advisor Error:", err);
      res.status(500).json({ error: err?.message || "Erreur lors de l'analyse AI" });
    }
  });
  if (process.env.NODE_ENV === "production") {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  } else {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
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
//# sourceMappingURL=server.cjs.map
