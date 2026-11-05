import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#f8fafc]">
      {/* Subtle architectural dot grid */}
      <div 
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Floating Animated Ambient Glow Orb 1 (Indigo / Purple) */}
      <motion.div
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -50, 30, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full blur-[100px]"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.08) 50%, transparent 70%)',
        }}
      />

      {/* Floating Animated Ambient Glow Orb 2 (Cyan / Sky) */}
      <motion.div
        animate={{
          x: [0, -50, 40, 0],
          y: [0, 60, -40, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        className="absolute top-1/4 -right-32 w-[600px] h-[600px] rounded-full blur-[110px]"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.10) 0%, rgba(59, 130, 246, 0.08) 50%, transparent 70%)',
        }}
      />

      {/* Floating Animated Ambient Glow Orb 3 (Emerald / Teal) */}
      <motion.div
        animate={{
          x: [0, 30, -40, 0],
          y: [0, -30, 40, 0],
          scale: [0.95, 1.1, 1, 0.95],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 4,
        }}
        className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] rounded-full blur-[100px]"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.06) 50%, transparent 70%)',
        }}
      />
    </div>
  );
};

