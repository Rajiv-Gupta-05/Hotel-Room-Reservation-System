/*
 * Room allocation algorithm
 *
 * Rules (from the assignment spec):
 *  1. Book rooms on the same floor if possible — prefer the tightest cluster.
 *  2. If no single floor has enough rooms, pick the N available rooms across
 *     all floors that minimize total travel time (first room → last room).
 *
 * Travel time:
 *  - Horizontal: 1 min per room between adjacent positions
 *  - Vertical:   2 min per floor
 */

const getTravelTimeBetween = (a, b) =>
  Math.abs(a.position - b.position) + Math.abs(a.floor - b.floor) * 2;

const getTotalTravelTime = (rooms) => {
  if (rooms.length <= 1) return 0;
  const sorted = [...rooms].sort((a, b) =>
    a.floor !== b.floor ? a.floor - b.floor : a.position - b.position
  );
  return getTravelTimeBetween(sorted[0], sorted[sorted.length - 1]);
};

const findOptimalRooms = (availableRooms, count) => {
  if (availableRooms.length < count) return null;

  const sorted = [...availableRooms].sort((a, b) =>
    a.floor !== b.floor ? a.floor - b.floor : a.position - b.position
  );

  // Group by floor for the same-floor pass
  const byFloor = {};
  sorted.forEach(room => {
    if (!byFloor[room.floor]) byFloor[room.floor] = [];
    byFloor[room.floor].push(room);
  });

  let bestSameFloor = null;
  let bestSameFloorTime = Infinity;

  Object.values(byFloor).forEach(floorRooms => {
    if (floorRooms.length < count) return;

    // Slide a window of size `count` to find the tightest cluster on this floor
    for (let i = 0; i <= floorRooms.length - count; i++) {
      const window = floorRooms.slice(i, i + count);
      const time = getTotalTravelTime(window);
      if (time < bestSameFloorTime) {
        bestSameFloorTime = time;
        bestSameFloor = window;
      }
    }
  });

  if (bestSameFloor) {
    return { rooms: bestSameFloor, travelTime: bestSameFloorTime, isSameFloor: true };
  }

  // No single floor can satisfy the request — slide across all sorted rooms
  let bestCrossFloor = null;
  let bestCrossFloorTime = Infinity;

  for (let i = 0; i <= sorted.length - count; i++) {
    const window = sorted.slice(i, i + count);
    const time = getTotalTravelTime(window);
    if (time < bestCrossFloorTime) {
      bestCrossFloorTime = time;
      bestCrossFloor = window;
    }
  }

  return { rooms: bestCrossFloor, travelTime: bestCrossFloorTime, isSameFloor: false };
};

module.exports = { findOptimalRooms, getTotalTravelTime, getTravelTimeBetween };
