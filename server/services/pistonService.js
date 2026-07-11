/**
 * pistonService.js
 *
 * Handles all HTTP communication with the Piston execution API.
 *
 * Supports two modes, controlled by the PISTON_MODE environment variable:
 *   "docker"  → Local Piston container at PISTON_URL  (default: http://localhost:2000)
 *   "public"  → Free public Piston API at PISTON_PUBLIC_URL (https://emkc.org)
 *
 * Runtime version resolution strategy:
 *   1. On first call, fetch /api/v2/runtimes and cache it in memory.
 *   2. For each execution request, look up the best available version for the
 *      requested runtime from the live cache.
 *   3. Only fall back to the hardcoded defaultVersion from languageMap if the
 *      runtime list cannot be fetched (e.g. Piston offline in docker mode).
 *
 * This ensures we never blindly hardcode versions — we always prefer what
 * Piston actually has installed.
 */

const axios = require("axios");

// ─── Config ──────────────────────────────────────────────────────────────────

const PISTON_MODE = (process.env.PISTON_MODE || "public").toLowerCase();
const DOCKER_BASE = (process.env.PISTON_URL || "http://localhost:2000").replace(/\/$/, "");
const PUBLIC_BASE = (process.env.PISTON_PUBLIC_URL || "https://emkc.org").replace(/\/$/, "");
const TIMEOUT_MS = parseInt(process.env.PISTON_TIMEOUT || "15000", 10);

const BASE_URL = PISTON_MODE === "docker" ? DOCKER_BASE : PUBLIC_BASE;
const RUNTIMES_ENDPOINT = `${BASE_URL}/api/v2/runtimes`;
const EXECUTE_ENDPOINT = `${BASE_URL}/api/v2/execute`;

// ─── Runtime Cache ───────────────────────────────────────────────────────────

/** @type {Array<{language: string, version: string, aliases: string[]}> | null} */
let runtimesCache = null;
let runtimesCachedAt = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Fetches and caches the list of installed Piston runtimes.
 * @returns {Promise<Array<{language: string, version: string, aliases: string[]}>>}
 */
async function fetchRuntimes() {
  const now = Date.now();

  // Return cache if still fresh
  if (runtimesCache && now - runtimesCachedAt < CACHE_TTL_MS) {
    return runtimesCache;
  }

  console.log(`[piston] fetching runtimes from ${RUNTIMES_ENDPOINT} (mode: ${PISTON_MODE})`);

  const response = await axios.get(RUNTIMES_ENDPOINT, {
    timeout: TIMEOUT_MS,
    headers: { "Content-Type": "application/json" },
  });

  runtimesCache = response.data;
  runtimesCachedAt = now;

  console.log(`[piston] cached ${runtimesCache.length} runtimes`);
  return runtimesCache;
}

/**
 * Resolves the best available version for a Piston language name.
 * Tries:
 *   1. Live runtimes cache (preferred)
 *   2. Provided defaultVersion fallback
 *
 * @param {string} pistonLanguage  e.g. "python", "c++", "javascript"
 * @param {string} defaultVersion  fallback version string
 * @returns {Promise<string>}  resolved version
 */
async function resolveVersion(pistonLanguage, defaultVersion) {
  try {
    const runtimes = await fetchRuntimes();

    // Find all entries matching the language name (case-insensitive)
    const matches = runtimes.filter(
      (rt) => rt.language.toLowerCase() === pistonLanguage.toLowerCase()
    );

    if (matches.length === 0) {
      console.warn(
        `[piston] runtime "${pistonLanguage}" not in live list — using fallback version "${defaultVersion}"`
      );
      return defaultVersion;
    }

    // Pick the latest version (Piston returns them in install order; last = newest)
    const best = matches[matches.length - 1];
    console.log(`[piston] resolved "${pistonLanguage}" → version "${best.version}"`);
    return best.version;
  } catch (err) {
    console.warn(`[piston] could not fetch runtimes (${err.message}) — using fallback "${defaultVersion}"`);
    return defaultVersion;
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Returns all installed Piston runtimes.
 * @returns {Promise<Array>}
 */
async function getRuntimes() {
  return fetchRuntimes();
}

/**
 * Executes code against Piston.
 *
 * @param {object} params
 * @param {string} params.pistonLanguage  Piston runtime name (e.g. "c++")
 * @param {string} params.fileExtension   Source file extension (e.g. "cpp")
 * @param {string} params.defaultVersion  Fallback version if live lookup fails
 * @param {string} params.code            Source code to execute
 * @param {string} [params.stdin]         Optional stdin input
 *
 * @returns {Promise<{
 *   stdout: string,
 *   stderr: string,
 *   compileOutput: string,
 *   exitCode: number,
 *   runtime: number,
 *   memory: number,
 *   version: string,
 * }>}
 */
async function executeCode({ pistonLanguage, fileExtension, defaultVersion, code, stdin }) {
  const version = await resolveVersion(pistonLanguage, defaultVersion);

  const payload = {
    language: pistonLanguage,
    version,
    files: [{ name: `main.${fileExtension}`, content: code }],
    stdin: stdin || "",
    args: [],
    compile_timeout: 10000,
    run_timeout: 3000,
    compile_memory_limit: -1,
    run_memory_limit: -1,
  };

  console.log(`[piston] POST ${EXECUTE_ENDPOINT} — lang="${pistonLanguage}" ver="${version}"`);

  const startTime = Date.now();

  const response = await axios.post(EXECUTE_ENDPOINT, payload, {
    timeout: TIMEOUT_MS,
    headers: { "Content-Type": "application/json" },
  });

  const elapsed = Date.now() - startTime;
  const data = response.data;

  // Piston response shape:
  // { language, version, run: { stdout, stderr, code, signal, output },
  //   compile?: { stdout, stderr, code, signal, output } }

  const run = data.run || {};
  const compile = data.compile || {};

  return {
    stdout: run.stdout || "",
    stderr: run.stderr || "",
    compileOutput: compile.output || compile.stderr || "",
    exitCode: run.code ?? 0,
    runtime: elapsed,
    memory: 0, // Piston public API does not expose memory usage
    version,
  };
}

/**
 * Invalidates the runtime cache. Call this if you need fresh data immediately.
 */
function invalidateRuntimeCache() {
  runtimesCache = null;
  runtimesCachedAt = 0;
  console.log("[piston] runtime cache invalidated");
}

module.exports = {
  getRuntimes,
  executeCode,
  invalidateRuntimeCache,
  PISTON_MODE,
  BASE_URL,
};
