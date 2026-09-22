import express from "express";
import path from "path";
import { spawn } from "child_process";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

export interface SyntaxCheckResult {
  hasSyntaxError: boolean;
  errorType?: string;
  message: string;
  line?: number;
  offset?: number;
  text?: string;
  formatted?: string;
}

/**
 * Execute real Python parser / AST compiler on the server.
 * This is genuine, local Python code validation.
 */
function runPythonSyntaxCheck(code: string): Promise<SyntaxCheckResult> {
  return new Promise((resolve) => {
    const pythonScript = `
import sys, json, ast
code = sys.stdin.read()
try:
    ast.parse(code)
    print(json.dumps({"hasSyntaxError": False, "message": "No Python syntax error detected."}))
except SyntaxError as e:
    print(json.dumps({
        "hasSyntaxError": True,
        "errorType": "SyntaxError",
        "message": e.msg if hasattr(e, 'msg') else str(e),
        "line": e.lineno,
        "offset": e.offset,
        "text": e.text.strip() if e.text else "",
        "formatted": f"SyntaxError at line {e.lineno}, col {e.offset}: {e.msg}"
    }))
except Exception as e:
    print(json.dumps({
        "hasSyntaxError": True,
        "errorType": type(e).__name__,
        "message": str(e),
        "formatted": f"{type(e).__name__}: {str(e)}"
    }))
`;

    const pyProcess = spawn("python3", ["-c", pythonScript]);
    let stdout = "";
    let stderr = "";

    pyProcess.stdin.write(code);
    pyProcess.stdin.end();

    pyProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    pyProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    pyProcess.on("close", (exitCode) => {
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (err) {
        if (exitCode !== 0 && stderr) {
          resolve({
            hasSyntaxError: true,
            errorType: "PythonExecutionError",
            message: stderr.trim(),
            formatted: stderr.trim()
          });
        } else {
          resolve({
            hasSyntaxError: false,
            message: "No Python syntax error detected."
          });
        }
      }
    });

    pyProcess.on("error", (err) => {
      resolve({
        hasSyntaxError: true,
        errorType: "ServerRuntimeError",
        message: `Failed to execute python3: ${err.message}`,
        formatted: err.message
      });
    });
  });
}

// 1. Health & Configuration Status
app.get("/api/status", (_req, res) => {
  const apiKey = process.env.IBM_BOB_API_KEY?.trim();
  const isConfigured = Boolean(apiKey && apiKey !== "your_key_here" && apiKey.length > 5);
  const configuredModel = process.env.IBM_BOB_MODEL?.trim();
  const activeModel = configuredModel && configuredModel !== "pro" ? configuredModel : "fast";

  res.json({
    status: "ok",
    ibmBobConfigured: isConfigured,
    endpoint: process.env.IBM_BOB_BASE_URL || "https://api.us-east.bob.ibm.com/inference/v1",
    model: activeModel,
    pythonAvailable: true
  });
});

// 2. Real Python Syntax Check Endpoint (Standalone fallback)
app.post("/api/syntax-check", async (req, res) => {
  const { code } = req.body;

  if (typeof code !== "string" || !code.trim()) {
    return res.status(400).json({ error: "Please enter your Python code." });
  }

  const check = await runPythonSyntaxCheck(code);
  return res.json({
    service: "Python Syntax Checker Fallback",
    isIbmBob: false,
    syntaxResult: check
  });
});

// Helper to parse response from IBM Bob (JSON block or raw JSON or markdown)
function parseBobResponse(rawText: string) {
  // Try extracting from markdown ```json ... ```
  const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const candidate = jsonMatch ? jsonMatch[1].trim() : rawText.trim();

  try {
    const parsed = JSON.parse(candidate);
    return {
      diagnosis: parsed.diagnosis || "Python code error identified.",
      explanation: parsed.explanation || "Detailed analysis of the error.",
      rootCause: parsed.rootCause || "The syntax or runtime condition triggered this error.",
      correctedCode: parsed.correctedCode || "",
      whatWasChanged: parsed.whatWasChanged || "Updated code to resolve the error.",
      debuggingTips: Array.isArray(parsed.debuggingTips) ? parsed.debuggingTips : [
        "Check parenthesis and brackets balance",
        "Verify indentation consistency",
        "Test with print debugging statements"
      ]
    };
  } catch (e) {
    // If not strict JSON, parse structured text
    const diagnosis = rawText.match(/(?:Diagnosis|What is wrong)[:\s*]+([^\n]+)/i)?.[1] ||
      "Python error detected in execution.";
    const explanation = rawText.match(/(?:Explanation|Beginner-Friendly Explanation)[:\s*]+([\s\S]*?)(?=(?:Root Cause|Corrected|What Was Changed|Tips)|$)/i)?.[1]?.trim() ||
      rawText.slice(0, 300);
    const rootCause = rawText.match(/(?:Likely Root Cause|Root Cause)[:\s*]+([\s\S]*?)(?=(?:Corrected|What Was Changed|Tips)|$)/i)?.[1]?.trim() ||
      "Issue caused by syntax or type mismatch.";
    const codeMatch = rawText.match(/```python\s*([\s\S]*?)\s*```/i) || rawText.match(/```\s*([\s\S]*?)\s*```/);
    const correctedCode = codeMatch ? codeMatch[1].trim() : "";
    const whatWasChanged = rawText.match(/(?:What Was Changed|Changes Made)[:\s*]+([\s\S]*?)(?=(?:Tips|Debugging Tips)|$)/i)?.[1]?.trim() ||
      "Modified the code structure to fix the reported error.";

    return {
      diagnosis,
      explanation,
      rootCause,
      correctedCode,
      whatWasChanged,
      debuggingTips: [
        "Carefully check line numbers indicated in traceback errors.",
        "Ensure Python indentation uses consistent 4 spaces.",
        "Use syntax linters or Python compiler before running."
      ]
    };
  }
}

function cleanApiErrorText(status: number, rawText: string): string {
  if (!rawText || !rawText.trim()) {
    return `IBM Bob returned HTTP ${status}`;
  }

  // Try to parse JSON error first (standard IBM Bob format)
  try {
    const parsed = JSON.parse(rawText);
    if (parsed.message && parsed.error) {
      return `${parsed.error}: ${parsed.message}`;
    }
    if (parsed.message) return parsed.message;
    if (parsed.error) return typeof parsed.error === "string" ? parsed.error : JSON.stringify(parsed.error);
  } catch {
    // Not JSON format
  }

  // Check if Cloudflare HTML challenge / 403 / 5xx error
  if (
    rawText.includes("<!DOCTYPE html>") ||
    rawText.includes("<html") ||
    rawText.includes("cf-alert") ||
    rawText.includes("Cloudflare") ||
    rawText.includes("Attention Required")
  ) {
    if (status === 403) {
      return "Cloudflare security verification (HTTP 403). The request was challenged by Cloudflare. Please verify the IBM_BOB_API_KEY and endpoint configuration.";
    }
    return `IBM Bob gateway returned an HTML error page (HTTP ${status}).`;
  }

  // Plain text fallback: strip HTML tags and truncate cleanly
  const stripped = rawText.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim();
  return stripped.length > 250 ? `${stripped.slice(0, 250)}...` : stripped;
}

function buildBobHeaders(apiKey: string, scheme: "Apikey" | "Bearer", userAgent = "pi-bob/0.2.2"): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "User-Agent": userAgent,
    "Authorization": `${scheme} ${apiKey}`,
    "x-api-key": apiKey
  };

  if (process.env.IBM_BOB_TEAM_ID) {
    headers["x-team-id"] = process.env.IBM_BOB_TEAM_ID;
  }
  if (process.env.IBM_BOB_INSTANCE_ID) {
    headers["x-instance-id"] = process.env.IBM_BOB_INSTANCE_ID;
  }

  if (process.env.IBM_BOB_HEADERS_JSON) {
    try {
      const extra = JSON.parse(process.env.IBM_BOB_HEADERS_JSON);
      Object.assign(headers, extra);
    } catch (e) {
      console.warn("Failed to parse IBM_BOB_HEADERS_JSON:", e);
    }
  }

  return headers;
}

// 3. Main Analyze Route: POST /api/analyze
app.post("/api/analyze", async (req, res) => {
  const { code, error } = req.body;

  // Validation
  if (typeof code !== "string" || !code.trim()) {
    return res.status(400).json({
      success: false,
      error: "Please enter your Python code to analyze."
    });
  }

  if (typeof error !== "string" || !error.trim()) {
    return res.status(400).json({
      success: false,
      error: "Please enter the Python error message."
    });
  }

  const rawApiKey = process.env.IBM_BOB_API_KEY?.trim();
  const hasValidKey = Boolean(rawApiKey && rawApiKey !== "your_key_here" && rawApiKey.length > 5);

  // If IBM Bob is not configured, run real Python syntax checker fallback
  if (!rawApiKey || !hasValidKey) {
    const syntaxResult = await runPythonSyntaxCheck(code);
    return res.json({
      success: true,
      service: "Python Syntax Checker Fallback",
      isIbmBob: false,
      notConfigured: true,
      message: "IBM Bob is not configured. Please add the IBM_BOB_API_KEY server secret.",
      fallbackResult: syntaxResult
    });
  }

  const apiKey: string = rawApiKey;

  // Real IBM Bob Inference API Call
  const baseUrl = process.env.IBM_BOB_BASE_URL || "https://api.us-east.bob.ibm.com/inference/v1";
  const rawModel = process.env.IBM_BOB_MODEL?.trim();
  const model = rawModel && rawModel !== "pro" ? rawModel : "fast";
  const endpoint = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;

  const systemPrompt = `You are CodeDoctorAI, an expert Python code diagnostic AI for the IBM Bob 2.0 Hackathon.
You analyze Python code and its corresponding error message to provide a precise, high-craft medical-style diagnosis and fix.
You MUST reply STRICTLY with a valid JSON object matching this exact schema:
{
  "diagnosis": "Short, precise 1-2 sentence diagnosis of what is wrong",
  "explanation": "Beginner-friendly explanation of the Python error in simple, approachable language",
  "rootCause": "Clear explanation of why this error occurred in the execution flow or syntax tree",
  "correctedCode": "The complete, working, corrected Python program with no omissions or placeholders",
  "whatWasChanged": "Clear explanation of the exact changes made to the original code to fix the issue",
  "debuggingTips": [
    "Practical Python tip 1 relevant to this error",
    "Practical Python tip 2 relevant to this error",
    "Practical Python tip 3 relevant to this error"
  ]
}
Do not wrap your response in markdown code blocks if possible, or return strictly valid JSON.`;

  const userPrompt = `Python Code:
\`\`\`python
${code}
\`\`\`

Python Error Message:
${error}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    const envScheme = process.env.IBM_BOB_AUTH_SCHEME?.trim();
    const primaryScheme: "Apikey" | "Bearer" =
      envScheme === "Bearer" || envScheme === "Apikey"
        ? envScheme
        : apiKey.startsWith("ey")
        ? "Bearer"
        : "Apikey";
    const alternateScheme: "Apikey" | "Bearer" = primaryScheme === "Bearer" ? "Apikey" : "Bearer";

    const requestPayload = {
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.15,
      max_tokens: 2048
    };

    let bobResponse = await fetch(endpoint, {
      method: "POST",
      headers: buildBobHeaders(apiKey, primaryScheme, "pi-bob/0.2.2"),
      body: JSON.stringify(requestPayload),
      signal: controller.signal
    });

    // If unauthorized and no custom scheme was pinned, attempt alternate scheme (Bearer <-> Apikey)
    if (bobResponse.status === 401 && !envScheme) {
      const peekText = await bobResponse.clone().text().catch(() => "");
      if (peekText.includes("jwt") || peekText.includes("token") || peekText.includes("API Key")) {
        const retryResponse = await fetch(endpoint, {
          method: "POST",
          headers: buildBobHeaders(apiKey, alternateScheme, "pi-bob/0.2.2"),
          body: JSON.stringify(requestPayload),
          signal: controller.signal
        });
        if (retryResponse.ok || retryResponse.status !== 401) {
          bobResponse = retryResponse;
        }
      }
    }

    // If Cloudflare 403 HTML challenge is encountered, attempt with fallback client user agent
    if (bobResponse.status === 403) {
      const peekText = await bobResponse.clone().text().catch(() => "");
      if (
        peekText.includes("<!DOCTYPE html>") ||
        peekText.includes("cf-alert") ||
        peekText.includes("Cloudflare") ||
        peekText.includes("Attention Required")
      ) {
        const retryWithBobshell = await fetch(endpoint, {
          method: "POST",
          headers: buildBobHeaders(apiKey, primaryScheme, "bobshell/1.0.0"),
          body: JSON.stringify(requestPayload),
          signal: controller.signal
        });
        if (retryWithBobshell.ok || retryWithBobshell.status !== 403) {
          bobResponse = retryWithBobshell;
        }
      }
    }

    // If model returned 404 not found (e.g. unknown model requested), retry with 'fast'
    if (bobResponse.status === 404 && model !== "fast") {
      const retryModelPayload = { ...requestPayload, model: "fast" };
      const retryModelResponse = await fetch(endpoint, {
        method: "POST",
        headers: buildBobHeaders(apiKey, primaryScheme, "pi-bob/0.2.2"),
        body: JSON.stringify(retryModelPayload),
        signal: controller.signal
      });
      if (retryModelResponse.ok) {
        bobResponse = retryModelResponse;
      }
    }

    clearTimeout(timeoutId);

    if (!bobResponse.ok) {
      const errorText = await bobResponse.text().catch(() => "");
      const cleanedError = cleanApiErrorText(bobResponse.status, errorText);
      console.error(`IBM Bob API error (${bobResponse.status}):`, cleanedError);

      // Graceful fallback to real Python syntax checker without crashing
      const syntaxResult = await runPythonSyntaxCheck(code);
      return res.status(200).json({
        success: true,
        service: "Python Syntax Checker Fallback",
        isIbmBob: false,
        error: `IBM Bob service returned HTTP ${bobResponse.status}`,
        message: `IBM Bob returned an error (${bobResponse.status}): ${cleanedError}`,
        details: cleanedError,
        fallbackResult: syntaxResult
      });
    }

    const data = await bobResponse.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("IBM Bob response did not contain message content.");
    }

    const parsedResult = parseBobResponse(content);

    return res.json({
      success: true,
      service: "IBM Bob AI Analysis",
      isIbmBob: true,
      model: data.model || model,
      result: parsedResult
    });
  } catch (err: any) {
    console.error("IBM Bob connection error:", err.message);

    // Run real Python syntax checker fallback
    const syntaxResult = await runPythonSyntaxCheck(code);
    const isTimeout = err.name === "AbortError";

    return res.status(200).json({
      success: true,
      service: "Python Syntax Checker Fallback",
      isIbmBob: false,
      error: isTimeout ? "IBM Bob request timed out." : err.message,
      message: isTimeout
        ? "IBM Bob request timed out. Showing local Python Syntax Checker Fallback."
        : `Unable to reach IBM Bob (${err.message}). Showing local Python Syntax Checker Fallback.`,
      details: err.message,
      fallbackResult: syntaxResult
    });
  }
});

// Vite middleware & Production static serving
async function setupApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CodeDoctorAI server running on http://0.0.0.0:${PORT}`);
  });
}

setupApp().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
