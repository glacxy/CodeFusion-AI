const axios = require("axios");

const languageMap = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
};

const runCode = async (code, language, input) => {
  const language_id = languageMap[language];

  const response = await axios.post(
    "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
    {
      source_code: code,
      language_id,
      stdin: input,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
    }
  );

  return response.data;
};

module.exports = runCode;