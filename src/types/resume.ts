export interface ResumeData {
  summary: string;
  experience: ExperienceItem[];
  skills: string[];
  education: EducationItem[];
  contact?: ContactInfo;
}

export interface ExperienceItem {
  company: string;
  position: string;
  location?: string;
  period: string;
  highlights: string[];
}

export interface EducationItem {
  school: string;
  degree: string;
  period: string;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  website?: string;
}

export interface AnalysisResult {
  score: number;
  classification: "Excellent" | "Good" | "Average" | "Needs Improvement";
  breakdown: {
    keywordMatch: number; // /20
    formatting: number; // /15
    experienceRelevance: number; // /20
    skillsQuality: number; // /15
    readability: number; // /10
    impact: number; // /20
  };
  strengths: string[];
  criticalIssues: {
    type: string;
    current: string;
    suggestion: string;
  }[];
  missingKeywords: string[];
  rewriteGuidance: {
    before: string;
    after: string;
  }[];
  finalVerdict: string;
}

export interface TransformationOutcome {
  improvedResume: ResumeData;
  explanation: {
    changes: string[];
    reasons: string[];
    impact: string;
  };
}
