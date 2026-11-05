import React, { useState } from 'react';
import { HiOutlineClipboard, HiOutlineClipboardDocumentCheck, HiOutlineCodeBracket } from 'react-icons/hi2';

interface CodeSnippetViewerProps {
  code: string;
  language?: string;
  filename?: string;
}

export const CodeSnippetViewer: React.FC<CodeSnippetViewerProps> = ({
  code,
  language = 'plaintext',
  filename,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.trim().split('\n');

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1117] overflow-hidden my-4 shadow-xl">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-b border-white/5">
        <div className="flex items-center space-x-2">
          <HiOutlineCodeBracket className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-mono font-bold text-slate-300">
            {filename || `Snippet (${language.toUpperCase()})`}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          {copied ? (
            <>
              <HiOutlineClipboardDocumentCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied</span>
            </>
          ) : (
            <>
              <HiOutlineClipboard className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content with Line Numbers */}
      <div className="p-4 overflow-x-auto text-xs font-mono leading-relaxed">
        <table className="border-collapse w-full">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-white/[0.02]">
                <td className="text-slate-600 select-none pr-4 text-right align-top w-8">
                  {idx + 1}
                </td>
                <td className="text-slate-200 whitespace-pre font-mono">
                  {line || ' '}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

