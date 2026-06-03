const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

dotenv.config();

// Initialize server
const init = async () => {
  await connectDB();
};

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CodeFusion AI Backend Running");
});

const PORT = process.env.PORT || 5000;

init().then(() => {
  app.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT}`);
  });
}).catch((err) => {
  console.error("Failed to initialize server:", err);
  process.exit(1);
});