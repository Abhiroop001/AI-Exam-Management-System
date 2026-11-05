import React from 'react';
import { CodeAnalysis } from '../types';
import { 
  HiOutlineCodeBracket
} from 'react-icons/hi2';

interface CodeAnalysisBadgeProps {
  analysis: CodeAnalysis | null;
}

export const CodeAnalysisBadge: React.FC<CodeAnalysisBadgeProps> = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm mt-3.5 shadow-sm space-y-3 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-xl bg-indigo-100 text-indigo-700">
            <HiOutlineCodeBracket className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-slate-900 uppercase tracking-wider text-xs">
            Algorithm Complexity & Syntax Evaluation
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs font-bold text-indigo-700 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200">
            Time: {analysis.timeComplexity}
          </span>
          <span className="font-mono text-xs font-bold text-purple-700 px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200">
            Space: {analysis.spaceComplexity}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        {analysis.strengths.length > 0 && (
          <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-700">
            <span className="font-bold text-emerald-700 block mb-1">Key Strengths:</span>
            <span className="font-medium">{analysis.strengths[0]}</span>
          </div>
        )}

        {analysis.vulnerabilities.length > 0 && (
          <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-700">
            <span className="font-bold text-amber-700 block mb-1">Edge Case Note:</span>
            <span className="font-medium">{analysis.vulnerabilities[0]}</span>
          </div>
        )}
      </div>
    </div>
  );
};
