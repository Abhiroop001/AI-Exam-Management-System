import React, { useState } from 'react';
import { Attachment, VisionAnalysis, CodeAnalysis } from '../types';
import { api, SERVER_STATIC_URL } from '../services/api';
import { 
  HiOutlinePaperClip, 
  HiOutlinePhoto, 
  HiOutlineDocumentText, 
  HiOutlineCodeBracket, 
  HiOutlineTableCells, 
  HiOutlineTrash,
  HiOutlineArrowUpTray,
  HiOutlineEye,
  HiOutlineXMark,
  HiOutlineClipboard,
  HiOutlineClipboardDocumentCheck
} from 'react-icons/hi2';
import { VisionQualityBadge } from './VisionQualityBadge';
import { CodeAnalysisBadge } from './CodeAnalysisBadge';

interface FileAttachmentPickerProps {
  attachments: Attachment[];
  onChange: (attachments: Attachment[]) => void;
}

export const FileAttachmentPicker: React.FC<FileAttachmentPickerProps> = ({
  attachments,
  onChange,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [visionData, setVisionData] = useState<Record<string, VisionAnalysis>>({});
  const [codeData, setCodeData] = useState<Record<string, CodeAnalysis>>({});
  const [previewFile, setPreviewFile] = useState<{ name: string; content?: string; url: string; isCode: boolean; isImage: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/ai/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success && res.data.file) {
        const newAttachment: Attachment = res.data.file;
        onChange([...attachments, newAttachment]);

        if (res.data.visionAnalysis) {
          setVisionData((prev) => ({
            ...prev,
            [newAttachment.filename]: res.data.visionAnalysis,
          }));
        }

        if (res.data.codeAnalysis) {
          setCodeData((prev) => ({
            ...prev,
            [newAttachment.filename]: res.data.codeAnalysis,
          }));
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload attachment');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeAttachment = (indexToRemove: number) => {
    onChange(attachments.filter((_, idx) => idx !== indexToRemove));
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'image': return <HiOutlinePhoto className="w-5 h-5 text-cyan-600" />;
      case 'code': return <HiOutlineCodeBracket className="w-5 h-5 text-purple-600" />;
      case 'excel': return <HiOutlineTableCells className="w-5 h-5 text-emerald-600" />;
      default: return <HiOutlineDocumentText className="w-5 h-5 text-amber-600" />;
    }
  };

  const openPreview = async (file: Attachment) => {
    const fileUrl = `${SERVER_STATIC_URL}${file.url}`;
    const isImage = file.fileType === 'image';
    const isCode = file.fileType === 'code';

    let content = file.content;
    if (isCode && !content) {
      try {
        const res = await fetch(fileUrl);
        if (res.ok) {
          content = await res.text();
        }
      } catch (_) {}
    }

    setPreviewFile({
      name: file.originalName,
      content,
      url: fileUrl,
      isCode,
      isImage,
    });
  };

  return (
    <div className="mt-4 font-sans">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-bold text-slate-700 flex items-center space-x-2 uppercase tracking-wider">
          <HiOutlinePaperClip className="w-4 h-4 text-purple-600" />
          <span>Attached Materials & Code (Images, PDFs, Excel, .c/.py/.java)</span>
        </label>

        <label className="cursor-pointer inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold transition-colors shadow-2xs">
          <HiOutlineArrowUpTray className="w-4 h-4" />
          <span>{isUploading ? 'Uploading & Analyzing...' : 'Upload File'}</span>
          <input
            type="file"
            className="hidden"
            disabled={isUploading}
            onChange={handleFileUpload}
            accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.xls,.xlsx,.csv,.c,.cpp,.py,.java,.js,.ts,.html,.css,.json,.sql"
          />
        </label>
      </div>

      {/* List of uploaded files */}
      {attachments.length > 0 && (
        <div className="space-y-3 mt-3">
          {attachments.map((file, idx) => {
            const fileUrl = `${SERVER_STATIC_URL}${file.url}`;
            const vision = visionData[file.filename];
            const codeEval = codeData[file.filename];

            return (
              <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shrink-0">
                      {renderIcon(file.fileType)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                        {file.originalName}
                      </p>
                      <span className="text-xs text-slate-500 font-mono">
                        {file.fileType.toUpperCase()} {file.codeLanguage ? `(${file.codeLanguage})` : ''} &bull; {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => openPreview(file)}
                      className="inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors"
                    >
                      <HiOutlineEye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      Open URL
                    </a>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove Attachment"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* If image with vision analysis */}
                {file.fileType === 'image' && vision && (
                  <VisionQualityBadge analysis={vision} imageUrl={fileUrl} />
                )}

                {/* If code file with static complexity evaluation */}
                {file.fileType === 'code' && codeEval && (
                  <CodeAnalysisBadge analysis={codeEval} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                  {previewFile.isCode ? <HiOutlineCodeBracket className="w-5 h-5" /> : previewFile.isImage ? <HiOutlinePhoto className="w-5 h-5" /> : <HiOutlineDocumentText className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">{previewFile.name}</h4>
                  <span className="text-xs text-slate-500 font-medium">Exam Material Resource Preview</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {previewFile.content && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(previewFile.content!);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
                  >
                    {copied ? <HiOutlineClipboardDocumentCheck className="w-3.5 h-3.5 text-emerald-600" /> : <HiOutlineClipboard className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <HiOutlineXMark className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              {previewFile.isImage ? (
                <div className="p-4 flex items-center justify-center bg-slate-50 rounded-2xl">
                  <img src={previewFile.url} alt={previewFile.name} className="max-h-96 object-contain rounded-xl" />
                </div>
              ) : previewFile.content ? (
                <pre className="p-5 rounded-2xl bg-slate-900 text-emerald-300 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto">
                  {previewFile.content}
                </pre>
              ) : (
                <div className="p-8 text-center text-slate-500 font-medium">
                  <p>Document preview available at direct URL:</p>
                  <a href={previewFile.url} target="_blank" rel="noreferrer" className="text-purple-600 underline font-bold mt-2 inline-block">
                    Open {previewFile.name}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
