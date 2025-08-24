import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, Request } from '../types/schema.types';
import { environment } from '../../environments/environment';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedUserResponse {
  users: User[];
  pagination: PaginationMeta;
}

export interface PaginatedHrRequestResponse {
  requests: Request[];
  pagination: PaginationMeta;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private readonly API_BASE = `${environment.apiUrl}/admin`;
  private readonly API_URL = `${environment.apiUrl}`;

  /** GET /admin/users — List users with filters and pagination */
  getAllUsers(params?: {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Observable<PaginatedUserResponse> {
    return this.http.get<PaginatedUserResponse>(`${this.API_BASE}/users`, {
      params,
    });
  }

  /** POST /admin/users — Create a new user */
  createUser(
    payload: Partial<User> & {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
    },
  ): Observable<{ user: User; message: string }> {
    return this.http.post<{ user: User; message: string }>(
      `${this.API_BASE}/users`,
      payload,
    );
  }

  /** PATCH /admin/users/:userId/change-password — Reset user's password */
  resetUserPassword(
    userId: number,
    newPassword: string,
  ): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${this.API_BASE}/users/${userId}/change-password`,
      { newPassword },
    );
  }

  /** PATCH /admin/users/:userId — Update user (role, name, department...) */
  patchUser(
    userId: number,
    updates: Partial<User>,
  ): Observable<{ user: User; message: string }> {
    return this.http.patch<{ user: User; message: string }>(
      `${this.API_BASE}/users/${userId}`,
      { updates },
    );
  }

  /** DELETE /admin/users/:userId/delete-user — Remove a user */
  deleteUser(userId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.API_BASE}/users/${userId}/delete-user`,
    );
  }

  /** GET /admin/requests/hr-requests — Fetch all HR-related requests */
  getAllHrRequests(params?: {
    type?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Observable<PaginatedHrRequestResponse> {
    return this.http.get<PaginatedHrRequestResponse>(
      `${this.API_BASE}/requests/hr-requests`,
      { params },
    );
  }

  /** GET /users/:userId — fetch user by ID */
  getUserById(userId: number): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.API_URL}/users/${userId}`);
  }
}
