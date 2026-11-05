import React from 'react';
import { 
  HiOutlineClock, 
  HiOutlineSparkles, 
  HiOutlineQueueList,
  HiOutlineArrowUpRight
} from 'react-icons/hi2';
import { motion } from 'framer-motion';

interface ExamTopbarProps {
  title: string;
  subject: string;
  timeRemainingSeconds: number;
  totalQuestions: number;
  currentIndex: number;
  answeredCount: number;
  onToggleNavigator: () => void;
  onSubmit: () => void;
}

export const ExamTopbar: React.FC<ExamTopbarProps> = ({
  title,
  subject,
  timeRemainingSeconds,
  totalQuestions,
  currentIndex,
  answeredCount,
  onToggleNavigator,
  onSubmit,
}) => {
  const minutes = Math.floor(timeRemainingSeconds / 60);
  const seconds = timeRemainingSeconds % 60;
  const isUrgent = timeRemainingSeconds < 300; // < 5 mins
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-200/90 px-4 sm:px-8 lg:px-12 py-3.5 backdrop-blur-xl bg-white/95 relative shadow-sm">
      <div className="w-full max-w-[1700px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Test Details */}
        <div className="min-w-0 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl glow-gradient-student flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <HiOutlineSparkles className="w-5 h-5 text-white" />
          </div>
          <div className="truncate">
            <div className="flex items-center space-x-2.5">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 truncate max-w-xs sm:max-w-md lg:max-w-xl">
                {title}
              </h2>
              <span className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-200 uppercase tracking-wider shrink-0 hidden sm:inline-block">
                {subject}
              </span>
            </div>
            <p className="text-sm text-slate-600 font-medium">
              Question {currentIndex + 1} of {totalQuestions} &bull; <span className="text-indigo-600 font-bold">{answeredCount} Answered</span>
            </p>
          </div>
        </div>

        {/* Center/Right: Timer & Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Animated Countdown Timer */}
          <motion.div
            animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl border font-mono font-bold text-sm sm:text-base ${
              isUrgent
                ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-md shadow-rose-500/10'
                : 'bg-indigo-50/80 text-indigo-900 border-indigo-200 shadow-sm'
            }`}
          >
            <HiOutlineClock className={`w-4 h-4 ${isUrgent ? 'text-rose-600' : 'text-indigo-600'}`} />
            <span>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </motion.div>

          {/* Navigator Drawer Toggle */}
          <button
            type="button"
            onClick={onToggleNavigator}
            className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            title="Question Grid View"
          >
            <HiOutlineQueueList className="w-4 h-4 text-indigo-600" />
            <span className="hidden md:inline">Question Grid</span>
          </button>

          {/* Submit Exam Button */}
          <button
            type="button"
            onClick={onSubmit}
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white glow-gradient-student hover:brightness-105 shadow-md shadow-indigo-600/20 transition-all shrink-0"
          >
            <span>Finish Test</span>
            <HiOutlineArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500"
          initial={{ width: '0%' }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </header>
  );
};
