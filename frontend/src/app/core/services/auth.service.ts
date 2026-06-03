import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadStoredUser());

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('hotel_token');
  }

  getToken(): string | null {
    return localStorage.getItem('hotel_token');
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, { name, email, password })
      .pipe(tap(res => this.persistAuth(res)));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap(res => this.persistAuth(res)));
  }

  logout(): void {
    localStorage.removeItem('hotel_token');
    localStorage.removeItem('hotel_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private persistAuth(res: AuthResponse): void {
    localStorage.setItem('hotel_token', res.token);
    localStorage.setItem('hotel_user', JSON.stringify(res.user));
    this.currentUserSubject.next(res.user);
  }

  private loadStoredUser(): User | null {
    const stored = localStorage.getItem('hotel_user');
    return stored ? JSON.parse(stored) : null;
  }
}
