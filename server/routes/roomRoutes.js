const express = require("express");
const router = express.Router();

const {
  createRoom,
  getRooms,
  getRoom,
} = require("../controllers/roomController");
const { protect } = require("../middleware/authMiddleware");

router.post("/create", protect, createRoom);
router.get("/", protect, getRooms);
router.get("/:roomId", protect, getRoom);

module.exports = router;
