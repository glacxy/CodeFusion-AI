/**
 * aiService.js
 *
 * AI-powered assistance for programmers using Claude API.
 * Features:
 * - Error explanation and debugging suggestions
 * - Code optimization analysis
 * - Code review and quality analysis
 * - Code explanation and breakdown
 */

const axios = require("axios");

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-3-5-sonnet-20241022";
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

if (!CLAUDE_API_KEY) {
  console.warn("[aiService] WARNING: CLAUDE_API_KEY is not set in environment variables");
}

/**
 * Validates if API key is configured
 */
const isConfigured = () => !!CLAUDE_API_KEY;

/**
 * Makes a request to Claude API
 */
const callClaude = async (userMessage, systemPrompt = "") => {
  if (!CLAUDE_API_KEY) {
    throw new Error("Claude API key not configured. Set CLAUDE_API_KEY environment variable.");
  }

  try {
    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: CLAUDE_MODEL,
        max_tokens: 2048,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userMessage,
          },
        ],
      },
      {
        headers: {
          "x-api-key": CLAUDE_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
      }
    );

    if (response.data?.content?.[0]?.text) {
      return response.data.content[0].text;
    }

    throw new Error("Invalid response format from Claude API");
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("Invalid Claude API key");
    }
    if (error.response?.status === 429) {
      throw new Error("Claude API rate limit exceeded. Please try again later.");
    }
    throw error;
  }
};

/**
 * Explains an error and suggests fixes
 */
const explainError = async (code, errorMessage, language) => {
  const userMessage = `I got an error in my ${language} code:

Error: ${errorMessage}

Code:
\`\`\`${language}
${code}
\`\`\`

Please analyze this error and provide:
1. **Cause**: What caused the error
2. **Location**: Which line(s) are problematic
3. **Explanation**: Why it's happening
4. **Fix**: Step-by-step fix instructions
5. **Corrected Code**: The fixed code snippet

Format your response as JSON with these exact keys: cause, location, explanation, fix, correctedCode`;

  const systemPrompt = `You are an expert ${language} programmer. Analyze code errors and provide clear, actionable debugging assistance. Always respond with valid JSON.`;

  try {
    const response = await callClaude(userMessage, systemPrompt);
    // Try to parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Could not parse Claude response as JSON");
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

Format your response as JSON with keys: timeComplexity, spaceComplexity, performanceIssues (array), optimizationStrategy, optimizedCode`;

  const systemPrompt = `You are an expert ${language} developer specializing in code optimization and algorithms. Provide detailed performance analysis and concrete optimization suggestions. Always respond with valid JSON.`;

  try {
    const response = await callClaude(userMessage, systemPrompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Could not parse Claude response as JSON");
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
    const response = await callClaude(userMessage, systemPrompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Could not parse Claude response as JSON");
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

Format your response as JSON with keys: simpleExplanation, logicBreakdown, purpose, example, keyConepts (as array)`;

  const systemPrompt = `You are an excellent programming teacher. Explain code in simple, clear terms that beginners can understand. Break down complex concepts into understandable parts. Always respond with valid JSON.`;

  try {
    const response = await callClaude(userMessage, systemPrompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Could not parse Claude response as JSON");
  } catch (error) {
    console.error("[aiService] Error explaining code:", error.message);
    throw error;
  }
};

module.exports = {
  isConfigured,
  explainError,
  optimizeCode,
  reviewCode,
  explainCode,
};
