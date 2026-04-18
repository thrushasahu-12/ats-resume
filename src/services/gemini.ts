import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ResumeData, TransformationOutcome } from "../types/resume";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function extractResumeData(text: string): Promise<ResumeData> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extract the structured information from this resume text into the requested JSON format.
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

  return JSON.parse(response.text);
}

export async function analyzeResume(resumeData: ResumeData, jobDescription: string): Promise<AnalysisResult> {
  const resumeJson = JSON.stringify(resumeData);
  const response = await ai.models.generateContent({
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

    OUTPUT EXPECTATIONS:
    - classification: 90+ Excellent, 80-89 Good, 70-79 Average, <70 Needs Improvement.
    - criticalIssues: Identify job title misalignment, missing keywords, poor formatting.
    - rewriteGuidance: Provide specific "Before" and "After" examples for bullets.
    - finalVerdict: Professional summary of suitability.

    Resume Data: ${resumeJson}
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

  return JSON.parse(response.text);
}

export async function transformResume(resumeData: ResumeData, jobDescription: string): Promise<TransformationOutcome> {
  const resumeJson = JSON.stringify(resumeData);
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a World-Class Resume Writer and ATS Optimization Expert.
    TRANSFORM the following resume based on the Phase 2: AI IMPROVEMENT ENGINE requirements.
    
    STRICT RULES:
    1. Do NOT fabricate unrealistic experience.
    2. Keep improvements realistic and professional.
    3. Use concise, ATS-friendly language.
    4. Focus on Data-Driven alignment (especially if it's a Data Analyst role).
    5. Use strong action verbs and measurable impacts (%, KPIs, ROI).

    REQUIREMENTS:
    - Optimized Resume Version: Full reconstruction.
    - Keyword-enhanced bullets: Inject target keywords naturally.
    - Improved skills section: Categorized and prioritized.
    - Explanation: Provide a technical breakdown of changes and the reasoning.

    Resume Data: ${resumeJson}
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

  return JSON.parse(response.text);
}
