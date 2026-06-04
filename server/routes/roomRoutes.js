const express = require("express");
const router = express.Router();

try {
  const roomController = require("../controllers/roomController");
  console.log("Room Controller loaded:", typeof roomController, Object.keys(roomController));
  
  if (typeof roomController.createRoom === "function") {
    router.post("/create", roomController.createRoom);
  }
  if (typeof roomController.getRooms === "function") {
    router.get("/", roomController.getRooms);
  }
} catch (err) {
  console.error("Error loading room controller:", err.message);
}

module.exports = router;
