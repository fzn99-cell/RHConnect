import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RequestStatus, RequestType } from '../types/schema.types';

@Injectable({ providedIn: 'root' })
export class RequestService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/requests`;

  /** POST /requests — Submit new request with optional file */
  submitRequest(formData: FormData): Observable<any> {
    return this.http.post(`${this.API_URL}`, formData);
  }

  /** GET /requests — Admin/HR/TL/Nurse can fetch filtered list */
  getAllRequests(filters: {
    department?: string;
    status?: RequestStatus;
    requestType?: RequestType;
    userId?: number;
    page?: number;
    limit?: number;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
  }): Observable<any> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get(`${this.API_URL}`, { params });
  }

  /** GET /requests/pending-counts — Grouped count of pending requests by type */
  getPendingCounts(filters?: {
    department?: string;
    requestType?: RequestType;
    userId?: number;
  }): Observable<Record<RequestType, number>> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<Record<RequestType, number>>(
      `${this.API_URL}/pending-counts`,
      { params },
    );
  }

  /** GET /requests/user/:userId — Admin/HR/TL only */
  getRequestsByUserId(userId: number): Observable<any> {
    return this.http.get(`${this.API_URL}/user/${userId}`);
  }

  /** GET /requests/:requestId — Get full request detail */
  getRequestById(requestId: number): Observable<any> {
    return this.http.get(`${this.API_URL}/${requestId}`);
  }

  /** PATCH /requests/:requestId/review — Update status + optional comment */
  reviewRequest(
    requestId: number,
    newStatus: RequestStatus,
    comment?: string,
    file?: File | null,
  ): Observable<any> {
    // Create a new FormData object
    const formData = new FormData(); // Append the request ID, new status, and comment to the form data

    formData.append('newStatus', newStatus);
    if (comment) {
      formData.append('comment', comment);
    } // If a file exists, append it to the form data

    if (file) {
      formData.append('file', file, file.name); // 'file' should match the field name your backend expects
    } // Use a POST or PUT request instead of PATCH, as PATCH can be tricky with FormData
    // The backend must be configured to handle this FormData payload

    return this.http.post(`${this.API_URL}/${requestId}/review`, formData);
  }
}
