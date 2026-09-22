# CodeDoctorAI 🩺🐍

**AI-Powered Python Code Error Doctor • IBM Bob 2.0 Hackathon**

CodeDoctorAI is a full-stack, genuine Python error diagnosis and repair application. It accepts problematic Python code alongside error messages/tracebacks and uses **IBM Bob’s Inference API** to deliver medical-style code diagnoses, beginner-friendly explanations, root-cause dissections, full corrected Python code, and actionable debugging tips.

---

## 🌟 Key Features

- **Genuine IBM Bob AI Inference:** Calls IBM Bob's OpenAI-compatible inference endpoint (`/inference/v1/chat/completions`) server-side.
- **Python Syntax Checker Fallback:** When IBM Bob is not yet configured or temporarily offline, the server executes a local Python 3 AST compiler to detect syntax errors without producing simulated AI responses.
- **Structured Diagnosis & Repair:**
  - 🩺 **Diagnosis**: High-level medical assessment of the code's ailment.
  - 💡 **Beginner-Friendly Explanation**: Simple, jargon-free clarification of the error.
  - 🔍 **Likely Root Cause**: Detailed explanation of why the failure occurred in execution.
  - ✅ **Corrected Python Code**: Complete, copyable, working Python program.
  - 🛠 **What Was Changed**: Clear diff/change summary.
  - 💬 **Debugging Tips**: 2–4 practical Python tips for prevention.
- **Strict Python Focus:** Dedicated strictly to Python scripts (no multi-language clutter).
- **Zero Client-Side Secrets:** API keys are restricted exclusively to the Node.js backend.

---

## 🏗️ Architecture

```
User Browser / Mobile
       │
       ▼
 [POST /api/analyze]
       │
       ▼
  Node.js Express Backend
       │
       ├──► Has IBM_BOB_API_KEY?
       │         │
       │         ├── YES ──► IBM Bob Inference API (https://api.us-east.bob.ibm.com/inference/v1)
       │         │                │
       │         │                ▼
       │         │           Returns AI Diagnosis & Corrected Code
       │         │
       │         └── NO / Error ──► Python 3 AST Compiler Fallback (Local server python3)
       │                                  │
       │                                  ▼
       │                             Returns Syntax Error / Verified AST
       ▼
  React Frontend UI
(Displays "IBM Bob AI Analysis" or "Python Syntax Checker Fallback")
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18 or newer
- **Python**: Python 3.8+ (for local syntax verification fallback)
- **IBM Bob Account**: Access to [bob.ibm.com](https://bob.ibm.com)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment configuration:

```bash
cp .env.example .env
```

Open `.env` and configure your IBM Bob API key:

```env
# Server-side IBM Bob API key (Required for AI analysis)
IBM_BOB_API_KEY="your_ibm_bob_api_key_here"

# Optional: Custom base URL (defaults to https://api.us-east.bob.ibm.com/inference/v1)
# IBM_BOB_BASE_URL="https://api.us-east.bob.ibm.com/inference/v1"

# Optional: Model name (defaults to pro; fast or premium also supported)
# IBM_BOB_MODEL="pro"
```

> **Security Note:** Never commit `.env` or real API keys to version control. `.env` is listed in `.gitignore`.

### 3. Run Development Server

```bash
npm run dev
```

The application runs on `http://localhost:3000`.

### 4. Build for Production

```bash
npm run build
npm start
```

---

## 🔑 How the IBM Bob Integration Works

1. **Authentication:** Authenticates to IBM Bob using `Authorization: Bearer <IBM_BOB_API_KEY>` and `x-api-key: <IBM_BOB_API_KEY>` headers.
2. **Inference Endpoint:** Routes requests to `https://api.us-east.bob.ibm.com/inference/v1/chat/completions`.
3. **Structured Schema:** Uses system prompts and strict JSON formatting to guarantee all 6 required diagnostic fields are parsed cleanly into the UI.
4. **Resilience & Fallback:** If IBM Bob is not configured or encounters an issue, CodeDoctorAI does not crash. It informs the user and runs Python's native AST parser (`ast.parse`) on the server, clearly labeling output as `Python Syntax Checker Fallback`.

---

## 🧪 Testing the Application

### Example Test Case (Unclosed Parenthesis)

**Python Code:**
```python
print("Hello"
```

**Error Message:**
```
SyntaxError: '(' was never closed
```

1. Enter or select this scenario in CodeDoctorAI.
2. Click **Analyze & Fix**.
3. View the diagnosis, root cause, and the corrected Python code:
   ```python
   print("Hello")
   ```
4. Click **Copy Code** to verify one-click clipboard copying.

---

## 📄 License

Apache-2.0
