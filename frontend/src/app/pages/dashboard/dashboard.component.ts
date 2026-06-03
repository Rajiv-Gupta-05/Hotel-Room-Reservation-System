import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { RoomService, Room } from '../../core/services/room.service';
import { HotelGridComponent } from '../../components/hotel-grid/hotel-grid.component';
import { BookingPanelComponent } from '../../components/booking-panel/booking-panel.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HotelGridComponent, BookingPanelComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  rooms: Room[] = [];
  isLoadingRooms = true;
  loadError = '';

  lastBookingResult: {
    travelTime: number;
    isSameFloor: boolean;
    roomNumbers: number[];
  } | null = null;

  private roomsSub?: Subscription;

  constructor(
    public authService: AuthService,
    private roomService: RoomService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.roomsSub = this.roomService.rooms$.subscribe(rooms => {
      this.rooms = rooms;
      this.isLoadingRooms = false;
    });

    this.roomService.loadRooms().subscribe({
      error: err => {
        this.loadError = err.error?.message || 'Failed to load rooms. Please refresh.';
        this.isLoadingRooms = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.roomsSub?.unsubscribe();
  }

  get totalRooms(): number { return this.rooms.length; }
  get availableRooms(): number { return this.rooms.filter(r => !r.isBooked).length; }
  get bookedRooms(): number { return this.rooms.filter(r => r.isBooked).length; }
  get occupancyPercent(): number {
    return this.totalRooms ? Math.round((this.bookedRooms / this.totalRooms) * 100) : 0;
  }

  onBookingComplete(result: { travelTime: number; isSameFloor: boolean; roomNumbers: number[] }): void {
    this.lastBookingResult = result;
    setTimeout(() => { this.lastBookingResult = null; }, 8000);
  }

  onOccupancyChanged(): void {
    this.lastBookingResult = null;
  }

  logout(): void {
    this.authService.logout();
  }
}
