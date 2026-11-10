const Room = require("../models/Room");
const mongoose = require("mongoose");

const createRoom = async (req, res) => {
  try {
    const { roomName } = req.body;

    if (!roomName) {
      return res.status(400).json({
        message: "Room name is required",
      });
    }

    const room = await Room.create({
      roomName,
      host: req.user.id,
      participants: [req.user.id],
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ host: req.user._id }).populate("host", "username email");

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRoom = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.roomId)) {
      return res.status(404).json({ message: "Room not found" });
    }

    const room = await Room.findOne({
      _id: req.params.roomId,
      host: req.user._id,
    }).populate("host", "username email");

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRoom,
  getRooms,
  getRoom,
};
