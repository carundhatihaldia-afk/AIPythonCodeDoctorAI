import React from "react";
import { Terminal, AlertTriangle, CheckCircle2, ShieldAlert, Key } from "lucide-react";
import { SyntaxCheckResult } from "../types";

interface FallbackResultViewProps {
  fallbackResult?: SyntaxCheckResult;
  message?: string;
  details?: string;
  error?: string;
  notConfigured?: boolean;
  onOpenConfigModal: () => void;
}

export const FallbackResultView: React.FC<FallbackResultViewProps> = ({
  fallbackResult,
  message,
  details,
  error,
  notConfigured,
  onOpenConfigModal
}) => {
  const hasSyntaxError = fallbackResult?.hasSyntaxError ?? false;

  return (
    <div className="space-y-5">
      {/* Fallback Banner Label */}
      <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/40 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Terminal className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-amber-300 tracking-wide">
                  Python Syntax Checker Fallback
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-700/60">
                  Local AST Compiler
                </span>
              </div>
              <p className="text-xs text-amber-200/80 mt-0.5">
                {message || "IBM Bob is not configured. Please add the IBM_BOB_API_KEY server secret."}
              </p>
            </div>
          </div>

          {notConfigured && (
            <button
              type="button"
              onClick={onOpenConfigModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors shrink-0 cursor-pointer shadow"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Configure IBM Bob API</span>
            </button>
          )}
        </div>
      </div>

      {/* Syntax Checker Diagnostic Card */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            {hasSyntaxError ? (
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            )}
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              Python 3.10 AST Compiler Verification
            </h3>
          </div>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              hasSyntaxError
                ? "bg-rose-950 text-rose-300 border border-rose-800"
                : "bg-emerald-950 text-emerald-300 border border-emerald-800"
            }`}
          >
            {hasSyntaxError ? "Syntax Error Found" : "Syntax Passed"}
          </span>
        </div>

        {hasSyntaxError ? (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-900/60">
              <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider block mb-1">
                Detected Syntax Error
              </span>
              <p className="text-sm font-mono text-rose-200 font-medium">
                {fallbackResult?.message || "SyntaxError in Python source"}
              </p>
              {fallbackResult?.line && (
                <div className="text-xs text-rose-300/80 mt-1 font-mono">
                  Line {fallbackResult.line}
                  {fallbackResult.offset ? `, Column ${fallbackResult.offset}` : ""}
                </div>
              )}
            </div>

            {fallbackResult?.formatted && (
              <div>
                <span className="text-xs text-slate-400 font-medium block mb-1.5">
                  Python Traceback & Offset Pointer:
                </span>
                <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-rose-300 font-mono text-xs overflow-x-auto leading-relaxed">
                  <code>{fallbackResult.formatted}</code>
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-900/50 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-200">
                No Python syntax error detected.
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                The Python AST parser compiled the provided code without syntax errors. If an error still occurs at runtime, it may be a logic, type, or runtime exception requiring IBM Bob AI diagnosis.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Notice on IBM Bob / Diagnostics */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-1 w-full">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-medium block">
              Diagnostic Status & Fallback Mode
            </span>
            {details && !notConfigured && (
              <button
                type="button"
                onClick={onOpenConfigModal}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-medium underline flex items-center gap-1 cursor-pointer"
              >
                <Key className="w-3 h-3" />
                Check Key & Endpoints
              </button>
            )}
          </div>
          {details ? (
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-amber-200/90 font-mono text-[11px] leading-relaxed">
              {details}
            </div>
          ) : (
            <p className="leading-relaxed">
              The application verified your Python code using the server's real Python 3 parser. To receive full AI-powered diagnosis, explanations, code corrections, and debugging tips, configure your official <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded font-mono">IBM_BOB_API_KEY</code>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
