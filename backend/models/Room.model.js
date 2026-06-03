const mongoose = require('mongoose');

/*
 * Hotel layout:
 *   Floors 1–9  → 10 rooms each (101–110, 201–210, ... 901–910)
 *   Floor 10    → 7 rooms (1001–1007)
 *   Total: 97 rooms
 *
 * position: 1 = nearest to the lift/stairs on that floor
 */
const roomSchema = new mongoose.Schema({
  roomNumber:    { type: Number, required: true, unique: true },
  floor:         { type: Number, required: true, min: 1, max: 10 },
  position:      { type: Number, required: true, min: 1, max: 10 },
  isBooked:      { type: Boolean, default: false },
  bookedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  bookedAt:      { type: Date, default: null },
  isNewlyBooked: { type: Boolean, default: false },
}, { timestamps: true });

const Room = mongoose.model('Room', roomSchema);

// Populates the rooms collection on first startup; skips if data already exists
const seedRooms = async () => {
  const count = await Room.countDocuments();
  if (count > 0) {
    console.log(`${count} rooms already in database.`);
    return;
  }

  const rooms = [];

  for (let floor = 1; floor <= 9; floor++) {
    for (let pos = 1; pos <= 10; pos++) {
      rooms.push({ roomNumber: floor * 100 + pos, floor, position: pos });
    }
  }

  for (let pos = 1; pos <= 7; pos++) {
    rooms.push({ roomNumber: 1000 + pos, floor: 10, position: pos });
  }

  await Room.insertMany(rooms);
  console.log(`Seeded ${rooms.length} rooms.`);
};

module.exports = Room;
module.exports.seedRooms = seedRooms;
