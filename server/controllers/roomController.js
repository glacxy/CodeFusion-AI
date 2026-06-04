const Room = require("../models/Room");

exports.createRoom = async (req, res) => {
  try {
    const { name, description, host } = req.body;

    const room = await Room.create({
      name,
      description,
      host,
    });

    res.status(201).json({
      message: "Room created successfully",
      room,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate("host", "username email");

    res.status(200).json({
      message: "Rooms retrieved successfully",
      rooms,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
