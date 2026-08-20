/**
 * aiService.js
 *
 * AI-powered assistance for programmers using an OpenAI-compatible provider.
 * Features:
 * - Error explanation and debugging suggestions
 * - Code optimization analysis
 * - Code review and quality analysis
 * - Code explanation and breakdown
 */

const axios = require("axios");

const provider = (process.env.AI_PROVIDER || "groq").toLowerCase();
const apiKey = process.env.AI_API_KEY || process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
const model = process.env.AI_MODEL || process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const endpoint = process.env.AI_API_URL || (provider === "openai" ? "https://api.openai.com/v1/chat/completions" : "https://api.groq.com/openai/v1/chat/completions");

if (!apiKey) {
  console.warn("[aiService] WARNING: AI API key is not configured");
}

const extractJSONCandidate = (text) => {
  if (!text || typeof text !== "string") {
    return null;
  }

  const fencedMatch = text.match(/```(?:json|javascript|txt)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  let start = text.indexOf("{");
  while (start !== -1) {
    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let index = start; index < text.length; index += 1) {
      const char = text[index];

      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (char === "\\") {
          escaped = true;
        } else if (char === '"') {
          inString = false;
        }
        continue;
      }

      if (char === '"') {
        inString = true;
        continue;
      }

      if (char === "{") {
        depth += 1;
      } else if (char === "}") {
        depth -= 1;
        if (depth === 0) {
          return text.slice(start, index + 1).trim();
        }
      }
    }

    start = text.indexOf("{", start + 1);
  }

  return null;
};

/**
 * Safely parses JSON from a provider response.
 * Handles:
 * - Plain JSON
 * - JSON wrapped in code fences
 * - Surrounding whitespace and markdown
 */
const safeParseJSON = (text) => {
  if (!text || typeof text !== "string") {
    throw new Error("Response is not a string");
  }

  const candidates = [];
  const extracted = extractJSONCandidate(text);
  if (extracted) {
    candidates.push(extracted);
  }

  candidates.push(text.trim());

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch (error) {
      // Keep trying the next candidate
    }
  }

  throw new Error("Failed to extract valid JSON from AI response");
};

/**
 * Validates if the AI service has the required credentials.
 */
const isConfigured = () => !!apiKey;

/**
 * Makes a request to an OpenAI-compatible AI endpoint.
 */
const callProvider = async (userMessage, systemPrompt = "", retries = 2) => {
  if (!apiKey) {
    throw new Error(
      "AI service is not configured. Set AI_API_KEY or GROQ_API_KEY."
    );
  }

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await axios.post(
        endpoint,
        {
          model,
          temperature: 0.2,

          // Keep token usage lower because Groq free/on-demand
          // limits are measured in tokens per minute.
          max_tokens: 1024,

          // All CodeFusion AI functions expect JSON.
          response_format: {
            type: "json_object",
          },

          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userMessage,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 45000,
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;

      if (typeof content === "string") {
        return content;
      }

      if (Array.isArray(content)) {
        return content
          .map((item) => item?.text || item?.content || "")
          .join("");
      }

      throw new Error("Invalid response format from AI provider");
    } catch (error) {
      const status = error.response?.status;

      const providerMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.detail ||
        error.message;

      console.error(
        "[aiService] Request failed",
        status || providerMessage
      );

      if (providerMessage) {
        console.error("[aiService] Provider error:", providerMessage);
      }

      // Retry rate-limit errors automatically.
      if (status === 429 && attempt < retries) {
        let waitTime = 5000;

        const retryAfter = error.response?.headers?.["retry-after"];

        if (retryAfter) {
          const retrySeconds = Number(retryAfter);

          if (!Number.isNaN(retrySeconds)) {
            waitTime = retrySeconds * 1000;
          }
        }

        console.log(
          `[aiService] Rate limited. Retrying in ${waitTime / 1000}s...`
        );

        await new Promise((resolve) => setTimeout(resolve, waitTime));

        continue;
      }

      if (status === 401 || status === 403) {
        throw new Error(
          "Invalid AI API credentials. Please check your configuration."
        );
      }

      if (status === 429) {
        throw new Error(
          "AI provider rate limit exceeded. Please try again later."
        );
      }

      if (status === 400) {
        throw new Error(
          "Invalid request to AI provider. Please verify the provider configuration."
        );
      }

      if (status === 404) {
        throw new Error(
          `AI model "${model}" is unavailable for this API key.`
        );
      }

      if (error.code === "ECONNABORTED") {
        throw new Error(
          "AI provider request timed out. Please try again later."
        );
      }

      throw new Error(
        "AI service temporarily unavailable. Please try again later."
      );
    }
  }

  throw new Error("AI provider request failed after multiple retries.");
};

/**
 * Explains an error and suggests fixes
 */
const explainError = async (code, errorMessage, language, execution = {}) => {
  const executionDetails = [
    execution.status && `Status: ${execution.status}`,
    execution.exitCode !== undefined && execution.exitCode !== null && `Exit code: ${execution.exitCode}`,
    execution.compileOutput && `Compiler output:\n${execution.compileOutput}`,
    execution.stderr && `Runtime stderr:\n${execution.stderr}`,
  ].filter(Boolean).join("\n\n");

  const userMessage = `I got an error in my ${language} code:

Reported error:
${errorMessage}

${executionDetails ? `Execution details:\n${executionDetails}\n` : ""}

Code:
\`\`\`${language}
${code}
\`\`\`

Use the reported error and execution details as the primary evidence. Do not give a general code review. Identify the actual compiler or runtime failure, connect it to the relevant line, and provide:
1. **Cause**: What caused the error
2. **Location**: Which line(s) are problematic
3. **Explanation**: Why it's happening
4. **Fix**: Step-by-step fix instructions
5. **Corrected Code**: The fixed code snippet

Format your response as JSON with these exact keys: cause, location, explanation, fix, correctedCode`;

  const systemPrompt = `You are an expert ${language} programmer. Analyze code errors and provide clear, actionable debugging assistance. Always respond with valid JSON.`;

  try {
    const response = await callProvider(userMessage, systemPrompt);
    return safeParseJSON(response);
  } catch (error) {
    console.error("[aiService] Error explaining error:", error.message);
    throw error;
  }
};

/**
 * Analyzes code for optimization opportunities
 */
const optimizeCode = async (code, language) => {
  const userMessage = `Analyze this ${language} code for optimization:

\`\`\`${language}
${code}
\`\`\`

Please provide:
1. **Current Time Complexity**: Analyze the time complexity (e.g., O(n), O(n²))
2. **Space Complexity**: Analyze the space complexity
3. **Performance Issues**: List any performance problems
4. **Optimization Strategy**: Explain how to optimize this code
5. **Optimized Code**: Provide an optimized version with comments explaining changes

Return only valid JSON, with no markdown fences or extra text, using exactly these keys: timeComplexity, spaceComplexity, performanceIssues (array of strings), optimizationStrategy, optimizedCode (string containing only the optimized source code).`;

  const systemPrompt = `You are an expert ${language} developer specializing in code optimization and algorithms. Provide detailed performance analysis and concrete optimization suggestions. Always respond with valid JSON.`;

  try {
    const response = await callProvider(userMessage, systemPrompt);
    return safeParseJSON(response);
  } catch (error) {
    console.error("[aiService] Error optimizing code:", error.message);
    throw error;
  }
};

/**
 * Reviews code for quality and security issues
 */
const reviewCode = async (code, language) => {
  const userMessage = `Review this ${language} code for quality, security, and best practices:

\`\`\`${language}
${code}
\`\`\`

Please analyze and provide:
1. **Bugs**: List any potential bugs or logical errors
2. **Security Issues**: Identify security vulnerabilities
3. **Code Quality**: Issues with readability, maintainability, style
4. **Best Practices**: Violations of best practices for ${language}
5. **Improvements**: Specific recommendations for improvement
6. **Overall Score**: Rate the code quality from 1-10

Format your response as JSON with keys: bugs (array), securityIssues (array), codeQuality (array), bestPractices (array), improvements (array), overallScore`;

  const systemPrompt = `You are an expert code reviewer specializing in ${language}. Provide thorough, constructive reviews that identify bugs, security issues, and quality improvements. Always respond with valid JSON.`;

  try {
    const response = await callProvider(userMessage, systemPrompt);
    return safeParseJSON(response);
  } catch (error) {
    console.error("[aiService] Error reviewing code:", error.message);
    throw error;
  }
};

/**
 * Explains selected code
 */
const explainCode = async (selectedCode, language) => {
  const userMessage = `Explain this ${language} code snippet to a beginner programmer:

\`\`\`${language}
${selectedCode}
\`\`\`

Please provide:
1. **Simple Explanation**: A simple, beginner-friendly explanation
2. **Logic Breakdown**: Break down how the code works step-by-step
3. **Purpose**: What this code does
4. **Example**: A practical example of how this code is used
5. **Key Concepts**: Important programming concepts used here

Format your response as JSON with keys: simpleExplanation, logicBreakdown, purpose, example, keyConcepts (as array)`;

  const systemPrompt = `You are an excellent programming teacher. Explain code in simple, clear terms that beginners can understand. Break down complex concepts into understandable parts. Always respond with valid JSON.`;

  try {
    const response = await callProvider(userMessage, systemPrompt);
    return safeParseJSON(response);
  } catch (error) {
    console.error("[aiService] Error explaining code:", error.message);
    throw error;
  }
};

module.exports = {
  isConfigured,
  safeParseJSON,
  explainError,
  optimizeCode,
  reviewCode,
  explainCode,
};
