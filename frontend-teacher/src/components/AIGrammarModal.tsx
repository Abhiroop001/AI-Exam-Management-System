import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineXMark, 
  HiOutlineCheck, 
  HiOutlineSparkles, 
  HiOutlineLightBulb,
  HiOutlineChartBar
} from 'react-icons/hi2';

interface AIGrammarModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  polishedResult: {
    correctedText: string;
    improvements: string[];
    readabilityScore: number;
    suggestions: string[];
  } | null;
  onApply: (refinedText: string) => void;
}

export const AIGrammarModal: React.FC<AIGrammarModalProps> = ({
  isOpen,
  onClose,
  originalText,
  polishedResult,
  onApply,
}) => {
  if (!polishedResult) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="relative w-full max-w-2xl glass-panel p-6 sm:p-9 rounded-3xl border border-slate-200 shadow-2xl bg-white z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
              <div className="flex items-center space-x-3.5">
                <div className="p-3 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200">
                  <HiOutlineSparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 flex items-center space-x-2.5">
                    <span>Question Polish & Clarity Enhancer</span>
                    <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                      Academic Standard Engine
                    </span>
                  </h3>
                  <p className="text-sm text-slate-600 font-medium mt-0.5">
                    Linguistic error correction, clarity enhancement, and pedagogical formatting
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
              >
                <HiOutlineXMark className="w-5 h-5" />
              </button>
            </div>

            {/* Readability & Quality Metric */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
              <div className="flex items-center space-x-2.5 text-base text-slate-800 font-bold">
                <HiOutlineChartBar className="w-5 h-5 text-purple-600" />
                <span>Academic Clarity Index</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-36 h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full"
                    style={{ width: `${polishedResult.readabilityScore}%` }}
                  />
                </div>
                <span className="text-base font-black text-purple-700 font-mono">
                  {polishedResult.readabilityScore}/100
                </span>
              </div>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block mb-2">
                  Original Draft
                </span>
                <p className="text-base text-slate-600 italic line-through decoration-rose-500/60 leading-relaxed font-medium">
                  {originalText}
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/70 border border-purple-200">
                <span className="text-xs font-extrabold text-purple-700 uppercase tracking-wider block mb-2 flex items-center space-x-1.5">
                  <span>Standardized Output</span>
                  <HiOutlineSparkles className="w-4 h-4" />
                </span>
                <p className="text-base text-slate-900 font-bold leading-relaxed">
                  {polishedResult.correctedText}
                </p>
              </div>
            </div>

            {/* Improvements Checklist */}
            <div className="space-y-3 mb-6">
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                Refinements Applied
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {polishedResult.improvements.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium"
                  >
                    <HiOutlineCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {polishedResult.suggestions.length > 0 && (
                <div className="mt-3.5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start space-x-2.5 text-sm text-amber-900">
                  <HiOutlineLightBulb className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <span className="font-bold">Pedagogical Suggestion: </span>
                    <span className="font-medium">{polishedResult.suggestions[0]}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Keep Original
              </button>
              <button
                type="button"
                onClick={() => {
                  onApply(polishedResult.correctedText);
                  onClose();
                }}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold text-white glow-gradient-purple hover:brightness-105 shadow-md shadow-purple-600/25 transition-all"
              >
                <HiOutlineCheck className="w-4 h-4" />
                <span>Apply Refined Text</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
