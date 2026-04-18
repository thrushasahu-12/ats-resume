import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { createRequire } from "module";
import { GoogleGenAI, Type } from "@google/genai";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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

  // API Route for Detailed Analysis
  app.post("/api/analyze", async (req, res) => {
    try {
      const { resumeData, jobDescription } = req.body;
      if (!resumeData || !jobDescription) {
        return res.status(400).json({ error: "Missing resumeData or jobDescription" });
      }

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are an expert ATS (Applicant Tracking System) Scanner, Recruiter Reviewer, and Resume Writer. 
        Analyze the following resume against the given job description using the STRICT scoring logic provided.
        
        ATS SCORING LOGIC & WEIGHTS:
        1. Keyword Match (20%): Check role-specific keywords. Example for Data Analyst: SQL, Python, Power BI, Tableau, Data Cleaning, EDA.
        2. Formatting & Structure (15%): Proper headings (Summary, Experience, Skills, Education), no paragraph clutter.
        3. Experience Relevance (20%): Job title alignment with target role, data-focused experience.
        4. Skills Section Quality (15%): Categorized, clearly listed, ATS-readable.
        5. ATS Readability (10%): Parsing friendliness, avoiding dense blocks.
        6. Impact & Metrics (20%): % improvements, KPIs, measurable outcomes.

        Resume Data: ${JSON.stringify(resumeData)}
        Job Description: ${jobDescription}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              classification: { type: Type.STRING, enum: ["Excellent", "Good", "Average", "Needs Improvement"] },
              breakdown: {
                type: Type.OBJECT,
                properties: {
                  keywordMatch: { type: Type.NUMBER },
                  formatting: { type: Type.NUMBER },
                  experienceRelevance: { type: Type.NUMBER },
                  skillsQuality: { type: Type.NUMBER },
                  readability: { type: Type.NUMBER },
                  impact: { type: Type.NUMBER }
                },
                required: ["keywordMatch", "formatting", "experienceRelevance", "skillsQuality", "readability", "impact"]
              },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              criticalIssues: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    current: { type: Type.STRING },
                    suggestion: { type: Type.STRING }
                  },
                  required: ["type", "current", "suggestion"]
                }
              },
              missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              rewriteGuidance: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    before: { type: Type.STRING },
                    after: { type: Type.STRING }
                  },
                  required: ["before", "after"]
                }
              },
              finalVerdict: { type: Type.STRING }
            },
            required: ["score", "classification", "breakdown", "strengths", "criticalIssues", "missingKeywords", "rewriteGuidance", "finalVerdict"]
          }
        }
      });

      res.json(JSON.parse(result.text));
    } catch (error) {
      console.error("AI Analysis Error:", error);
      res.status(500).json({ error: "AI analysis failed", details: error instanceof Error ? error.message : String(error) });
    }
  });

  // API Route for Transformation
  app.post("/api/transform", async (req, res) => {
    try {
      const { resumeData, jobDescription } = req.body;
      if (!resumeData || !jobDescription) {
        return res.status(400).json({ error: "Missing resumeData or jobDescription" });
      }

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a World-Class Resume Writer and ATS Optimization Expert.
        TRANSFORM the following resume based on the Phase 2: AI IMPROVEMENT ENGINE requirements.
        
        STRICT RULES:
        1. Do NOT fabricate unrealistic experience.
        2. Keep improvements realistic and professional.
        3. Use concise, ATS-friendly language.
        4. Focus on Data-Driven alignment (especially if it's a Data Analyst role).
        5. Use strong action verbs and measurable impacts (%, KPIs, ROI).

        Resume Data: ${JSON.stringify(resumeData)}
        Job Description: ${jobDescription}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              improvedResume: {
                type: Type.OBJECT,
                properties: {
                  summary: { type: Type.STRING },
                  skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                  experience: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        company: { type: Type.STRING },
                        position: { type: Type.STRING },
                        location: { type: Type.STRING },
                        period: { type: Type.STRING },
                        highlights: { type: Type.ARRAY, items: { type: Type.STRING } }
                      },
                      required: ["company", "position", "period", "highlights"]
                    }
                  },
                  education: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        school: { type: Type.STRING },
                        degree: { type: Type.STRING },
                        period: { type: Type.STRING }
                      },
                      required: ["school", "degree", "period"]
                    }
                  },
                  contact: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      email: { type: Type.STRING },
                      phone: { type: Type.STRING },
                      location: { type: Type.STRING }
                    }
                  }
                },
                required: ["summary", "skills", "experience", "education"]
              },
              explanation: {
                type: Type.OBJECT,
                properties: {
                  changes: { type: Type.ARRAY, items: { type: Type.STRING } },
                  reasons: { type: Type.ARRAY, items: { type: Type.STRING } },
                  impact: { type: Type.STRING }
                },
                required: ["changes", "reasons", "impact"]
              }
            },
            required: ["improvedResume", "explanation"]
          }
        }
      });

      res.json(JSON.parse(result.text));
    } catch (error) {
      console.error("AI Transformation Error:", error);
      res.status(500).json({ error: "AI transformation failed", details: error instanceof Error ? error.message : String(error) });
    }
  });

  // API Route for Structured Data Extraction
  app.post("/api/extract", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "No text provided for extraction" });
      }

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Extract structured information from this resume text into the requested JSON format.
        Resume Text: ${text}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              experience: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    company: { type: Type.STRING },
                    position: { type: Type.STRING },
                    location: { type: Type.STRING },
                    period: { type: Type.STRING },
                    highlights: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["company", "position", "period", "highlights"]
                }
              },
              education: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    school: { type: Type.STRING },
                    degree: { type: Type.STRING },
                    period: { type: Type.STRING }
                  },
                  required: ["school", "degree", "period"]
                }
              },
              contact: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  email: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  location: { type: Type.STRING }
                }
              }
            },
            required: ["summary", "skills", "experience", "education"]
          }
        }
      });

      res.json(JSON.parse(result.text));
    } catch (error) {
      console.error("Extraction Error:", error);
      res.status(500).json({ error: "Data extraction failed", details: error instanceof Error ? error.message : String(error) });
    }
  });

  // Error handler for API routes
  app.use("/api", (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("API Routing Error:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
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
