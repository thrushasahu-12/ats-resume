import { AnalysisResult, ResumeData, TransformationOutcome } from "../types/resume";

export async function extractResumeData(text: string): Promise<ResumeData> {
  const response = await fetch('/api/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Extraction failed" }));
    throw new Error(errorData.error || errorData.details || "Data extraction failed");
  }

  return response.json();
}

export async function analyzeResume(resumeData: ResumeData, jobDescription: string): Promise<AnalysisResult> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeData, jobDescription })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Analysis failed" }));
    throw new Error(errorData.error || errorData.details || "ATS Analysis failed");
  }

  return response.json();
}

export async function transformResume(resumeData: ResumeData, jobDescription: string): Promise<TransformationOutcome> {
  const response = await fetch('/api/transform', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeData, jobDescription })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Transformation failed" }));
    throw new Error(errorData.error || errorData.details || "AI Transformation failed");
  }

  return response.json();
}
