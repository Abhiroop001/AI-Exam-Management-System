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
  HiOutlineArrowUpTray
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
      case 'image': return <HiOutlinePhoto className="w-5 h-5 text-cyan-400" />;
      case 'code': return <HiOutlineCodeBracket className="w-5 h-5 text-purple-400" />;
      case 'excel': return <HiOutlineTableCells className="w-5 h-5 text-emerald-400" />;
      default: return <HiOutlineDocumentText className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5 uppercase tracking-wider">
          <HiOutlinePaperClip className="w-4 h-4 text-purple-400" />
          <span>Attached Materials & Code (Images, PDFs, Excel, .c/.py/.java)</span>
        </label>

        <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-colors">
          <HiOutlineArrowUpTray className="w-3.5 h-3.5" />
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
        <div className="space-y-2.5 mt-2">
          {attachments.map((file, idx) => {
            const fileUrl = `${SERVER_STATIC_URL}${file.url}`;
            const vision = visionData[file.filename];
            const codeEval = codeData[file.filename];

            return (
              <div key={idx} className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 shrink-0">
                      {renderIcon(file.fileType)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate max-w-xs sm:max-w-md">
                        {file.originalName}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono uppercase">
                        {file.fileType} {file.codeLanguage ? `(${file.codeLanguage})` : ''} &bull; {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
                    >
                      View
                    </a>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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
    </div>
  );
};
