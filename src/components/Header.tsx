import React from "react";
import { Stethoscope, Sparkles, Terminal, ShieldAlert, CheckCircle2 } from "lucide-react";
import { ServerStatusResponse } from "../types";

interface HeaderProps {
  status: ServerStatusResponse | null;
  onOpenConfigModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ status, onOpenConfigModal }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 via-slate-800 to-amber-500/20 border border-sky-500/30 shadow-inner">
            <Stethoscope className="w-5 h-5 text-sky-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                CodeDoctor<span className="text-amber-400 font-extrabold">AI</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-sky-950 text-sky-300 border border-sky-800">
                Python Only
              </span>
            </div>
            <p className="text-xs text-slate-400">
              AI-Powered Python Code Error Doctor • <span className="text-slate-300 font-medium">IBM Bob 2.0 Hackathon</span>
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs">
          {/* IBM Bob Service Status */}
          <button
            type="button"
            onClick={onOpenConfigModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors ${
              status?.ibmBobConfigured
                ? "bg-emerald-950/60 border-emerald-800/80 text-emerald-300 hover:bg-emerald-900/60"
                : "bg-amber-950/60 border-amber-800/80 text-amber-300 hover:bg-amber-900/60"
            }`}
            title="Click to view IBM Bob configuration details"
          >
            {status?.ibmBobConfigured ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold">IBM Bob: Ready ({status.model})</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-medium">IBM Bob: Key Needed</span>
              </>
            )}
          </button>

          {/* Python Runtime Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-300">
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            <span>Python 3.10 AST</span>
          </div>

          {/* IBM Bob 2.0 Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-950/40 border border-sky-800/50 text-sky-300">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-medium">IBM Bob 2.0</span>
          </div>
        </div>
      </div>
    </header>
  );
};
