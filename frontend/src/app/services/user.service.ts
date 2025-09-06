import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../types/schema.types'; // adjust path if needed
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}`;

  /** GET /users/:userId — fetch user by ID */
  getUserById(userId: number): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.API_URL}/users/${userId}`);
  }
  
  /** PATCH /users/:userId — update user (admin only) */
  updateUser(
    userId: number,
    updates: Partial<User>,
  ): Observable<{ user: User }> {
    return this.http.patch<{ user: User }>(
      `${this.API_URL}/users/${userId}`,
      updates,
    );
  }
}
