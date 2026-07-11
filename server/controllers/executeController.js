/**
 * executeController.js
 *
 * Handles POST /api/execute and GET /api/execute/runtimes.
 *
 * Responsibilities:
 *   - Validate incoming request fields
 *   - Map frontend language key → Piston config via languageMap
 *   - Call pistonService and normalise the response
 *   - Return structured JSON for both success and all error cases
 *   - Never leak internal stack traces to the client
 */

const pistonService = require("../services/pistonService");
const { getLanguageConfig, getSupportedLanguages } = require("../utils/languageMap");

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Classifies an execution result into a human-readable status string.
 * @param {object} result  Result object from pistonService.executeCode
 * @returns {string}
 */
function resolveStatus(result) {
  if (result.compileOutput && result.exitCode !== 0) return "Compilation Error";
  if (result.exitCode !== 0) return "Runtime Error";
  if (result.stderr && !result.stdout) return "Runtime Error";
  return "Accepted";
}

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * GET /api/execute/runtimes
 * Returns the raw list of runtimes installed in Piston.
 */
const getRuntimes = async (req, res) => {
  try {
    const runtimes = await pistonService.getRuntimes();
    return res.json({
      success: true,
      mode: pistonService.PISTON_MODE,
      baseUrl: pistonService.BASE_URL,
      count: runtimes.length,
      runtimes,
    });
  } catch (err) {
    console.error("[executeController] getRuntimes failed:", err.message);

    if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
      return res.status(503).json({
        success: false,
        error: "Piston is unavailable",
        detail: `Could not connect to Piston at ${pistonService.BASE_URL}. ` +
          (pistonService.PISTON_MODE === "docker"
            ? "Is the Docker container running? Try: docker compose up -d"
            : "Is your internet connection working?"),
      });
    }

    return res.status(500).json({
      success: false,
      error: "Failed to fetch runtimes",
      detail: err.message,
    });
  }
};

/**
 * POST /api/execute
 *
 * Request body:
 *   { language: string, code: string, stdin?: string }
 *
 * Response (success):
 *   { success, language, version, stdout, stderr, compileOutput,
 *     exitCode, runtime, memory, status }
 *
 * Response (error):
 *   { success: false, error: string, detail?: string }
 */
const executeCode = async (req, res) => {
  const { language, code, stdin } = req.body || {};

  // ── Validation ────────────────────────────────────────────────────────────

  if (!language || typeof language !== "string") {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      detail: "`language` is required and must be a string",
    });
  }

  if (!code || typeof code !== "string") {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      detail: "`code` is required and must be a string",
    });
  }

  if (code.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      detail: "`code` must not be empty",
    });
  }

  if (stdin !== undefined && typeof stdin !== "string") {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      detail: "`stdin` must be a string if provided",
    });
  }

  // ── Language mapping ──────────────────────────────────────────────────────

  const langConfig = getLanguageConfig(language);

  if (!langConfig) {
    return res.status(400).json({
      success: false,
      error: `Unsupported language: "${language}"`,
      detail: `Supported languages: ${getSupportedLanguages().join(", ")}`,
    });
  }

  // ── Execute ───────────────────────────────────────────────────────────────

  console.log(`[executeController] execute request — language="${language}" codeLen=${code.length}`);

  try {
    const result = await pistonService.executeCode({
      pistonLanguage: langConfig.pistonLanguage,
      fileExtension: langConfig.fileExtension,
      defaultVersion: langConfig.defaultVersion,
      code,
      stdin: stdin || "",
    });

    const status = resolveStatus(result);

    console.log(
      `[executeController] execute done — status="${status}" exitCode=${result.exitCode} runtime=${result.runtime}ms`
    );

    return res.json({
      success: true,
      language,
      displayName: langConfig.displayName,
      version: result.version,
      stdout: result.stdout,
      stderr: result.stderr,
      compileOutput: result.compileOutput,
      exitCode: result.exitCode,
      runtime: result.runtime,
      memory: result.memory,
      status,
    });
  } catch (err) {
    console.error("[executeController] execute failed:", err.message);

    // ── Axios / network errors ────────────────────────────────────────────
    if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
      return res.status(503).json({
        success: false,
        error: "Piston is unavailable",
        detail: `Could not connect to Piston at ${pistonService.BASE_URL}. ` +
          (pistonService.PISTON_MODE === "docker"
            ? "Is the Docker container running? Try: docker compose up -d"
            : "Is your internet connection working?"),
      });
    }

    if (err.code === "ECONNABORTED" || err.message?.toLowerCase().includes("timeout")) {
      return res.status(504).json({
        success: false,
        error: "Execution timed out",
        detail: `Piston did not respond within ${process.env.PISTON_TIMEOUT || 15000}ms`,
      });
    }

    // ── Piston HTTP errors (4xx / 5xx from Piston itself) ─────────────────
    if (err.response) {
      const pistonStatus = err.response.status;
      const pistonMessage =
        err.response.data?.message || err.response.data || "Unknown Piston error";

      return res.status(pistonStatus >= 500 ? 502 : 400).json({
        success: false,
        error: "Piston returned an error",
        detail: String(pistonMessage),
      });
    }

    // ── Unexpected errors ─────────────────────────────────────────────────
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      detail: "An unexpected error occurred during code execution",
    });
  }
};

module.exports = { executeCode, getRuntimes };
