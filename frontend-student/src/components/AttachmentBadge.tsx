import React, { useState } from 'react';
import { Attachment } from '../types';
import { SERVER_STATIC_URL } from '../services/api';
import { 
  HiOutlinePhoto, 
  HiOutlineDocumentText, 
  HiOutlineTableCells, 
  HiOutlineCodeBracket,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineXMark
} from 'react-icons/hi2';

interface AttachmentBadgeProps {
  attachments: Attachment[];
}

export const AttachmentBadge: React.FC<AttachmentBadgeProps> = ({ attachments }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="space-y-3 my-4">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        Attached Exam Materials
      </div>

      <div className="flex flex-wrap gap-2.5">
        {attachments.map((file, idx) => {
          const fileUrl = `${SERVER_STATIC_URL}${file.url}`;

          if (file.fileType === 'image') {
            return (
              <div key={idx} className="relative group">
                <button
                  type="button"
                  onClick={() => setSelectedImage(fileUrl)}
                  className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-xs font-semibold text-slate-800 transition-all shadow-sm"
                >
                  <HiOutlinePhoto className="w-4 h-4 text-cyan-600" />
                  <span className="truncate max-w-[200px]">{file.originalName}</span>
                </button>
              </div>
            );
          }

          if (file.fileType === 'excel') {
            return (
              <a
                key={idx}
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs font-semibold text-slate-800 transition-all shadow-sm"
              >
                <HiOutlineTableCells className="w-4 h-4 text-emerald-600" />
                <span className="truncate max-w-[200px]">{file.originalName}</span>
                <HiOutlineArrowTopRightOnSquare className="w-3.5 h-3.5 text-slate-400" />
              </a>
            );
          }

          if (file.fileType === 'code') {
            return (
              <a
                key={idx}
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-xs font-semibold text-slate-800 transition-all shadow-sm"
              >
                <HiOutlineCodeBracket className="w-4 h-4 text-purple-600" />
                <span className="truncate max-w-[200px]">{file.originalName}</span>
                <HiOutlineArrowTopRightOnSquare className="w-3.5 h-3.5 text-slate-400" />
              </a>
            );
          }

          return (
            <a
              key={idx}
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-xs font-semibold text-slate-800 transition-all shadow-sm"
            >
              <HiOutlineDocumentText className="w-4 h-4 text-amber-600" />
              <span className="truncate max-w-[200px]">{file.originalName}</span>
              <HiOutlineArrowTopRightOnSquare className="w-3.5 h-3.5 text-slate-400" />
            </a>
          );
        })}
      </div>

      {/* Inline Image Previews */}
      {attachments.filter((a) => a.fileType === 'image').map((imgFile, idx) => (
        <div key={idx} className="my-3 rounded-2xl overflow-hidden border border-slate-200 max-w-lg bg-slate-50 shadow-sm">
          <img
            src={`${SERVER_STATIC_URL}${imgFile.url}`}
            alt={imgFile.originalName}
            className="w-full max-h-80 object-contain cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => setSelectedImage(`${SERVER_STATIC_URL}${imgFile.url}`)}
          />
        </div>
      ))}

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white text-slate-700 hover:bg-slate-100 shadow-lg transition-colors"
          >
            <HiOutlineXMark className="w-6 h-6" />
          </button>
          <img
            src={selectedImage}
            alt="Expanded Diagram"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-white"
          />
        </div>
      )}
    </div>
  );
};
