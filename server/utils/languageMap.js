/**
 * languageMap.js
 *
 * Central registry mapping frontend language identifiers → Piston runtime config.
 *
 * Structure per entry:
 *   pistonLanguage : the runtime name Piston uses (matches GET /api/v2/runtimes)
 *   fileExtension  : the source file extension Piston expects
 *   displayName    : human-readable name for logs / error messages
 *   defaultVersion : fallback version string used ONLY when Piston runtime lookup
 *                    fails. At runtime we always prefer the version returned by
 *                    GET /api/v2/runtimes so we never blindly hardcode versions.
 *
 * To add a new language: add a new key/value pair below. Nothing else changes.
 */

const LANGUAGE_MAP = {
  // ── JavaScript ─────────────────────────────────────────────────────────────
  javascript: {
    pistonLanguage: "javascript",
    fileExtension: "js",
    displayName: "JavaScript",
    defaultVersion: "18.15.0",
  },

  // ── TypeScript ─────────────────────────────────────────────────────────────
  typescript: {
    pistonLanguage: "typescript",
    fileExtension: "ts",
    displayName: "TypeScript",
    defaultVersion: "5.0.3",
  },

  // ── Python ─────────────────────────────────────────────────────────────────
  python: {
    pistonLanguage: "python",
    fileExtension: "py",
    displayName: "Python",
    defaultVersion: "3.10.0",
  },

  // ── Java ───────────────────────────────────────────────────────────────────
  java: {
    pistonLanguage: "java",
    fileExtension: "java",
    displayName: "Java",
    defaultVersion: "15.0.2",
  },

  // ── C++ ────────────────────────────────────────────────────────────────────
  cpp: {
    pistonLanguage: "c++",
    fileExtension: "cpp",
    displayName: "C++",
    defaultVersion: "10.2.0",
  },

  // ── C ──────────────────────────────────────────────────────────────────────
  c: {
    pistonLanguage: "c",
    fileExtension: "c",
    displayName: "C",
    defaultVersion: "10.2.0",
  },
};

/**
 * Returns the Piston config for a given frontend language key.
 * @param {string} languageKey  e.g. "cpp", "python"
 * @returns {{ pistonLanguage, fileExtension, displayName, defaultVersion } | null}
 */
function getLanguageConfig(languageKey) {
  if (!languageKey || typeof languageKey !== "string") return null;
  return LANGUAGE_MAP[languageKey.toLowerCase()] ?? null;
}

/**
 * Returns all supported frontend language keys.
 * @returns {string[]}
 */
function getSupportedLanguages() {
  return Object.keys(LANGUAGE_MAP);
}

module.exports = { LANGUAGE_MAP, getLanguageConfig, getSupportedLanguages };
