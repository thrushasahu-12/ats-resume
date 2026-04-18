import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Configure multer for file uploads in memory
  const upload = multer({ storage: multer.memoryStorage() });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "API is running" });
  });

  // API Route for PDF parsing
  app.post("/api/parse", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        console.error("No file in request");
        return res.status(400).json({ error: "No file uploaded" });
      }

      console.log(`Received file: ${req.file.originalname}, size: ${req.file.size}, type: ${req.file.mimetype}`);

      let text = "";
      if (req.file.mimetype === "application/pdf") {
        try {
          console.log("Parsing PDF buffer...");
          const data = await pdf(req.file.buffer);
          text = data.text;
          console.log("PDF parsing successful, character count:", text.length);
        } catch (pdfError) {
          console.error("Internal PDF Parsing Error:", pdfError);
          return res.status(500).json({ 
            error: "Failed to parse PDF content", 
            details: pdfError instanceof Error ? pdfError.message : String(pdfError) 
          });
        }
      } else {
        // Handle text/DOCX (basics for now)
        text = req.file.buffer.toString("utf-8");
        console.log("Text/Other parsing successful, character count:", text.length);
      }

      res.json({ text });
    } catch (error) {
      console.error("General API Error:", error);
      res.status(500).json({ 
        error: "Failed to parse resume file",
        details: error instanceof Error ? error.message : String(error)
      });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
