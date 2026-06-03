const Room = require('../models/Room.model');
const { findOptimalRooms } = require('../utils/roomAlgorithm');

const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .sort({ floor: 1, position: 1 })
      .populate('bookedBy', 'name email');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bookRooms = async (req, res) => {
  try {
    const count = parseInt(req.body.count, 10);

    if (!count || count < 1 || count > 5) {
      return res.status(400).json({ message: 'You can book between 1 and 5 rooms at a time' });
    }

    const availableRooms = await Room.find({ isBooked: false }).sort({ floor: 1, position: 1 });

    if (availableRooms.length < count) {
      return res.status(400).json({
        message: `Only ${availableRooms.length} room(s) available. Cannot book ${count}.`,
      });
    }

    const result = findOptimalRooms(availableRooms, count);
    if (!result) {
      return res.status(400).json({ message: 'Unable to find suitable rooms.' });
    }

    const selectedIds = result.rooms.map(r => r._id);

    // Clear previous amber highlights before setting new ones
    await Room.updateMany({ isNewlyBooked: true }, { isNewlyBooked: false });

    await Room.updateMany(
      { _id: { $in: selectedIds } },
      { $set: { isBooked: true, bookedBy: req.user._id, bookedAt: new Date(), isNewlyBooked: true } }
    );

    const bookedRooms = await Room.find({ _id: { $in: selectedIds } })
      .sort({ floor: 1, position: 1 })
      .populate('bookedBy', 'name email');

    res.json({
      message: `Successfully booked ${count} room(s)`,
      bookedRooms,
      travelTime: result.travelTime,
      isSameFloor: result.isSameFloor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const randomOccupancy = async (req, res) => {
  try {
    await Room.updateMany({}, { $set: { isBooked: false, bookedBy: null, bookedAt: null, isNewlyBooked: false } });

    const allRooms = await Room.find();
    const shuffled = allRooms.sort(() => Math.random() - 0.5);
    const rate = Math.random() * 0.4 + 0.3; // random 30–70% occupancy
    const toBook = shuffled.slice(0, Math.floor(allRooms.length * rate));

    await Room.updateMany(
      { _id: { $in: toBook.map(r => r._id) } },
      { $set: { isBooked: true, bookedAt: new Date() } }
    );

    const rooms = await Room.find().sort({ floor: 1, position: 1 });

    res.json({
      message: `${toBook.length} of ${allRooms.length} rooms randomly occupied`,
      rooms,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetAllRooms = async (req, res) => {
  try {
    await Room.updateMany({}, {
      $set: { isBooked: false, bookedBy: null, bookedAt: null, isNewlyBooked: false },
    });
    const rooms = await Room.find().sort({ floor: 1, position: 1 });
    res.json({ message: 'All bookings cleared', rooms });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllRooms, bookRooms, randomOccupancy, resetAllRooms };
