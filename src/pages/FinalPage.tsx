import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Download, 
  Copy, 
  ChevronLeft, 
  Check, 
  FileText, 
  MessageSquare,
  Award,
  Zap,
  ArrowRight
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useApp } from '../App';
import { Button, Card, Badge } from '../components/ui-base';
import { ResumeTemplate } from '../components/ResumeTemplate';

export default function FinalPage() {
  const { transformation, analysis } = useApp();
  const [copying, setCopying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  if (!transformation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
          <FileText className="text-slate-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold italic-serif">No transformation found</h2>
          <p className="text-slate-500 text-sm">Please go back and run the AI optimization first.</p>
        </div>
        <Button onClick={() => navigate('/analysis')} variant="outline">Go Back</Button>
      </div>
    );
  }

  const handleCopy = () => {
    const text = JSON.stringify(transformation.improvedResume, null, 2);
    navigator.clipboard.writeText(text);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const handleDownload = async () => {
    if (!resumeRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(resumeRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Optimized_Resume.pdf');
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Final Outcome</h1>
          <p className="text-slate-500 italic serif">Your career, structurally perfected and ready for scale.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/analysis')} className="rounded-full">
            <ChevronLeft className="w-4 h-4 mr-1" /> Refining Mode
          </Button>
          <Button onClick={handleDownload} disabled={downloading} className="rounded-full bg-emerald-600 hover:bg-emerald-700">
            {downloading ? "Generating..." : <><Download className="w-4 h-4 mr-2" /> Download PDF</>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left: The Resume Preview */}
        <div className="xl:col-span-2 space-y-4">
          <Card className="p-0 overflow-hidden bg-slate-50 border-2 border-slate-200">
            <div className="bg-white p-4 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">A4 Document Preview</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copying ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="p-8 md:p-12 overflow-x-auto bg-slate-200 flex justify-center">
              <div ref={resumeRef} className="shadow-2xl">
                <ResumeTemplate data={transformation.improvedResume} />
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Explanation Engine */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-6 h-6 text-indigo-200" />
              <h2 className="text-xl font-bold italic-serif">Explanation Engine</h2>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-300" />
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">The "Why"</p>
                </div>
                <div className="space-y-4">
                  {transformation.explanation.reasons.map((reason, i) => (
                    <div key={i} className="text-sm bg-indigo-700/50 p-4 rounded-xl border border-indigo-500/30">
                      {reason}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-indigo-500/30">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">ATS Impact</p>
                </div>
                <div className="bg-white/10 p-6 rounded-2xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl font-black">{analysis?.score}</div>
                    <ArrowRight className="text-indigo-300" />
                    <div className="text-4xl font-black text-emerald-400">95+</div>
                  </div>
                  <p className="text-xs text-indigo-100 italic serif leading-relaxed">
                    By aligning your core competencies with the Semantic Matching Engine of modern ATS software, we've increased your interview probability significantly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Card className="p-6">
            <h3 className="font-bold mb-4">Next Steps</h3>
            <ul className="space-y-3">
              {[
                "Save this version for future matching.",
                "Verify specific dates and locations.",
                "Submit with a tailored cover letter."
              ].map((step, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <Check className="w-3 h-3" />
                  </div>
                  {step}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
