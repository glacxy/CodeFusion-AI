const axios = require("axios");

const LANGUAGE_MAP = {
  javascript: { engine: "javascript", version: "18.15.0", fileName: "main.js" },
  python: { engine: "python", version: "3.10.0", fileName: "main.py" },
  java: { engine: "java", version: "15.0.2", fileName: "Main.java" },
  cpp: { engine: "cpp", version: "10.2.0", fileName: "main.cpp" },
  c: { engine: "c", version: "10.2.0", fileName: "main.c" },
};

const getLanguageConfig = (language) => {
  const normalized = String(language || "").trim().toLowerCase();
  return LANGUAGE_MAP[normalized] || LANGUAGE_MAP.javascript;
};

const runCode = async (language, code, input = "") => {
  const config = getLanguageConfig(language);

  const requestBody = {
    language: config.engine,
    version: config.version,
    files: [{ name: config.fileName, content: code || "" }],
    stdin: input || "",
  };

  console.log("[pistonService] Executing code with request body:", requestBody);

  try {
    const response = await axios.post("https://emkc.org/api/v2/piston/execute", requestBody, {
      headers: { "Content-Type": "application/json" },
      timeout: 20000,
    });

    console.log("[pistonService] Piston response:", response.data);
    return response.data;
  } catch (error) {
    const status = error.response?.status;
    const data = error.response?.data;

    console.error("[pistonService] Piston error:", {
      message: error.message,
      status,
      data,
    });

    // If the error is from the public Piston API being unavailable/forbidden/not found,
    // return a structured object instead of throwing so controller can forward a clear message.
    if (status === 401 || status === 403 || status === 404) {
      return {
        success: false,
        status,
        message: data?.message || data?.error || `Piston API error: ${status}`,
        details: data,
      };
    }

    // For other errors keep throwing so callers can handle them as exceptions.
    throw error;
  }
};

module.exports = runCode;
