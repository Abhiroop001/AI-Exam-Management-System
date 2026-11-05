import React from 'react';
import { VisionAnalysis } from '../types';
import { 
  HiOutlineSparkles, 
  HiOutlineEye,
  HiOutlineBolt
} from 'react-icons/hi2';

interface VisionQualityBadgeProps {
  analysis: VisionAnalysis | null;
  imageUrl: string;
}

export const VisionQualityBadge: React.FC<VisionQualityBadgeProps> = ({ analysis, imageUrl }) => {
  if (!analysis) return null;

  const isCrystal = analysis.clarityAssessment === 'Crystal Clear';
  const isGood = analysis.clarityAssessment === 'Good';

  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm mt-3.5 shadow-sm space-y-2.5 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-xl bg-purple-100 text-purple-700">
            <HiOutlineSparkles className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-slate-900 uppercase tracking-wider text-xs">
            Automated Diagram Quality & OCR Inspection
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {analysis.superResolutionApplied && (
            <span className="px-2.5 py-1 rounded-full font-bold text-xs uppercase bg-purple-50 text-purple-700 border border-purple-200 flex items-center space-x-1">
              <HiOutlineBolt className="w-3.5 h-3.5 text-purple-600" />
              <span>4x Resolution Enhanced</span>
            </span>
          )}

          <span
            className={`px-2.5 py-1 rounded-full font-bold text-xs uppercase border ${
              isCrystal
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isGood
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {analysis.clarityAssessment}
          </span>
          <span className="font-mono font-black text-slate-700 text-xs">
            {analysis.imageQualityScore}/100
          </span>
        </div>
      </div>

      <p className="text-slate-700 italic font-medium text-xs">
        "{analysis.caption}"
      </p>

      {analysis.enhancementSuggestions.length > 0 && (
        <div className="text-xs text-slate-600 flex items-start space-x-2 bg-white p-2.5 rounded-xl border border-slate-200">
          <HiOutlineEye className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <span className="font-medium">{analysis.enhancementSuggestions[0]}</span>
        </div>
      )}
    </div>
  );
};
