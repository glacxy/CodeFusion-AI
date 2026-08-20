require("dotenv").config();

const {
  isConfigured,
  explainCode,
  optimizeCode,
  reviewCode,
  explainError,
} = require("./services/aiService");

async function testAI() {
  console.log("\n=================================");
  console.log("       CodeFusion AI Test");
  console.log("=================================\n");

  console.log("Provider:", process.env.AI_PROVIDER);
  console.log("Model:", process.env.AI_MODEL);
  console.log("API configured:", isConfigured());

  if (!isConfigured()) {
    console.error("\n❌ AI API key is NOT configured.");
    console.error("Check your server/.env file.\n");
    process.exit(1);
  }

  try {
    console.log("\n🧪 TEST 1: Explain Code");
    console.log("---------------------------------");

    const explainResult = await explainCode(
      `for (let i = 0; i < 5; i++) {
  console.log(i);
}`,
      "javascript"
    );

    console.log(JSON.stringify(explainResult, null, 2));

    console.log("\n✅ Explain Code PASSED");


    console.log("\n🧪 TEST 2: Optimize Code");
    console.log("---------------------------------");

    const optimizeResult = await optimizeCode(
      `function findDuplicate(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) {
        return arr[i];
      }
    }
  }
  return -1;
}`,
      "javascript"
    );

    console.log(JSON.stringify(optimizeResult, null, 2));

    console.log("\n✅ Optimize Code PASSED");


    console.log("\n🧪 TEST 3: Code Review");
    console.log("---------------------------------");

    const reviewResult = await reviewCode(
      `function login(username, password) {
  const query =
    "SELECT * FROM users WHERE username = '" +
    username +
    "' AND password = '" +
    password +
    "'";

  return database.query(query);
}`,
      "javascript"
    );

    console.log(JSON.stringify(reviewResult, null, 2));

    console.log("\n✅ Code Review PASSED");


    console.log("\n🧪 TEST 4: Explain Error");
    console.log("---------------------------------");

    const errorResult = await explainError(
      `function add(a, b) {
  return a + b;
}

console.log(add(10));`,
      "Cannot read properties of undefined",
      "javascript",
      {
        status: "runtime_error",
        exitCode: 1,
        stderr: "TypeError: Cannot read properties of undefined",
      }
    );

    console.log(JSON.stringify(errorResult, null, 2));

    console.log("\n✅ Explain Error PASSED");


    console.log("\n=================================");
    console.log("🎉 ALL AI TESTS COMPLETED");
    console.log("=================================\n");

  } catch (error) {
    console.error("\n=================================");
    console.error("❌ AI TEST FAILED");
    console.error("=================================\n");

    console.error("Error:", error.message);
    process.exit(1);
  }
}

testAI();