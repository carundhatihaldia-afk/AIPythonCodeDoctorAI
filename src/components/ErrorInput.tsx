import React from "react";
import { AlertCircle, XCircle } from "lucide-react";

interface ErrorInputProps {
  error: string;
  onChange: (value: string) => void;
  onClear: () => void;
  errorFeedback?: string | null;
}

const COMMON_ERRORS = [
  "SyntaxError: '(' was never closed",
  "IndentationError: unexpected indent",
  "NameError: name 'x' is not defined",
  "TypeError: can only concatenate str (not \"int\") to str",
  "KeyError: 'item'",
  "ZeroDivisionError: division by zero"
];

export const ErrorInput: React.FC<ErrorInputProps> = ({
  error,
  onChange,
  onClear,
  errorFeedback
}) => {
  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg transition-all focus-within:border-amber-500/70 focus-within:ring-1 focus-within:ring-amber-500/30">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-slate-200">Python Error Message / Traceback</span>
          <span className="text-[10px] text-amber-400/90 bg-amber-950/60 border border-amber-900 px-1.5 py-0.2 rounded font-mono">
            Required
          </span>
        </div>
        {error && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 text-slate-400 hover:text-rose-400 text-[11px] transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Input Textarea */}
      <div className="p-3 bg-slate-900/90">
        <textarea
          id="python-error-input"
          value={error}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Paste your Python error message or full traceback here...\nExample: SyntaxError: '(' was never closed`}
          rows={3}
          spellCheck={false}
          className="w-full bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 text-rose-300 font-mono text-xs sm:text-sm placeholder:text-slate-600 outline-none focus:border-amber-500/80 resize-none transition-colors leading-relaxed"
        />

        {/* Validation Warning */}
        {errorFeedback && (
          <div className="mt-1.5 text-xs text-rose-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorFeedback}</span>
          </div>
        )}

        {/* Quick Error Presets */}
        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-500 font-medium mr-1">Presets:</span>
          {COMMON_ERRORS.map((errPreset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(errPreset)}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-amber-300 border border-slate-700/70 transition-colors"
            >
              {errPreset.split(":")[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
