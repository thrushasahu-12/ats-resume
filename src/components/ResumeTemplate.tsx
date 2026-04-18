import React from 'react';
import { ResumeData } from '../types/resume';

export function ResumeTemplate({ data, className }: { data: ResumeData, className?: string }) {
  if (!data) return null;

  return (
    <div className={`p-8 bg-white border border-slate-200 shadow-sm font-sans text-slate-800 ${className}`} style={{ minHeight: '842px', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div className="text-center mb-6 space-y-1">
        <h1 className="text-2xl font-bold uppercase tracking-wide text-indigo-900">{data.contact?.name || "Your Name"}</h1>
        <div className="text-sm text-slate-600 flex justify-center gap-3 flex-wrap">
          <span>{data.contact?.email}</span>
          <span>•</span>
          <span>{data.contact?.phone}</span>
          <span>•</span>
          <span>{data.contact?.location}</span>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-700 border-b border-indigo-100 mb-2 pb-1">Professional Summary</h2>
        <p className="text-sm leading-relaxed text-slate-700">{data.summary}</p>
      </div>

      {/* Experience */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-700 border-b border-indigo-100 mb-2 pb-1">Experience</h2>
        <div className="space-y-4">
          {data.experience.map((exp, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-bold text-slate-900">{exp.company}</h3>
                <span className="text-xs font-semibold text-slate-500">{exp.period}</span>
              </div>
              <p className="text-xs font-bold text-indigo-600">{exp.position}</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                {exp.highlights.map((h, j) => (
                  <li key={j} className="text-xs text-slate-700 leading-normal pl-2 -indent-5">
                    <span className="relative left-3">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-700 border-b border-indigo-100 mb-2 pb-1">Technical Skills</h2>
        <div className="flex flex-wrap gap-2 pt-1">
          {data.skills.map((skill, i) => (
            <span key={i} className="text-xs bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-600">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Education */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-700 border-b border-indigo-100 mb-2 pb-1">Education</h2>
        <div className="space-y-3">
          {data.education.map((edu, i) => (
            <div key={i} className="flex justify-between items-start">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-900">{edu.school}</h3>
                <p className="text-xs text-indigo-600">{edu.degree}</p>
              </div>
              <span className="text-xs font-semibold text-slate-500">{edu.period}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
