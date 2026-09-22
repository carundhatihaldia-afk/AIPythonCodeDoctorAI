import React, { useState } from "react";
import {
  Check,
  Copy,
  Sparkles,
  Stethoscope,
  Lightbulb,
  Search,
  CheckCircle2,
  Wrench,
  MessageSquareCode,
  Terminal
} from "lucide-react";
import { AnalysisData } from "../types";

interface AnalysisResultProps {
  data: AnalysisData;
  model?: string;
  isIbmBob: boolean;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({
  data,
  model = "IBM Bob pro",
  isIbmBob
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    if (!data.correctedCode) return;
    try {
      await navigator.clipboard.writeText(data.correctedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const codeLines = data.correctedCode.split("\n");

  return (
    <div className="space-y-6">
      {/* Top Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-sky-950/50 border border-emerald-500/30 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">
                {isIbmBob ? "IBM Bob AI Analysis" : "AI Analysis"}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-900/60 text-emerald-300 border border-emerald-700/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Verified Runtime
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Inference engine: <span className="text-sky-300 font-mono">{model}</span>
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400">Diagnosis Status</span>
          <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Ready to Apply
          </p>
        </div>
      </div>

      {/* Grid of Diagnosis & Beginner Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 🩺 Diagnosis */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sky-400 mb-2.5">
              <div className="p-1.5 rounded-lg bg-sky-950/80 border border-sky-800/80">
                <Stethoscope className="w-4 h-4 text-sky-400" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                🩺 Diagnosis
              </h2>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {data.diagnosis}
            </p>
          </div>
        </div>

        {/* 💡 Beginner-Friendly Explanation */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 mb-2.5">
              <div className="p-1.5 rounded-lg bg-amber-950/80 border border-amber-800/80">
                <Lightbulb className="w-4 h-4 text-amber-400" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                💡 Beginner-Friendly Explanation
              </h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {data.explanation}
            </p>
          </div>
        </div>
      </div>

      {/* 🔍 Likely Root Cause */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div className="flex items-center gap-2 text-purple-400 mb-2.5">
          <div className="p-1.5 rounded-lg bg-purple-950/80 border border-purple-800/80">
            <Search className="w-4 h-4 text-purple-400" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            🔍 Likely Root Cause
          </h2>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          {data.rootCause}
        </p>
      </div>

      {/* ✅ Corrected Python Code */}
      <div className="rounded-xl bg-slate-950 border border-emerald-500/30 overflow-hidden shadow-xl">
        {/* Code Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/95 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-emerald-950 border border-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                ✅ Corrected Python Code
              </h2>
              <span className="text-[11px] text-slate-400">Complete, working program</span>
            </div>
          </div>

          {/* Copy Code button */}
          <button
            type="button"
            onClick={handleCopyCode}
            disabled={!data.correctedCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow transition-all active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied Code!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Display Area */}
        <div className="relative flex max-h-[380px] overflow-auto bg-slate-950 font-mono text-[13px] sm:text-[14px]">
          {/* Line Numbers */}
          <div
            aria-hidden="true"
            className="select-none py-3 px-3 text-right bg-slate-950/80 border-r border-slate-800/80 text-slate-600 font-mono text-xs min-w-[2.75rem]"
          >
            {codeLines.map((_, i) => (
              <div key={i + 1} className="leading-6">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Code text */}
          <pre className="p-3 text-emerald-300 font-mono leading-6 overflow-x-auto selection:bg-emerald-500/30 w-full">
            <code>{data.correctedCode || "# No code required"}</code>
          </pre>
        </div>
      </div>

      {/* 🛠 What Was Changed */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div className="flex items-center gap-2 text-cyan-400 mb-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800/80">
            <Wrench className="w-4 h-4 text-cyan-400" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            🛠 What Was Changed
          </h2>
        </div>
        <div className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
          {data.whatWasChanged}
        </div>
      </div>

      {/* 💬 Debugging Tips */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div className="flex items-center gap-2 text-indigo-400 mb-3">
          <div className="p-1.5 rounded-lg bg-indigo-950/80 border border-indigo-800/80">
            <MessageSquareCode className="w-4 h-4 text-indigo-400" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            💬 Debugging Tips
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.debuggingTips.map((tip, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300"
            >
              <div className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-700/60 flex items-center justify-center shrink-0 mt-0.5 text-indigo-300 font-mono text-[10px] font-bold">
                {idx + 1}
              </div>
              <p className="leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
