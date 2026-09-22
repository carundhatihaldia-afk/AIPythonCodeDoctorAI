export interface AnalysisData {
  diagnosis: string;
  explanation: string;
  rootCause: string;
  correctedCode: string;
  whatWasChanged: string;
  debuggingTips: string[];
}

export interface SyntaxCheckResult {
  hasSyntaxError: boolean;
  errorType?: string;
  message: string;
  line?: number;
  offset?: number;
  text?: string;
  formatted?: string;
}

export interface AnalyzeApiResponse {
  success: boolean;
  service: "IBM Bob AI Analysis" | "Python Syntax Checker Fallback";
  isIbmBob: boolean;
  model?: string;
  notConfigured?: boolean;
  message?: string;
  details?: string;
  error?: string;
  result?: AnalysisData;
  fallbackResult?: SyntaxCheckResult;
}

export interface ServerStatusResponse {
  status: string;
  ibmBobConfigured: boolean;
  endpoint: string;
  model: string;
  pythonAvailable: boolean;
}

export interface SampleCase {
  title: string;
  errorLabel: string;
  code: string;
  error: string;
  description: string;
}
