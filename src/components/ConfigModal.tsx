import React from "react";
import { X, Key, ShieldCheck, Server, Sparkles, Terminal, CheckCircle2 } from "lucide-react";
import { ServerStatusResponse } from "../types";

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: ServerStatusResponse | null;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  status
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                IBM Bob 2.0 Integration & Secrets
              </h3>
              <p className="text-xs text-slate-400">
                Full-Stack Architecture & Environment Configuration
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-sm text-slate-300">
          {/* Status block */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Server className="w-5 h-5 text-sky-400" />
              <div>
                <span className="text-xs text-slate-400 block">IBM Bob Runtime Status</span>
                <span className="font-semibold text-white">
                  {status?.ibmBobConfigured ? "Configured & Ready" : "Missing IBM_BOB_API_KEY"}
                </span>
              </div>
            </div>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                status?.ibmBobConfigured
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                  : "bg-amber-950 text-amber-300 border border-amber-800"
              }`}
            >
              {status?.ibmBobConfigured ? "Active" : "Unconfigured"}
            </span>
          </div>

          {/* Integration Specs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Verified IBM Bob Inference Specifications
            </h4>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono space-y-1.5 text-slate-300">
              <div>
                <span className="text-slate-500">API Endpoint:</span>{" "}
                <span className="text-sky-300">{status?.endpoint || "https://api.us-east.bob.ibm.com/inference/v1"}</span>
              </div>
              <div>
                <span className="text-slate-500">Auth Schemes:</span>{" "}
                <span className="text-amber-300">Authorization: Apikey &lt;KEY&gt; (or Bearer for JWT)</span>
              </div>
              <div>
                <span className="text-slate-500">Client Agent:</span>{" "}
                <span className="text-sky-300">pi-bob/0.2.2 (WAF-compliant)</span>
              </div>
              <div>
                <span className="text-slate-500">Default Model:</span>{" "}
                <span className="text-emerald-300">{status?.model || "pro"}</span>
              </div>
              <div>
                <span className="text-slate-500">Server Fallback:</span>{" "}
                <span className="text-slate-200">Local Python 3.10 AST Compiler</span>
              </div>
            </div>
          </div>

          {/* How to configure */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              How to add IBM_BOB_API_KEY
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-800">
              <li>
                Log into your IBM Bob portal at <strong className="text-sky-300">bob.ibm.com</strong> or your hackathon team dashboard.
              </li>
              <li>
                Generate an <strong className="text-amber-300">Inference-scoped API key</strong>.
              </li>
              <li>
                In Google AI Studio Build, open <strong className="text-white">Settings → Secrets</strong> and add:
                <div className="my-1.5 p-2 bg-slate-950 rounded border border-slate-800 text-amber-300 font-mono">
                  IBM_BOB_API_KEY=your_key_here
                </div>
              </li>
              <li>
                Alternatively, when running locally or on GitHub, place it into a private <code className="text-sky-300">.env</code> file (which is ignored by Git).
              </li>
            </ol>
          </div>

          {/* Security Guarantee */}
          <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-900/60 flex items-start gap-2.5 text-xs text-sky-200">
            <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold mb-0.5">Strict API Key Security</strong>
              <span>
                The API key is strictly server-side. It never passes to browser JavaScript, client-side bundles, or git repositories.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
