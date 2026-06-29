const runCode = require("../services/pistonService");

const executeCode = async (req, res) => {
  try {
    const { language, code, input } = req.body;

    const result = await runCode(language, code, input);

    res.json(result);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Execution Failed",
    });
  }
};

module.exports = {
  executeCode,
};