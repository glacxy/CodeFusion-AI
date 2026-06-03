// Room Controller
// Add your room controller functions here

exports.createRoom = async (req, res) => {
  try {
    // Add create room logic here
    res.json({ message: 'Create room endpoint' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRooms = async (req, res) => {
  try {
    // Add get rooms logic here
    res.json({ message: 'Get rooms endpoint' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
