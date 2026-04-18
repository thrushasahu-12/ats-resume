import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, X, AlertCircle, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import { useApp } from '../App';
import { Button, Card } from '../components/ui-base';
import { extractResumeData } from '../services/gemini';
import { SAMPLE_RESUME, SAMPLE_JOB_DESCRIPTION } from '../constants/sample';

export default function UploadPage() {
  const { setOriginalText, setOriginalData, jobDescription, setJobDescription } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  } as any);

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload your resume first.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please paste a job description.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Upload to backend for parsing
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Server error" }));
        throw new Error(errorData.error || errorData.details || "Failed to parse resume file.");
      }
      
      const { text } = await response.json();
      if (!text || text.trim().length === 0) {
        throw new Error("No text content could be extracted from this file.");
      }
      setOriginalText(text);

      // 2. Extracts structured data via Gemini
      const structuredData = await extractResumeData(text);
      setOriginalData(structuredData);

      // 3. Move to analysis
      navigate('/analysis');
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again with a different file.");
    } finally {
      setLoading(false);
    }
  };

  const handleSample = () => {
    setOriginalData(SAMPLE_RESUME);
    setJobDescription(SAMPLE_JOB_DESCRIPTION);
    setOriginalText("Alex Rivera - Senior Software Architect. Results-driven Software Architect with 8+ years of experience...");
    navigate('/analysis');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold mb-2 uppercase tracking-wider animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-3 h-3" />
          ATS-Optimized Engineering
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Scale your career with <span className="text-indigo-600">AI</span>.
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto italic serif">
          Upload your resume and the target job description. We'll handle the architectural perfection.
        </p>

        <div className="pt-2">
          <button 
            onClick={handleSample}
            className="text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1 mx-auto"
          >
            No resume handy? <span className="underline decoration-slate-300 underline-offset-4">Try with sample data</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
        {/* Step 1: Resume Upload */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold">1</span>
            <h2 className="font-bold text-lg">Your Resume</h2>
          </div>
          
          <div 
            {...getRootProps()} 
            className={`cursor-pointer transition-all duration-200 border-2 border-dashed rounded-2xl p-8 h-64 flex flex-col items-center justify-center gap-4 ${
              isDragActive ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]' : 'border-slate-300 hover:border-slate-400 bg-white'
            }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
                <div className="relative">
                  <FileText className="w-16 h-16 text-indigo-600 mb-2" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="absolute -top-2 -right-2 p-1 bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
                <p className="font-medium text-slate-900 truncate max-w-[200px]">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center">
                  <Upload className="text-indigo-600" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-900">Click to upload or drag & drop</p>
                  <p className="text-sm text-slate-500">PDF or DOCX (Max. 5MB)</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Step 2: Job Description */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold">2</span>
            <h2 className="font-bold text-lg">Job Description</h2>
          </div>
          <div className="relative h-64">
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the target job description here..."
              className="w-full h-full p-6 bg-white border border-slate-300 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all placeholder:text-slate-400 text-sm"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3 text-rose-700 animate-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="flex justify-center pt-6">
        <Button 
          onClick={handleAnalyze} 
          disabled={loading || !file || !jobDescription.trim()}
          className="h-14 px-10 text-lg rounded-full font-bold min-w-[240px]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Building Insights...
            </>
          ) : (
            "Analyze Resume"
          )}
        </Button>
      </div>

      {/* Feature Pills */}
      <div className="flex flex-wrap justify-center gap-6 pt-10 border-t border-slate-200 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
        {["ATS Optimized", "AI Powered", "PDF Export", "Privacy Focused"].map(feature => (
          <div key={feature} className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full border border-slate-200">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
