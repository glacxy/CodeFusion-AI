const express = require("express");
const router = express.Router();

const {
  createRoom,
  getRooms,
} = require("../controllers/roomController");
const { protect } = require("../middleware/authMiddleware");

router.post("/create", protect, createRoom);
router.get("/", protect, getRooms);

module.exports = router;
