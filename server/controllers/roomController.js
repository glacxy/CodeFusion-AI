const Room = require("../models/Room");

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
    const rooms = await Room.find().populate("host", "username email");

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRoom,
  getRooms,
};
