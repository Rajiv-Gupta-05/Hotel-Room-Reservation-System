import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Room {
  _id: string;
  roomNumber: number;
  floor: number;
  position: number;
  isBooked: boolean;
  isNewlyBooked: boolean;
  bookedBy?: { name: string; email: string } | null;
  bookedAt?: string | null;
}

export interface BookingResult {
  message: string;
  bookedRooms: Room[];
  travelTime: number;
  isSameFloor: boolean;
}

@Injectable({ providedIn: 'root' })
export class RoomService {
  private readonly apiUrl = `${environment.apiUrl}/rooms`;
  private roomsSubject = new BehaviorSubject<Room[]>([]);

  rooms$ = this.roomsSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadRooms(): Observable<Room[]> {
    return this.http
      .get<Room[]>(this.apiUrl)
      .pipe(tap(rooms => this.roomsSubject.next(rooms)));
  }

  bookRooms(count: number): Observable<BookingResult> {
    return this.http
      .post<BookingResult>(`${this.apiUrl}/book`, { count })
      .pipe(tap(() => this.loadRooms().subscribe()));
  }

  randomOccupancy(): Observable<{ message: string; rooms: Room[] }> {
    return this.http
      .post<{ message: string; rooms: Room[] }>(`${this.apiUrl}/random`, {})
      .pipe(tap(res => this.roomsSubject.next(res.rooms)));
  }

  resetAllRooms(): Observable<{ message: string; rooms: Room[] }> {
    return this.http
      .post<{ message: string; rooms: Room[] }>(`${this.apiUrl}/reset`, {})
      .pipe(tap(res => this.roomsSubject.next(res.rooms)));
  }
}
