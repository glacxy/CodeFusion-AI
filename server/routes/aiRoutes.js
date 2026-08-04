/**
 * aiRoutes.js
 *
 * Mounts AI assistance endpoints under /api/ai.
 *
 * GET  /api/ai/status         → Check if AI is configured
 * POST /api/ai/explain-error  → Explain execution errors
 * POST /api/ai/optimize       → Optimize code
 * POST /api/ai/review         → Review code quality
 * POST /api/ai/explain        → Explain code snippet
 */

const express = require("express");
const router = express.Router();
const {
  getStatus,
  explainError,
  optimizeCode,
  reviewCode,
  explainCode,
} = require("../controllers/aiController");

// GET /api/ai/status
router.get("/status", getStatus);

// POST /api/ai/explain-error
router.post("/explain-error", explainError);

// POST /api/ai/optimize
router.post("/optimize", optimizeCode);

// POST /api/ai/review
router.post("/review", reviewCode);

// POST /api/ai/explain
router.post("/explain", explainCode);

module.exports = router;
