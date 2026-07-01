const runCode = require("../services/pistonService");

const executeCode = async (req, res) => {
  console.log("[codeController] Incoming /api/code/run request:", {
    body: req.body,
  });

  try {
    const { language, code, input } = req.body;
    const result = await runCode(language, code, input);

    console.log("[codeController] Piston service returned:", result);

    // If pistonService returned a structured error (non-retryable HTTP status), forward it
    if (result && result.success === false && result.status) {
      return res.status(result.status).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error("[codeController] Execution error:", {
      message: err.message,
      stack: err.stack,
      response: err.response?.data,
    });

    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      "Execution Failed";

    return res.status(err.response?.status || 500).json({
      success: false,
      message,
      details: err.response?.data,
    });
  }
};

module.exports = {
  executeCode,
};