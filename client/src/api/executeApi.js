/**
 * executeApi.js
 *
 * Client-side API wrapper for the code execution endpoint.
 * Calls the Express server which proxies to Piston.
 */

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 20000, // 20s — generous client timeout, server has its own 15s Piston timeout
});

/**
 * Execute code via POST /api/execute.
 *
 * @param {string} language  Frontend language key: "javascript", "python", "cpp", "c", "java", "typescript"
 * @param {string} code      Source code to run
 * @param {string} [stdin]   Optional stdin input
 *
 * @returns {Promise<{
 *   success: boolean,
 *   language: string,
 *   displayName: string,
 *   version: string,
 *   stdout: string,
 *   stderr: string,
 *   compileOutput: string,
 *   exitCode: number,
 *   runtime: number,
 *   memory: number,
 *   status: string,
 * }>}
 */
export const executeCode = async (language, code, stdin = "") => {
  const response = await API.post("/execute", { language, code, stdin });
  return response.data;
};

/**
 * Fetch all runtimes available on the configured Piston instance.
 * Useful for debugging or displaying a language picker.
 *
 * @returns {Promise<Array<{language: string, version: string}>>}
 */
export const fetchRuntimes = async () => {
  const response = await API.get("/execute/runtimes");
  return response.data;
};
