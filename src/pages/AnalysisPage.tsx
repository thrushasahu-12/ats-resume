import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronLeft, 
  BarChart3, 
  AlertCircle, 
  Zap, 
  ShieldAlert,
  Loader2,
  Sparkles,
  ArrowRight,
  Target,
  FileSearch,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../App';
import { Button, Card, Badge } from '../components/ui-base';
import { analyzeResume, transformResume } from '../services/gemini';
import { ResumeTemplate } from '../components/ResumeTemplate';

export default function AnalysisPage() {
  const { 
    originalData, 
    jobDescription, 
    analysis, 
    setAnalysis, 
    transformation, 
    setTransformation 
  } = useApp();
  const [analyzing, setAnalyzing] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const [view, setView] = useState<'analysis' | 'comparison'>('analysis');
  const navigate = useNavigate();

  useEffect(() => {
    if (!originalData || !jobDescription) {
      navigate('/');
      return;
    }

    if (!analysis) {
      runAnalysis();
    }
  }, [originalData, jobDescription]);

  const runAnalysis = async () => {
    if (!originalData) return;
    setAnalyzing(true);
    try {
      const result = await analyzeResume(originalData, jobDescription);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRebuild = async () => {
    if (!originalData) return;
    setRebuilding(true);
    try {
      const result = await transformResume(originalData, jobDescription);
      setTransformation(result);
      setView('comparison');
    } catch (err) {
      console.error(err);
    } finally {
      setRebuilding(false);
    }
  };

  if (analyzing || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <div className="text-center">
          <h2 className="text-xl font-bold italic-serif">Simulating ATS Scan...</h2>
          <p className="text-slate-500 text-sm">Evaluating keyword saturation and semantic relevance.</p>
        </div>
      </div>
    );
  }

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'Excellent': return 'text-emerald-500';
      case 'Good': return 'text-indigo-400';
      case 'Average': return 'text-amber-500';
      default: return 'text-rose-500';
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Optimization Dashboard</h1>
          <p className="text-slate-500 italic serif">Recruiter-grade analysis of your current profile.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/')} className="rounded-full">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Button onClick={() => navigate('/final')} className="rounded-full shadow-lg shadow-indigo-100">
            Final Preview <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {view === 'analysis' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Header Section: Score & Verdict */}
          <Card className="lg:col-span-8 p-8 bg-slate-900 text-white border-none shadow-xl flex flex-col md:flex-row gap-8 items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-indigo-500/30 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-black">{analysis.score}</div>
                  <div className="text-[10px] uppercase font-bold tracking-tighter text-indigo-300">ATS SCORE</div>
                </div>
              </div>
              <div className={`absolute -bottom-2 translate-y-1/2 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full bg-white text-xs font-black uppercase tracking-widest ${getClassificationColor(analysis.classification)} shadow-lg`}>
                {analysis.classification}
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-bold italic-serif">Final Verdict</h2>
              </div>
              <p className="text-sm text-indigo-100 leading-relaxed italic serif">
                {analysis.finalVerdict}
              </p>
            </div>
          </Card>

          <div className="lg:col-span-4 space-y-6">
            <Card className="p-6 bg-indigo-600 text-white border-none">
              <h3 className="font-bold flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-indigo-200" />
                Strengths Section
              </h3>
              <ul className="space-y-2">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="text-xs flex gap-2 items-start">
                    <span className="text-emerald-400 font-bold tracking-wider shrink-0 mt-0.5">+</span>
                    {s}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Detailed Breakdown */}
          <Card className="lg:col-span-5 p-6">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Detailed Breakdown Table
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 italic serif text-slate-400">
                    <th className="text-left font-normal pb-3 text-xs uppercase tracking-widest">Category</th>
                    <th className="text-right font-normal pb-3 text-xs uppercase tracking-widest">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[
                    { label: "Keyword Match", score: analysis.breakdown.keywordMatch, total: 20 },
                    { label: "Formatting", score: analysis.breakdown.formatting, total: 15 },
                    { label: "Experience Relevance", score: analysis.breakdown.experienceRelevance, total: 20 },
                    { label: "Skills Quality", score: analysis.breakdown.skillsQuality, total: 15 },
                    { label: "ATS Readability", score: analysis.breakdown.readability, total: 10 },
                    { label: "Impact & Metrics", score: analysis.breakdown.impact, total: 20 },
                  ].map((row, i) => (
                    <tr key={i} className="group">
                      <td className="py-4 font-medium text-slate-700">{row.label}</td>
                      <td className="py-4 text-right">
                        <span className="font-bold text-slate-900">{row.score}</span>
                        <span className="text-slate-300 text-xs ml-1">/{row.total}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Critical Issues (High Priority) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-rose-600">
              <ShieldAlert className="w-6 h-6" />
              <h2 className="text-xl font-bold">Critical Issues Section</h2>
              <Badge variant="error" className="ml-auto">High Priority</Badge>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {analysis.criticalIssues.map((issue, i) => (
                <Card key={i} className="p-5 border-l-4 border-l-rose-500 bg-rose-50/30">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase font-black tracking-widest text-rose-500">Problem: {issue.type}</span>
                  </div>
                  <div className="space-y-3">
                    <div className="text-xs text-slate-500 bg-white/50 p-2 rounded border border-rose-100">
                      <span className="font-bold text-rose-700">Current: </span>
                      "{issue.current}"
                    </div>
                    <div className="text-sm font-medium text-slate-800 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      {issue.suggestion}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-8 space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Missing Critical Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.missingKeywords.map((kw, i) => (
                  <Badge key={i} variant="warning" className="px-3 py-1">
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Resume Rewrite Guidance */}
          <div className="lg:col-span-12">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FileSearch className="w-6 h-6 text-indigo-600" />
              Resume Rewrite Guidance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analysis.rewriteGuidance.map((guide, i) => (
                <Card key={i} className="overflow-hidden border-slate-200">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400">Bullet Improvement Example</div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-rose-500 uppercase tracking-tighter">Status Quo</p>
                      <p className="text-sm text-slate-500 line-through decoration-rose-200 italic">"{guide.before}"</p>
                    </div>
                    <div className="space-y-1 relative pt-4 border-t border-slate-50">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">AI Transformation</p>
                      <p className="text-sm font-medium text-slate-800 leading-relaxed">"{guide.after}"</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Action CTA */}
          <div className="lg:col-span-12">
            <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 border-none p-12 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-indigo-500 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-emerald-500 blur-[120px] rounded-full" />
              </div>
              
              <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
                <div className="inline-block p-4 bg-white/10 rounded-3xl backdrop-blur-sm">
                  <Sparkles className="w-10 h-10 text-indigo-300" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl font-black tracking-tight">Phase 2: AI Improvement Engine</h2>
                  <p className="text-indigo-100 text-lg italic serif leading-relaxed opacity-80">
                    Your current score of {analysis.score} puts you in the "{analysis.classification}" tier. Let our engine rebuild your resume with architectural perfection, injecting missing keywords and quantifying your impact.
                  </p>
                </div>
                <Button 
                  onClick={handleRebuild} 
                  disabled={rebuilding}
                  className="bg-white text-indigo-900 hover:bg-white/90 h-16 px-12 rounded-full text-xl font-black shadow-2xl transition-transform hover:scale-105"
                >
                  {rebuilding ? <><Loader2 className="w-6 h-6 animate-spin mr-3" /> Rebuilding Stack...</> : "Transform My Resume"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Phase 3: Comparison Engine</h2>
                <p className="text-xs text-slate-500">Highlighting architectural improvements and keyword saturation.</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setView('analysis')} className="rounded-full">
              Back to Insights
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[800px]">
            <div className="space-y-4 flex flex-col">
              <div className="flex items-center justify-between px-2 shrink-0">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Original Resume</span>
                <Badge variant="warning">Current Score: {analysis.score}</Badge>
              </div>
              <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 shadow-inner bg-slate-50 relative">
                <div className="absolute inset-0 overflow-y-auto p-4 md:p-8">
                  <ResumeTemplate data={originalData!} className="scale-90 origin-top shadow-xl" />
                </div>
              </div>
            </div>

            <div className="space-y-4 flex flex-col">
              <div className="flex items-center justify-between px-2 shrink-0">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">AI Perfected Profile</span>
                <Badge variant="success">Projected Score: 95+</Badge>
              </div>
              <div className="flex-1 overflow-hidden rounded-2xl border-2 border-indigo-200 shadow-2xl bg-slate-50 relative">
                <div className="absolute inset-0 overflow-y-auto p-4 md:p-8">
                  <ResumeTemplate data={transformation?.improvedResume!} className="scale-90 origin-top shadow-2xl" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card className="md:col-span-2 p-8 bg-slate-900 border-none text-white overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              <h3 className="font-bold text-xl mb-6 text-emerald-400 italic-serif flex items-center gap-2">
                <Zap className="w-5 h-5" /> Structural Improvements
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {transformation?.explanation.changes.map((c, i) => (
                  <div key={i} className="text-sm border border-slate-800 p-4 rounded-xl bg-slate-800/30 flex gap-3 items-start group hover:border-emerald-500/30 transition-colors">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 font-bold text-xs ring-1 ring-emerald-500/20">
                      {i + 1}
                    </span>
                    <span className="text-slate-300 group-hover:text-white transition-colors">{c}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-8 bg-indigo-900 border-none text-white relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-400" />
              <h3 className="font-bold text-xl mb-4 text-indigo-200 italic-serif">AI Reasonings</h3>
              <div className="space-y-4">
                {transformation?.explanation.reasons.map((r, i) => (
                  <p key={i} className="text-sm text-indigo-100/70 italic serif leading-loose border-b border-indigo-800/50 pb-4 last:border-0">
                    "{r}"
                  </p>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-indigo-800/50">
                <Button onClick={() => navigate('/final')} className="w-full h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-black uppercase tracking-widest text-xs">
                  Review Perfected Copy
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
