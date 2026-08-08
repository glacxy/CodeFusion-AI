/**
 * Handles HTTP communication with the Piston execution API.
 */

const axios = require("axios");

const PISTON_MODE = (process.env.PISTON_MODE || "public").toLowerCase();
const DOCKER_BASE = (process.env.PISTON_URL || "http://localhost:2000").replace(/\/$/, "");
const PUBLIC_BASE = (process.env.PISTON_PUBLIC_URL || "https://emkc.org").replace(/\/$/, "");
const TIMEOUT_MS = parseInt(process.env.PISTON_TIMEOUT || "15000", 10);

const BASE_URL = PISTON_MODE === "docker" ? DOCKER_BASE : PUBLIC_BASE;
const RUNTIMES_ENDPOINT = `${BASE_URL}/api/v2/runtimes`;
const EXECUTE_ENDPOINT = `${BASE_URL}/api/v2/execute`;

let runtimesCache = null;
let runtimesCachedAt = 0;
const CACHE_TTL_MS = 10 * 60 * 1000;

async function fetchRuntimes() {
  const now = Date.now();

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

async function resolveVersion(pistonLanguage, defaultVersion) {
  try {
    const runtimes = await fetchRuntimes();
    const matches = runtimes.filter(
      (runtime) => runtime.language.toLowerCase() === pistonLanguage.toLowerCase()
    );

    if (matches.length === 0) {
      console.warn(
        `[piston] runtime "${pistonLanguage}" not in live list — using fallback version "${defaultVersion}"`
      );
      return defaultVersion;
    }

    const best = matches[matches.length - 1];
    console.log(`[piston] resolved "${pistonLanguage}" → version "${best.version}"`);
    return best.version;
  } catch (error) {
    console.warn(
      `[piston] could not fetch runtimes (${error.message}) — using fallback "${defaultVersion}"`
    );
    return defaultVersion;
  }
}

async function getRuntimes() {
  return fetchRuntimes();
}

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
  const run = data.run || {};
  const compile = data.compile || {};

  return {
    stdout: run.stdout || "",
    stderr: run.stderr || "",
    compileOutput: compile.output || compile.stderr || "",
    exitCode: run.code ?? 0,
    runtime: elapsed,
    memory: 0,
    version,
  };
}

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
