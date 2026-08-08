/**
 * executeRoutes.js
 *
 * Mounts execution endpoints under /api/execute (registered in server.js).
 *
 * GET  /api/execute/runtimes  → list all available Piston runtimes
 * POST /api/execute           → execute code
 */

const express = require("express");

const router = express.Router();
const { executeCode, getRuntimes } = require("../controllers/executeController");

// GET /api/execute/runtimes
router.get("/runtimes", getRuntimes);

// POST /api/execute
router.post("/", executeCode);

module.exports = router;
