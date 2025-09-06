import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User } from '../types/schema.types';
import { environment } from '../../environments/environment';
import { SelfService } from './self.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private selfService = inject(SelfService);

  private readonly API_URL = `${environment.apiUrl}`;
  private currentUser: User | null = null;

  /** POST /auth/login — Authenticate and set HTTP-only cookie */
  login(email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/auth/login`, {
      email,
      password,
    });
  }

  /** POST /auth/logout — Clear cookie and logout */
  logout(): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/auth/logout`, {});
  }

  /** GET /users/me — Load logged-in user */
  loadUser(): Observable<User | null> {
    return this.selfService.getMyProfile().pipe(
      map((res) => {
        this.currentUser = res.user;
        return res.user;
      }),
      catchError(() => {
        this.currentUser = null;
        return of(null);
      }),
    );
  }

  /** GET local cached user */
  getUser(): User | null {
    return this.currentUser;
  }

  /** Check login state */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /** Check if user has at least one allowed role */
  authorizedRoles(allowedRoles: string[]): boolean {
    return this.currentUser
      ? allowedRoles.includes(this.currentUser.role)
      : false;
  }

  /** POST /auth/forgot-password — Send reset link */
  sendPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/forgot-password`, { email });
  }

  /** POST /auth/reset-password — Reset with token */
  resetPassword(
    email: string,
    token: string,
    password: string,
  ): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/reset-password`, {
      email,
      token,
      password,
    });
  }

  /** PATCH /auth/verify-email — Verify user via token */
  verifyEmail(email: string, token: string): Observable<any> {
    return this.http.patch(`${this.API_URL}/auth/verify-email`, {
      email,
      token,
    });
  }
}
