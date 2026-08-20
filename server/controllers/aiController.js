/**
 * aiController.js
 *
 * Handles AI-powered assistance endpoints:
 * - POST /api/ai/explain-error     → Explain execution errors
 * - POST /api/ai/optimize          → Optimize code
 * - POST /api/ai/review            → Review code quality
 * - POST /api/ai/explain           → Explain code snippet
 * - GET  /api/ai/status            → Check if AI is configured
 */

const aiService = require("../services/aiService");

/**
 * GET /api/ai/status
 * Check if AI features are available
 */
const getStatus = (req, res) => {
  return res.json({
    success: true,
    available: aiService.isConfigured(),
    message: aiService.isConfigured()
      ? "AI features are available"
      : "AI provider credentials are not configured. Set AI_API_KEY or GROQ_API_KEY.",
  });
};

/**
 * POST /api/ai/explain-error
 *
 * Request body:
 *   { code: string, errorMessage: string, language: string, stderr?: string,
 *     compileOutput?: string, exitCode?: number, status?: string }
 *
 * Response:
 *   { success: true, data: { cause, location, explanation, fix, correctedCode } }
 */
const explainError = async (req, res) => {
  const { code, errorMessage, language, stderr, compileOutput, exitCode, status } = req.body || {};

  // Validation
  if (!code || typeof code !== "string") {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      detail: "`code` is required and must be a string",
    });
  }

  if (!errorMessage || typeof errorMessage !== "string") {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      detail: "`errorMessage` is required and must be a string",
    });
  }

  if (!language || typeof language !== "string") {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      detail: "`language` is required and must be a string",
    });
  }

  if (!aiService.isConfigured()) {
    return res.status(503).json({
      success: false,
      error: "AI service not configured",
      detail: "AI provider credentials are not configured. Set AI_API_KEY or GROQ_API_KEY.",
    });
  }

  try {
    console.log("[aiController] explain-error request for", language);
    const result = await aiService.explainError(code, errorMessage, language, {
      stderr,
      compileOutput,
      exitCode,
      status,
    });
    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[aiController] explain-error failed:", error.message);
    const status = error.response?.status || 500;
    const errorMessage = error.message || "Failed to explain error";
    return res.status(status).json({
      success: false,
      error: "Failed to explain error",
      detail: errorMessage,
    });
  }
};

/**
 * POST /api/ai/optimize
 *
 * Request body:
 *   { code: string, language: string }
 *
 * Response:
 *   { success: true, data: { timeComplexity, spaceComplexity, performanceIssues, optimizationStrategy, optimizedCode } }
 */
const optimizeCode = async (req, res) => {
  const { code, language } = req.body || {};

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

  if (!aiService.isConfigured()) {
    return res.status(503).json({
      success: false,
      error: "AI service not configured",
      detail: "AI provider credentials are not configured. Set AI_API_KEY or GROQ_API_KEY.",
    });
  }

  try {
    console.log("[aiController] optimize request for", language);
    const result = await aiService.optimizeCode(code, language);
    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[aiController] optimize failed:", error.message);
    const status = error.response?.status || 500;
    const errorMessage = error.message || "Failed to optimize code";
    return res.status(status).json({
      success: false,
      error: "Failed to optimize code",
      detail: errorMessage,
    });
  }
};

/**
 * POST /api/ai/review
 *
 * Request body:
 *   { code: string, language: string }
 *
 * Response:
 *   { success: true, data: { bugs, securityIssues, codeQuality, bestPractices, improvements, overallScore } }
 */
const reviewCode = async (req, res) => {
  const { code, language } = req.body || {};

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

  if (!aiService.isConfigured()) {
    return res.status(503).json({
      success: false,
      error: "AI service not configured",
      detail: "AI provider credentials are not configured. Set AI_API_KEY or GROQ_API_KEY.",
    });
  }

  try {
    console.log("[aiController] review request for", language);
    const result = await aiService.reviewCode(code, language);
    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[aiController] review failed:", error.message);
    const status = error.response?.status || 500;
    const errorMessage = error.message || "Failed to review code";
    return res.status(status).json({
      success: false,
      error: "Failed to review code",
      detail: errorMessage,
    });
  }
};

/**
 * POST /api/ai/explain
 *
 * Request body:
 *   { code: string, language: string }
 *
 * Response:
 *   { success: true, data: { simpleExplanation, logicBreakdown, purpose, example, keyConepts } }
 */
const explainCode = async (req, res) => {
  const { code, language } = req.body || {};

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

  if (!aiService.isConfigured()) {
    return res.status(503).json({
      success: false,
      error: "AI service not configured",
      detail: "AI provider credentials are not configured. Set AI_API_KEY or GROQ_API_KEY.",
    });
  }

  try {
    console.log("[aiController] explain request for", language);
    const result = await aiService.explainCode(code, language);
    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[aiController] explain failed:", error.message);
    const status = error.response?.status || 500;
    const errorMessage = error.message || "Failed to explain code";
    return res.status(status).json({
      success: false,
      error: "Failed to explain code",
      detail: errorMessage,
    });
  }
};

module.exports = {
  getStatus,
  explainError,
  optimizeCode,
  reviewCode,
  explainCode,
};
