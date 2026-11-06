import React, { useState } from 'react';
import { Attachment } from '../types';
import { SERVER_STATIC_URL } from '../services/api';
import { 
  HiOutlinePhoto, 
  HiOutlineDocumentText, 
  HiOutlineTableCells, 
  HiOutlineCodeBracket,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineXMark,
  HiOutlineClipboard,
  HiOutlineClipboardDocumentCheck,
  HiOutlineChevronDown,
  HiOutlineChevronUp
} from 'react-icons/hi2';

interface AttachmentBadgeProps {
  attachments: Attachment[];
}

export const AttachmentBadge: React.FC<AttachmentBadgeProps> = ({ attachments }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [expandedCode, setExpandedCode] = useState<Record<string, boolean>>({});
  const [codeContents, setCodeContents] = useState<Record<string, string>>({});
  const [loadingCode, setLoadingCode] = useState<Record<string, boolean>>({});
  const [copiedFilename, setCopiedFilename] = useState<string | null>(null);

  if (!attachments || attachments.length === 0) return null;

  const toggleCodeSnippet = async (file: Attachment) => {
    const isCurrentlyExpanded = !!expandedCode[file.filename];
    if (isCurrentlyExpanded) {
      setExpandedCode((prev) => ({ ...prev, [file.filename]: false }));
      return;
    }

    setExpandedCode((prev) => ({ ...prev, [file.filename]: true }));

    // If content already cached or exists on file object, no need to fetch
    if (codeContents[file.filename] || file.content) {
      if (file.content && !codeContents[file.filename]) {
        setCodeContents((prev) => ({ ...prev, [file.filename]: file.content! }));
      }
      return;
    }

    // Fetch code content via API or direct static endpoint
    setLoadingCode((prev) => ({ ...prev, [file.filename]: true }));
    try {
      const fileUrl = `${SERVER_STATIC_URL}${file.url}`;
      const res = await fetch(fileUrl);
      if (res.ok) {
        const text = await res.text();
        setCodeContents((prev) => ({ ...prev, [file.filename]: text }));
      } else {
        setCodeContents((prev) => ({ ...prev, [file.filename]: '// Failed to load code content.' }));
      }
    } catch (err) {
      setCodeContents((prev) => ({ ...prev, [file.filename]: '// Error loading code snippet.' }));
    } finally {
      setLoadingCode((prev) => ({ ...prev, [file.filename]: false }));
    }
  };

  const handleCopyCode = (filename: string, codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedFilename(filename);
    setTimeout(() => setCopiedFilename(null), 2500);
  };

  return (
    <div className="space-y-4 my-5 select-text">
      <div className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-indigo-600" />
        <span>Attached Exam Materials & Source Code</span>
      </div>

      <div className="flex flex-wrap gap-3">
        {attachments.map((file, idx) => {
          const fileUrl = `${SERVER_STATIC_URL}${file.url}`;
          const isCode = file.fileType === 'code';
          const isExpanded = !!expandedCode[file.filename];

          if (file.fileType === 'image') {
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(fileUrl)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 text-xs font-bold text-slate-800 transition-all shadow-sm group"
              >
                <HiOutlinePhoto className="w-4 h-4 text-cyan-600 group-hover:scale-110 transition-transform" />
                <span className="truncate max-w-[220px]">{file.originalName}</span>
                <span className="text-[10px] uppercase font-bold text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded-md">View Diagram</span>
              </button>
            );
          }

          if (isCode) {
            return (
              <div key={idx} className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => toggleCodeSnippet(file)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-sm group ${
                    isExpanded
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20'
                      : 'bg-white hover:bg-purple-50 text-slate-800 border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <HiOutlineCodeBracket className={`w-4 h-4 ${isExpanded ? 'text-white' : 'text-purple-600'} group-hover:scale-110 transition-transform`} />
                  <span className="truncate max-w-[220px]">{file.originalName}</span>
                  <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-md ${
                    isExpanded ? 'bg-purple-700 text-white' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {file.codeLanguage || 'code'}
                  </span>
                  {isExpanded ? <HiOutlineChevronUp className="w-3.5 h-3.5 ml-1" /> : <HiOutlineChevronDown className="w-3.5 h-3.5 ml-1" />}
                </button>

                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open source code in new window"
                  className="p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors shadow-sm"
                >
                  <HiOutlineArrowTopRightOnSquare className="w-4 h-4" />
                </a>
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
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs font-bold text-slate-800 transition-all shadow-sm group"
              >
                <HiOutlineTableCells className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="truncate max-w-[220px]">{file.originalName}</span>
                <HiOutlineArrowTopRightOnSquare className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
              </a>
            );
          }

          return (
            <a
              key={idx}
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-xs font-bold text-slate-800 transition-all shadow-sm group"
            >
              <HiOutlineDocumentText className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
              <span className="truncate max-w-[220px]">{file.originalName}</span>
              <HiOutlineArrowTopRightOnSquare className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
            </a>
          );
        })}
      </div>

      {/* Expanded Inline Code Viewers */}
      {attachments.filter((a) => a.fileType === 'code').map((file, idx) => {
        if (!expandedCode[file.filename]) return null;
        const codeText = codeContents[file.filename] || file.content || '';
        const isLoading = loadingCode[file.filename];
        const isCopied = copiedFilename === file.filename;

        return (
          <div key={`expanded-${idx}`} className="rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 overflow-hidden shadow-xl animate-fadeIn my-4">
            {/* Code Toolbar */}
            <div className="px-5 py-3 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="flex space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                </span>
                <span className="text-xs font-mono font-bold text-slate-300">
                  {file.originalName} ({file.codeLanguage || 'c'})
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleCopyCode(file.filename, codeText)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
                >
                  {isCopied ? (
                    <>
                      <HiOutlineClipboardDocumentCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <HiOutlineClipboard className="w-4 h-4 text-slate-300" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setExpandedCode((prev) => ({ ...prev, [file.filename]: false }))}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/80 transition-colors"
                  title="Close Code View"
                >
                  <HiOutlineXMark className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Code Content */}
            <div className="p-5 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto max-h-96">
              {isLoading ? (
                <div className="flex items-center space-x-3 text-slate-400 py-6">
                  <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <span>Loading source code...</span>
                </div>
              ) : (
                <pre className="text-emerald-300 font-mono whitespace-pre select-text">
                  {codeText || '// Empty file or no content available.'}
                </pre>
              )}
            </div>
          </div>
        );
      })}

      {/* Inline Image Previews */}
      {attachments.filter((a) => a.fileType === 'image').map((imgFile, idx) => (
        <div key={idx} className="my-3 rounded-2xl overflow-hidden border border-slate-200 max-w-xl bg-white shadow-sm p-2">
          <img
            src={`${SERVER_STATIC_URL}${imgFile.url}`}
            alt={imgFile.originalName}
            className="w-full max-h-80 object-contain rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => setSelectedImage(`${SERVER_STATIC_URL}${imgFile.url}`)}
          />
        </div>
      ))}

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white text-slate-800 hover:bg-slate-100 shadow-xl transition-colors"
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
