import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineXMark, 
  HiOutlineClipboardDocumentCheck, 
  HiOutlineClipboard, 
  HiOutlineQrCode,
  HiOutlineClock,
  HiOutlineArrowDownTray,
  HiOutlineSparkles
} from 'react-icons/hi2';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  examTitle: string;
  examCode: string;
  qrCodeDataUrl: string;
  expiresAt: string;
}

export const QRModal: React.FC<QRModalProps> = ({
  isOpen,
  onClose,
  examTitle,
  examCode,
  qrCodeDataUrl,
  expiresAt,
}) => {
  const [copied, setCopied] = useState(false);
  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const studentJoinUrl = isLocal
    ? `http://localhost:5174/exam/${examCode}`
    : `https://frontend-student-nu.vercel.app/exam/${examCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(studentJoinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const formattedDate = new Date(expiresAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xl bg-white text-center overflow-hidden z-10"
          >
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 glow-gradient-purple" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <HiOutlineXMark className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold mb-3">
              <HiOutlineSparkles className="w-3.5 h-3.5" />
              <span>Exam Ready & Active</span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-1 truncate px-4">{examTitle}</h3>
            <p className="text-xs text-slate-500 mb-6 font-medium">
              Students can scan this QR code or input the 6-character code to join the test instantly.
            </p>

            {/* QR Code Container with sleek white card for maximum optical readability */}
            <div className="relative inline-block p-4 bg-white border border-slate-200 rounded-2xl shadow-md mb-5 mx-auto group">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="Exam QR Code"
                  className="w-56 h-56 object-contain rounded-lg"
                />
              ) : (
                <div className="w-56 h-56 flex flex-col items-center justify-center bg-slate-100 rounded-lg text-slate-400">
                  <HiOutlineQrCode className="w-12 h-12 mb-2" />
                  <span className="text-xs font-medium">Generating QR...</span>
                </div>
              )}
            </div>

            {/* Exam Join Code Banner */}
            <div className="mb-4">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-bold block mb-1">
                Student Test Code
              </span>
              <div className="inline-block px-6 py-2 rounded-xl bg-purple-50 border border-purple-200 text-2xl font-black tracking-widest text-purple-700 font-mono shadow-sm">
                {examCode}
              </div>
            </div>

            {/* Expiration Banner */}
            <div className="flex items-center justify-center space-x-2 text-xs text-amber-800 font-medium bg-amber-50 py-2 px-3 rounded-xl border border-amber-200 mb-5">
              <HiOutlineClock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Expires on: {formattedDate}</span>
            </div>

            {/* Actions: Copy Link & Download */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-sm text-white glow-gradient-purple hover:brightness-105 shadow-md shadow-purple-600/25 transition-all"
              >
                {copied ? (
                  <>
                    <HiOutlineClipboardDocumentCheck className="w-4 h-4 text-emerald-200" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <HiOutlineClipboard className="w-4 h-4" />
                    <span>Copy Student Link</span>
                  </>
                )}
              </button>

              {qrCodeDataUrl && (
                <a
                  href={qrCodeDataUrl}
                  download={`exam-${examCode}-qr.png`}
                  className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors shadow-sm"
                  title="Download QR Image"
                >
                  <HiOutlineArrowDownTray className="w-5 h-5" />
                </a>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
