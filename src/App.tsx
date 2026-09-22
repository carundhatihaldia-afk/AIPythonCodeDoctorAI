import React, { useState, useEffect, useRef } from "react";
import { Header } from "./components/Header";
import { CodeEditor } from "./components/CodeEditor";
import { ErrorInput } from "./components/ErrorInput";
import { AnalysisResult } from "./components/AnalysisResult";
import { FallbackResultView } from "./components/FallbackResultView";
import { ConfigModal } from "./components/ConfigModal";
import { SAMPLE_CASES } from "./data/samples";
import {
  AnalyzeApiResponse,
  SampleCase,
  ServerStatusResponse,
  SyntaxCheckResult
} from "./types";
import {
  Stethoscope,
  Terminal,
  Play,
  RotateCcw,
  Sparkles,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export default function App() {
  // Pre-fill with the test example required by user:
  // print("Hello"
  // SyntaxError: '(' was never closed
  const [pythonCode, setPythonCode] = useState<string>(`print("Hello"`);
  const [errorMessage, setErrorMessage] = useState<string>(`SyntaxError: '(' was never closed`);
  
  // Validation errors
  const [codeValidationError, setCodeValidationError] = useState<string | null>(null);
  const [errorValidationError, setErrorValidationError] = useState<string | null>(null);

  // Results & Loading
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [analysisResponse, setAnalysisResponse] = useState<AnalyzeApiResponse | null>(null);
  const [serverStatus, setServerStatus] = useState<ServerStatusResponse | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState<boolean>(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Fetch initial server status
  useEffect(() => {
    fetchServerStatus();
  }, []);

  const fetchServerStatus = async () => {
    try {
      const res = await fetch("/api/status");
      if (res.ok) {
        const data = await res.json();
        setServerStatus(data);
      }
    } catch (e) {
      console.error("Failed to fetch server status:", e);
    }
  };

  const handleSelectSample = (sample: SampleCase) => {
    setPythonCode(sample.code);
    setErrorMessage(sample.error);
    setCodeValidationError(null);
    setErrorValidationError(null);
    setAnalysisResponse(null);
  };

  const handleReset = () => {
    setPythonCode(`print("Hello"`);
    setErrorMessage(`SyntaxError: '(' was never closed`);
    setCodeValidationError(null);
    setErrorValidationError(null);
    setAnalysisResponse(null);
  };

  // Primary Action: Analyze & Fix
  const handleAnalyzeAndFix = async () => {
    // 1. Validate inputs
    let hasError = false;

    if (!pythonCode.trim()) {
      setCodeValidationError("Please enter or paste your Python code.");
      hasError = true;
    } else {
      setCodeValidationError(null);
    }

    if (!errorMessage.trim()) {
      setErrorValidationError("Please enter the Python error message.");
      hasError = true;
    } else {
      setErrorValidationError(null);
    }

    if (hasError) return;

    // 2. Start Loading
    setLoading(true);
    setLoadingStep("Connecting to CodeDoctorAI Node.js backend...");
    setAnalysisResponse(null);

    try {
      // Minor step update for transparent feedback
      setTimeout(() => {
        setLoadingStep(
          serverStatus?.ibmBobConfigured
            ? "Sending Python code & traceback to IBM Bob Inference API..."
            : "Running Python AST Compiler & checking configuration..."
        );
      }, 500);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code: pythonCode,
          error: errorMessage
        })
      });

      const data: AnalyzeApiResponse = await response.json();

      if (!response.ok && !data.fallbackResult) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      setAnalysisResponse(data);

      // Refresh server status in background
      fetchServerStatus();

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err: any) {
      console.error("Analysis request error:", err);
      // Construct fallback view if request totally failed
      setAnalysisResponse({
        success: false,
        service: "Python Syntax Checker Fallback",
        isIbmBob: false,
        error: err.message,
        message: `Analysis error: ${err.message}`,
        fallbackResult: {
          hasSyntaxError: true,
          errorType: "ConnectionError",
          message: err.message,
          formatted: String(err)
        }
      });
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  // Secondary Action: Check Syntax Only (Real server-side Python AST parser)
  const handleCheckSyntaxOnly = async () => {
    if (!pythonCode.trim()) {
      setCodeValidationError("Please enter Python code to verify.");
      return;
    }
    setCodeValidationError(null);
    setLoading(true);
    setLoadingStep("Executing Python 3.10 AST compiler on server...");
    setAnalysisResponse(null);

    try {
      const response = await fetch("/api/syntax-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: pythonCode })
      });

      const data = await response.json();
      const syntaxResult: SyntaxCheckResult = data.syntaxResult;

      setAnalysisResponse({
        success: true,
        service: "Python Syntax Checker Fallback",
        isIbmBob: false,
        message: "Standalone server-side Python syntax compile verification completed.",
        fallbackResult: syntaxResult
      });

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err: any) {
      console.error("Syntax check error:", err);
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  // Derive highlighted line number from fallbackResult if available
  const errorHighlightLine = analysisResponse?.fallbackResult?.line || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-900">
      {/* Top Header */}
      <Header
        status={serverStatus}
        onOpenConfigModal={() => setConfigModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Subhead / Hero Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-sky-950/40 border border-slate-800 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-950 text-sky-300 border border-sky-800">
                Official IBM Bob 2.0 Hackathon Track
              </span>
              <span className="hidden sm:inline-block text-xs text-slate-500">•</span>
              <span className="text-xs text-amber-300 font-medium">Real-Time Python Diagnostics</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Prescribe immediate, expert cures for broken Python code
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Paste your Python script and error message. The backend queries IBM Bob’s inference engine to diagnose root causes, provide beginner-friendly breakdowns, and output clean corrected code.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Example</span>
            </button>
            <button
              type="button"
              onClick={() => setConfigModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-950 hover:bg-sky-900 text-sky-200 text-xs font-medium border border-sky-800 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>How It Works</span>
            </button>
          </div>
        </div>

        {/* Input Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Python Code Editor (7 cols) */}
          <div className="lg:col-span-7 space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="python-code-input"
                className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2"
              >
                <span>Python Code Editor</span>
                <span className="text-[10px] text-sky-400 font-normal normal-case">
                  (Paste or edit script)
                </span>
              </label>
              {codeValidationError && (
                <span className="text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {codeValidationError}
                </span>
              )}
            </div>

            <CodeEditor
              code={pythonCode}
              onChange={(val) => {
                setPythonCode(val);
                if (codeValidationError) setCodeValidationError(null);
              }}
              onSelectSample={handleSelectSample}
              errorHighlightLine={errorHighlightLine}
            />
          </div>

          {/* Right Column: Error Message & Action Buttons (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="python-error-input"
                className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2"
              >
                <span>Error Message</span>
                <span className="text-[10px] text-amber-400 font-normal normal-case">
                  (Traceback or exception)
                </span>
              </label>

              <ErrorInput
                error={errorMessage}
                onChange={(val) => {
                  setErrorMessage(val);
                  if (errorValidationError) setErrorValidationError(null);
                }}
                onClear={() => setErrorMessage("")}
                errorFeedback={errorValidationError}
              />
            </div>

            {/* Action Buttons Box */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
              {/* Primary Analyze & Fix button */}
              <button
                type="button"
                id="analyze-and-fix-btn"
                onClick={handleAnalyzeAndFix}
                disabled={loading}
                className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-sky-400 hover:from-amber-400 hover:to-sky-300 text-slate-950 font-bold text-sm py-3 px-4 shadow-lg hover:shadow-amber-500/25 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing with CodeDoctorAI...</span>
                  </>
                ) : (
                  <>
                    <Stethoscope className="w-4 h-4 text-slate-950" />
                    <span>Analyze & Fix</span>
                    <Sparkles className="w-3.5 h-3.5 ml-1 text-slate-900/80" />
                  </>
                )}
              </button>

              {/* Secondary Local Syntax Checker button */}
              <button
                type="button"
                onClick={handleCheckSyntaxOnly}
                disabled={loading}
                className="w-full py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Runs local Python 3 AST compiler to check for syntax errors only"
              >
                <Terminal className="w-3.5 h-3.5 text-sky-400" />
                <span>Verify Syntax with Local Python AST</span>
              </button>

              {/* Status Note */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Real Python & IBM Bob
                </span>
                <span>Python only</span>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="p-8 rounded-2xl bg-slate-900/80 border border-sky-500/40 shadow-2xl flex flex-col items-center justify-center space-y-4 text-center animate-pulse">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-500/50 flex items-center justify-center">
                <Stethoscope className="w-7 h-7 text-sky-400 animate-bounce" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-400"></span>
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                CodeDoctorAI Consultation in Progress
              </h3>
              <p className="text-xs text-sky-300 font-mono">
                {loadingStep || "Consulting IBM Bob AI service..."}
              </p>
              <p className="text-[11px] text-slate-500">
                Evaluating Python abstract syntax tree and runtime traceback...
              </p>
            </div>
          </div>
        )}

        {/* Results Area */}
        <div ref={resultsRef}>
          {analysisResponse && (
            <div className="space-y-4 pt-2">
              {analysisResponse.isIbmBob && analysisResponse.result ? (
                // Genuine IBM Bob Analysis Result
                <AnalysisResult
                  data={analysisResponse.result}
                  model={analysisResponse.model}
                  isIbmBob={true}
                />
              ) : (
                // Python Syntax Checker Fallback
                <FallbackResultView
                  fallbackResult={analysisResponse.fallbackResult}
                  message={analysisResponse.message}
                  details={analysisResponse.details}
                  error={analysisResponse.error}
                  notConfigured={analysisResponse.notConfigured}
                  onOpenConfigModal={() => setConfigModalOpen(true)}
                />
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-5 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">CodeDoctorAI</span>
            <span>•</span>
            <span>Built for IBM Bob 2.0 Hackathon</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Powered by IBM Bob Inference & Python 3 AST</span>
            <button
              type="button"
              onClick={() => setConfigModalOpen(true)}
              className="text-amber-400 hover:underline cursor-pointer"
            >
              API Details & Environment
            </button>
          </div>
        </div>
      </footer>

      {/* Configuration & Architecture Modal */}
      <ConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        status={serverStatus}
      />
    </div>
  );
}
