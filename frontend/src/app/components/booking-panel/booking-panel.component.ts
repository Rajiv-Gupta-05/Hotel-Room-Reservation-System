import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoomService, Room, BookingResult } from '../../core/services/room.service';

@Component({
  selector: 'app-booking-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './booking-panel.component.html',
  styleUrls: ['./booking-panel.component.css'],
})
export class BookingPanelComponent implements OnInit {
  @Input() rooms: Room[] = [];

  @Output() bookingComplete = new EventEmitter<{
    travelTime: number;
    isSameFloor: boolean;
    roomNumbers: number[];
  }>();

  @Output() occupancyChanged = new EventEmitter<void>();

  bookingForm: FormGroup;

  isBooking = false;
  isRandomizing = false;
  isResetting = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private roomService: RoomService) {
    this.bookingForm = this.fb.group({
      count: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
    });
  }

  ngOnInit(): void {}

  get availableCount(): number {
    return this.rooms.filter(r => !r.isBooked).length;
  }

  get f() {
    return this.bookingForm.controls;
  }

  bookRooms(): void {
    if (this.bookingForm.invalid) return;

    const count = parseInt(this.bookingForm.value.count, 10);

    if (count > this.availableCount) {
      this.showError(`Only ${this.availableCount} room(s) available.`);
      return;
    }

    this.isBooking = true;
    this.clearMessages();

    this.roomService.bookRooms(count).subscribe({
      next: (result: BookingResult) => {
        this.isBooking = false;
        this.showSuccess(result.message);
        this.bookingComplete.emit({
          travelTime: result.travelTime,
          isSameFloor: result.isSameFloor,
          roomNumbers: result.bookedRooms.map(r => r.roomNumber),
        });
      },
      error: err => {
        this.isBooking = false;
        this.showError(err.error?.message || 'Booking failed. Please try again.');
      },
    });
  }

  randomOccupancy(): void {
    this.isRandomizing = true;
    this.clearMessages();

    this.roomService.randomOccupancy().subscribe({
      next: res => {
        this.isRandomizing = false;
        this.showSuccess(res.message);
        this.occupancyChanged.emit();
      },
      error: err => {
        this.isRandomizing = false;
        this.showError(err.error?.message || 'Failed to randomize occupancy.');
      },
    });
  }

  resetAll(): void {
    this.isResetting = true;
    this.clearMessages();

    this.roomService.resetAllRooms().subscribe({
      next: res => {
        this.isResetting = false;
        this.showSuccess(res.message);
        this.occupancyChanged.emit();
      },
      error: err => {
        this.isResetting = false;
        this.showError(err.error?.message || 'Failed to reset rooms.');
      },
    });
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    this.errorMessage = '';
    setTimeout(() => (this.successMessage = ''), 5000);
  }

  private showError(msg: string): void {
    this.errorMessage = msg;
    this.successMessage = '';
    setTimeout(() => (this.errorMessage = ''), 6000);
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
