# 👨‍💻 Developer Guide - Extending AI Features

## Overview
This guide explains how to extend, customize, or integrate additional AI features into CodeFusion AI.

---

## Architecture Overview

```
Monaco Editor (Client)
    ↓ (selects text)
    ↓
Room.jsx (state management)
    ↓ (onClick handlers)
    ↓
aiApi.js (HTTP requests)
    ↓ (POST /api/ai/*)
    ↓
aiController.js (request handling)
    ↓ (calls service)
    ↓
aiService.js (Claude API calls)
    ↓ (returns JSON)
    ↓
AIAssistantPanel (displays results)
```

---

## Adding a New AI Feature

### Step 1: Add Service Function in `aiService.js`

```javascript
/**
 * New AI feature example: Unit test generation
 */
const generateUnitTests = async (code, language, testFramework) => {
  const userMessage = `Generate unit tests for this ${language} code using ${testFramework}:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. Test cases that cover all functions
2. Edge case tests
3. Error condition tests
4. Complete test code

Format as JSON with keys: testCases (array), testCode, coverage`;

  const systemPrompt = `You are an expert ${language} developer and tester. Generate comprehensive unit tests. Always respond with valid JSON.`;

  try {
    const response = await callClaude(userMessage, systemPrompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Could not parse Claude response as JSON");
  } catch (error) {
    console.error("[aiService] Error generating tests:", error.message);
    throw error;
  }
};

module.exports = {
  // ... existing exports
  generateUnitTests,  // Add this
};
```

### Step 2: Add Controller Function in `aiController.js`

```javascript
/**
 * POST /api/ai/generate-tests
 * Generate unit tests for provided code
 */
const generateUnitTests = async (req, res) => {
  const { code, language, testFramework } = req.body || {};

  // Validation
  if (!code || typeof code !== "string") {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      detail: "`code` is required and must be a string",
    });
  }

  if (!language || typeof language !== "string") {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      detail: "`language` is required and must be a string",
    });
  }

  if (!testFramework || typeof testFramework !== "string") {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      detail: "`testFramework` is required and must be a string",
    });
  }

  if (!aiService.isConfigured()) {
    return res.status(503).json({
      success: false,
      error: "AI service not configured",
      detail: "Claude API key not set. Contact administrator.",
    });
  }

  try {
    console.log("[aiController] generate-tests request for", language);
    const result = await aiService.generateUnitTests(code, language, testFramework);
    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[aiController] generate-tests failed:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to generate tests",
      detail: error.message,
    });
  }
};

module.exports = {
  // ... existing exports
  generateUnitTests,  // Add this
};
```

### Step 3: Add Route in `aiRoutes.js`

```javascript
const {
  getStatus,
  explainError,
  optimizeCode,
  reviewCode,
  explainCode,
  generateUnitTests,  // Add this import
} = require("../controllers/aiController");

// ... existing routes

// POST /api/ai/generate-tests
router.post("/generate-tests", generateUnitTests);

module.exports = router;
```

### Step 4: Add Frontend API Function in `aiApi.js`

```javascript
/**
 * Generate unit tests
 */
export const generateUnitTests = async (code, language, testFramework) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/generate-tests`, {
      code,
      language,
      testFramework,
    });
    return response.data;
  } catch (error) {
    console.error("Error generating tests:", error);
    throw error;
  }
};
```

### Step 5: Create UI Component `UnitTestGenerator.jsx`

```javascript
/**
 * UnitTestGenerator.jsx
 * Component to display generated unit tests
 */

import { useState } from "react";
import { generateUnitTests } from "../../api/aiApi";

export default function UnitTestGenerator({ code, language }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testFramework, setTestFramework] = useState("jest");

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await generateUnitTests(code, language, testFramework);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to generate tests");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {!result ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Test Framework:</label>
            <select
              value={testFramework}
              onChange={(e) => setTestFramework(e.target.value)}
              className="w-full rounded bg-gray-100 px-3 py-2 border border-gray-300"
            >
              <option value="jest">Jest</option>
              <option value="mocha">Mocha</option>
              <option value="pytest">Pytest</option>
              <option value="unittest">Unittest</option>
              <option value="jasmine">Jasmine</option>
              <option value="junit">JUnit</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {loading ? "🔄 Generating..." : "✨ Generate Tests"}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">Test Cases:</h3>
            <ul className="space-y-2">
              {result.testCases?.map((testCase, idx) => (
                <li key={idx} className="text-green-800">
                  <strong>Test {idx + 1}:</strong> {testCase}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Test Code:</h3>
            <pre className="bg-white border border-gray-300 rounded p-3 overflow-x-auto">
              <code className="text-sm text-gray-800">{result.testCode}</code>
            </pre>
          </div>

          <button
            onClick={() => setResult(null)}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
```

### Step 6: Add Tab to AIAssistantPanel

```javascript
// In AIAssistantPanel.jsx, add to imports:
import UnitTestGenerator from "./UnitTestGenerator";

// Add button in tabs section:
<button
  onClick={() => setActiveTab("tests")}
  className={`px-4 py-3 font-medium transition ${
    activeTab === "tests"
      ? "border-b-2 border-blue-600 text-blue-600"
      : "text-gray-600 hover:text-gray-900"
  }`}
>
  🧪 Generate Tests
</button>

// Add content section:
{activeTab === "tests" && (
  <UnitTestGenerator 
    code={code} 
    language={language} 
  />
)}
```

### Step 7: Add Button to Room Component

```javascript
// In Room.jsx, add button:
<button
  onClick={() => openAIPanel("tests")}
  className="rounded bg-yellow-600 px-3 py-2 text-sm font-semibold hover:bg-yellow-700"
  title="Generate unit tests"
>
  🧪 Tests
</button>
```

---

## Advanced Customization

### Custom Prompts

Modify system prompts in `aiService.js` to customize AI behavior:

```javascript
// More detailed prompts
const detailedSystemPrompt = `You are an expert ${language} developer with 20+ years of experience.
Provide production-grade code and suggestions. Focus on performance, security, and maintainability.
Always respond with valid JSON.`;

// Language-specific adjustments
const pythonPrompt = `You are a Python expert. Follow PEP 8 standards. 
Consider Python 3.9+ features. Always respond with valid JSON.`;
```

### Response Formatting

Add custom response formatters:

```javascript
const formatAnalysisResponse = (response) => {
  return {
    ...response,
    formattedAt: new Date().toISOString(),
    version: "1.0",
    metadata: {
      model: CLAUDE_MODEL,
      tokensUsed: response.usage?.total_tokens,
    },
  };
};
```

### Caching Results

Add caching for repeated requests:

```javascript
const cache = new Map();

const getCached = (key) => cache.get(key);
const setCached = (key, value) => cache.set(key, value);
const createCacheKey = (code, type, language) => 
  `${type}-${language}-${code.length}-${hashCode(code)}`;
```

---

## Testing New Features

### Unit Tests for AI Service

```javascript
// test/aiService.test.js
const aiService = require("../services/aiService");

describe("AI Service", () => {
  it("should explain errors correctly", async () => {
    const result = await aiService.explainError(
      "let x = 1; x.toUpperCase();",
      "TypeError: x.toUpperCase is not a function",
      "javascript"
    );
    
    expect(result).toHaveProperty("cause");
    expect(result).toHaveProperty("location");
    expect(result).toHaveProperty("explanation");
    expect(result).toHaveProperty("fix");
    expect(result).toHaveProperty("correctedCode");
  });

  it("should handle API errors gracefully", async () => {
    try {
      // Test with invalid API key
      await aiService.explainError("", "", "");
    } catch (error) {
      expect(error.message).toContain("validation");
    }
  });
});
```

### Integration Tests

```javascript
// test/aiController.test.js
const request = require("supertest");
const app = require("../server");

describe("AI Controller", () => {
  it("POST /api/ai/status should return AI status", async () => {
    const res = await request(app).get("/api/ai/status");
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("success");
    expect(res.body).toHaveProperty("available");
  });

  it("POST /api/ai/explain-error should explain errors", async () => {
    const res = await request(app)
      .post("/api/ai/explain-error")
      .send({
        code: "let x = 1; x.toUpperCase();",
        errorMessage: "TypeError: x.toUpperCase is not a function",
        language: "javascript"
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("cause");
  });
});
```

---

## Performance Optimization

### Request Throttling

```javascript
const throttleRequests = (() => {
  let lastRequest = 0;
  const minInterval = 1000; // 1 second minimum

  return async (fn) => {
    const now = Date.now();
    const timeToWait = Math.max(0, minInterval - (now - lastRequest));
    
    if (timeToWait > 0) {
      await new Promise(resolve => setTimeout(resolve, timeToWait));
    }
    
    lastRequest = Date.now();
    return fn();
  };
};
```

### Request Batching

```javascript
const batchAnalysis = async (codeBlocks, language) => {
  // Combine multiple code blocks for single API call
  const combined = codeBlocks.join("\n\n// ---\n\n");
  return optimizeCode(combined, language);
};
```

---

## Security Enhancements

### Input Sanitization

```javascript
const sanitizeCode = (code) => {
  // Remove sensitive information before sending to Claude
  return code
    .replace(/API_KEY|secret|password/gi, "[REDACTED]")
    .substring(0, 50000); // Limit code size
};
```

### Rate Limiting

```javascript
const rateLimit = require("express-rate-limit");

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many AI requests, please try again later",
});

app.use("/api/ai", aiLimiter);
```

---

## Monitoring & Analytics

### Usage Tracking

```javascript
const trackUsage = async (feature, language, tokenCount) => {
  await Usage.create({
    feature,
    language,
    tokenCount,
    timestamp: new Date(),
    userId: req.user?.id,
  });
};

// In controller:
await trackUsage("error-explanation", language, result.usage?.total_tokens);
```

### Error Reporting

```javascript
const reportError = async (error, context) => {
  console.error("[AI Service Error]", {
    message: error.message,
    code: error.code,
    context,
    timestamp: new Date(),
  });

  // Send to error tracking service (Sentry, etc.)
};
```

---

## Deployment Considerations

### Environment-Specific Configuration

```javascript
const getAIConfig = () => ({
  apiKey: process.env.CLAUDE_API_KEY,
  model: process.env.CLAUDE_MODEL || "claude-3-5-sonnet-20241022",
  timeout: process.env.AI_TIMEOUT || 30000,
  retries: process.env.AI_RETRIES || 3,
  maxTokens: process.env.AI_MAX_TOKENS || 2048,
});
```

### Graceful Degradation

```javascript
const fallbackResponse = {
  success: false,
  available: false,
  message: "AI service temporarily unavailable. Please try again later.",
  suggestions: [
    "Check API key configuration",
    "Verify Claude API status",
    "Check server logs",
  ],
};
```

---

## API Extension Examples

### Multi-language Support

```javascript
const getLanguageConfig = (language) => {
  const configs = {
    javascript: { syntax: "javascript", style: "camelCase" },
    python: { syntax: "python", style: "snake_case" },
    java: { syntax: "java", style: "PascalCase" },
  };
  return configs[language.toLowerCase()];
};
```

### Model Switching

```javascript
const callClaudeWithModel = async (message, model) => {
  const response = await axios.post(CLAUDE_API_URL, {
    model: model || CLAUDE_MODEL,
    max_tokens: 2048,
    messages: [{ role: "user", content: message }],
  }, {
    headers: {
      "x-api-key": CLAUDE_API_KEY,
      "anthropic-version": "2023-06-01",
    },
  });

  return response.data.content[0].text;
};
```

---

## Troubleshooting Development Issues

### Debug Mode

```javascript
const DEBUG = process.env.DEBUG === "true";

if (DEBUG) {
  console.log("[DEBUG] Request:", {
    code: code.substring(0, 100),
    language,
    timestamp: new Date(),
  });
}
```

### Common Development Issues

| Issue | Solution |
|-------|----------|
| API key not working | Verify key format: `sk-ant-` prefix required |
| Response parse error | Check Claude response format, add logging |
| Timeout errors | Increase timeout, check network |
| Invalid JSON | Validate JSON in Claude response |

---

## Resources

- [Claude API Documentation](https://docs.anthropic.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Monaco Editor API](https://microsoft.github.io/monaco-editor/)

---

**Happy extending! 🚀**
