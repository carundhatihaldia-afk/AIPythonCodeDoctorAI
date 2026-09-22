import React, { useRef, useMemo } from "react";
import { Code2, Trash2, Copy, Check, Sparkles } from "lucide-react";
import { SAMPLE_CASES } from "../data/samples";
import { SampleCase } from "../types";

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  onSelectSample: (sample: SampleCase) => void;
  errorHighlightLine?: number | null;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  onSelectSample,
  errorHighlightLine
}) => {
  const [copied, setCopied] = React.useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lines = useMemo(() => {
    return code.split("\n");
  }, [code]);

  const lineCount = lines.length;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle tab key for standard Python 4-space indentation
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const newCode = code.substring(0, start) + "    " + code.substring(end);
      onChange(newCode);

      // Restore cursor position after state update
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg transition-all focus-within:border-sky-500/70 focus-within:ring-1 focus-within:ring-sky-500/30">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-slate-950 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <span className="text-slate-400 font-mono text-[11px] ml-1.5 flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-sky-400" />
            main.py
          </span>
        </div>

        {/* Quick Samples Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="text-[11px] text-slate-400 font-medium">Load Example:</span>
            <select
              aria-label="Load Python Example"
              onChange={(e) => {
                const idx = parseInt(e.target.value, 10);
                if (!isNaN(idx) && SAMPLE_CASES[idx]) {
                  onSelectSample(SAMPLE_CASES[idx]);
                }
              }}
              defaultValue=""
              className="bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs rounded-md border border-slate-700 px-2 py-1 outline-none focus:border-sky-500 cursor-pointer transition-colors"
            >
              <option value="" disabled>Select bug scenario...</option>
              {SAMPLE_CASES.map((sample, idx) => (
                <option key={idx} value={idx}>
                  {sample.errorLabel}: {sample.title}
                </option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>

          {/* Action buttons */}
          <button
            type="button"
            onClick={handleCopy}
            disabled={!code}
            className="flex items-center gap-1 px-2 py-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 disabled:opacity-40 transition-colors"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onChange("")}
            disabled={!code}
            className="flex items-center gap-1 px-2 py-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 disabled:opacity-40 transition-colors"
            title="Clear editor"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="text-[11px]">Clear</span>
          </button>
        </div>
      </div>

      {/* Editor Body with Line Numbers */}
      <div className="relative flex min-h-[260px] sm:min-h-[300px] max-h-[460px] overflow-hidden bg-slate-900/95 font-mono text-[13px] sm:text-[14px]">
        {/* Line Numbers Gutter */}
        <div
          aria-hidden="true"
          className="select-none py-3 px-2 sm:px-3 text-right bg-slate-950/70 border-r border-slate-800/80 text-slate-600 font-mono text-xs overflow-hidden min-w-[2.5rem] sm:min-w-[3rem]"
        >
          {Array.from({ length: Math.max(1, lineCount) }).map((_, i) => {
            const lineNum = i + 1;
            const isErrorLine = errorHighlightLine === lineNum;
            return (
              <div
                key={lineNum}
                className={`leading-6 ${
                  isErrorLine ? "text-amber-400 font-bold bg-amber-500/10 -mx-3 px-3" : ""
                }`}
              >
                {lineNum}
              </div>
            );
          })}
        </div>

        {/* Text Area */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            id="python-code-input"
            value={code}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`# Paste your Python code here...\n# Example:\nprint("Hello"`}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className="w-full h-full p-3 bg-transparent text-slate-200 placeholder:text-slate-600 outline-none resize-none leading-6 font-mono selection:bg-sky-500/30 overflow-y-auto"
          />
        </div>
      </div>

      {/* Editor Footer Status */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-3">
          <span>Python 3.x</span>
          <span>•</span>
          <span>Tab: 4 spaces</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{lineCount} {lineCount === 1 ? "line" : "lines"}</span>
          <span>•</span>
          <span>{code.length} chars</span>
        </div>
      </div>
    </div>
  );
};
