import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Room } from '../../core/services/room.service';

interface FloorRow {
  floor: number;
  rooms: Room[];
}

@Component({
  selector: 'app-hotel-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hotel-grid.component.html',
  styleUrls: ['./hotel-grid.component.css'],
})
export class HotelGridComponent implements OnChanges {
  @Input() rooms: Room[] = [];

  // Sorted descending so the top floor renders at the top of the grid
  floorRows: FloorRow[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rooms']) {
      this.buildFloorRows();
    }
  }

  private buildFloorRows(): void {
    const floorMap = new Map<number, Room[]>();

    this.rooms.forEach(room => {
      if (!floorMap.has(room.floor)) floorMap.set(room.floor, []);
      floorMap.get(room.floor)!.push(room);
    });

    this.floorRows = Array.from(floorMap.entries())
      .sort(([a], [b]) => b - a)
      .map(([floor, rooms]) => ({
        floor,
        rooms: rooms.sort((a, b) => a.position - b.position),
      }));
  }

  getRoomClass(room: Room): string {
    if (room.isNewlyBooked) return 'room room-new';
    if (room.isBooked) return 'room room-booked';
    return 'room room-available';
  }

  getRoomTooltip(room: Room): string {
    if (room.isNewlyBooked) return `Room ${room.roomNumber} — Just Booked!`;
    if (room.isBooked) return `Room ${room.roomNumber} — Booked by ${room.bookedBy?.name ?? 'Guest'}`;
    return `Room ${room.roomNumber} — Available`;
  }
}
