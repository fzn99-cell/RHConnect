import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  User,
  Request,
  RequestStatus,
  RequestType,
} from '../types/schema.types';
import { environment } from '../../environments/environment';
import { PaginatedRequestResponse } from '../types/api.types';

@Injectable({ providedIn: 'root' })
export class SelfService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/self`;

  /** GET /self/profile — Get authenticated user's profile */
  getMyProfile(): Observable<{ message: string; user: User }> {
    return this.http.get<{ message: string; user: User }>(
      `${this.API_URL}/profile`,
    );
  }

  /** PATCH /self/profile — Update editable fields of user's profile */
  patchMyProfile(
    data: Partial<User>,
  ): Observable<{ message: string; user: User }> {
    return this.http.patch<{ message: string; user: User }>(
      `${this.API_URL}/profile`,
      data,
    );
  }

  /** PATCH /self/change-password — Update password after validating old password */
  changeMyPassword(
    oldPassword: string,
    newPassword: string,
  ): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${this.API_URL}/change-password`,
      {
        oldPassword,
        newPassword,
      },
    );
  }

  /** GET /self/requests — Get requests submitted by the authenticated user */
  getMyRequests(filters: {
    requestType?: RequestType;
    status?: RequestStatus;
    page?: number;
    limit?: number;
  }): Observable<PaginatedRequestResponse> {
    return this.http.get<PaginatedRequestResponse>(`${this.API_URL}/requests`, {
      params: { ...filters },
    });
  }

  /** GET /self/requests/:requestId — Get a single request by ID */
  getMyRequestById(
    requestId: number,
  ): Observable<{ message: string; request: Request }> {
    return this.http.get<{ message: string; request: Request }>(
      `${this.API_URL}/requests/${requestId}`,
    );
  }

  /** PATCH /self/requests/:requestId — Update a pending request */
  patchMyRequest(
    requestId: number,
    data: Partial<Pick<Request, 'requestType' | 'description'>>,
  ): Observable<{ message: string; request: Request }> {
    return this.http.patch<{ message: string; request: Request }>(
      `${this.API_URL}/requests/${requestId}`,
      data,
    );
  }

  /** DELETE /self/requests/:requestId — Delete a pending request */
  deleteMyRequest(requestId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.API_URL}/requests/${requestId}`,
    );
  }
}
