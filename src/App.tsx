import React, { createContext, useContext, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Cpu, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { ResumeData, AnalysisResult, TransformationOutcome } from './types/resume';

// --- Context ---
interface AppState {
  originalText: string;
  originalData: ResumeData | null;
  jobDescription: string;
  analysis: AnalysisResult | null;
  transformation: TransformationOutcome | null;
  setOriginalText: (t: string) => void;
  setOriginalData: (d: ResumeData) => void;
  setJobDescription: (jd: string) => void;
  setAnalysis: (a: AnalysisResult) => void;
  setTransformation: (t: TransformationOutcome) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [originalText, setOriginalText] = useState("");
  const [originalData, setOriginalData] = useState<ResumeData | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [transformation, setTransformation] = useState<TransformationOutcome | null>(null);

  return (
    <AppContext.Provider value={{
      originalText, setOriginalText,
      originalData, setOriginalData,
      jobDescription, setJobDescription,
      analysis, setAnalysis,
      transformation, setTransformation
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

// --- Components ---
import UploadPage from './pages/UploadPage';
import AnalysisPage from './pages/AnalysisPage';
import FinalPage from './pages/FinalPage';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const steps = [
    { name: "Upload", path: "/", icon: FileText },
    { name: "Optimize", path: "/analysis", icon: Cpu },
    { name: "Perfect", path: "/final", icon: CheckCircle },
  ];

  const currentStep = steps.findIndex(s => s.path === location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 italic-serif-headers">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <FileText className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight">ATS Pro</span>
            </div>
            
            {/* Steps Progress */}
            <nav className="hidden md:flex items-center gap-8">
              {steps.map((step, idx) => (
                <div key={step.name} className="flex items-center gap-2">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors ${
                    idx <= currentStep ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className={`text-sm font-medium ${
                    idx <= currentStep ? 'text-slate-900' : 'text-slate-500'
                  }`}>
                    {step.name}
                  </span>
                  {idx < steps.length - 1 && <ArrowRight className="w-4 h-4 text-slate-300" />}
                </div>
              ))}
            </nav>

            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              Need Help?
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-top border-slate-200 py-10 mt-auto bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm italic serif">Crafted with precision for modern career scaling.</p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/final" element={<FinalPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}
