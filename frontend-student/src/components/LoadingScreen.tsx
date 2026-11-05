import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineSparkles } from 'react-icons/hi2';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Initializing Secure Test Environment...',
}) => {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute w-[500px] h-[500px] bg-indigo-100/60 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Animated Concentric Rings */}
        <div className="relative w-28 h-28 flex items-center justify-center mb-6">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-indigo-200 border-t-indigo-600"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-cyan-200 border-b-cyan-500"
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="w-14 h-14 rounded-2xl glow-gradient-student flex items-center justify-center shadow-lg shadow-indigo-500/30"
            animate={{ scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <HiOutlineSparkles className="w-7 h-7 text-white" />
          </motion.div>
        </div>

        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-extrabold text-slate-900 tracking-tight mb-2"
        >
          {message}
        </motion.h3>

        <p className="text-sm text-slate-500 max-w-xs leading-relaxed font-medium">
          Retrieving questions, encrypting exam sessions, and prepping AI validation engines.
        </p>

        {/* Pulsing Dots */}
        <div className="flex items-center space-x-2 mt-6">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse delay-150" />
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse delay-300" />
        </div>
      </div>
    </div>
  );
};
