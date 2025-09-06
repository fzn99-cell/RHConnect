import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Request, RequestStatus, RequestType } from '../../types/schema.types';
import { SelfService } from '../../services/self.service';
import { firstValueFrom } from 'rxjs';
import { PaginatedRequestResponse } from '../../types/api.types';
import {
  RequestTypeLabels,
  RequestStatusLabels,
} from '../../types/enumsWithFrenchLabels';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- Filter Form -->
    <form
      [formGroup]="filterForm"
      (ngSubmit)="fetchRequests()"
      class="mb-6 flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-lg shadow"
    >
      <select
        formControlName="requestType"
        class="border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">All Types</option>
        <option *ngFor="let t of types" [value]="t">
          {{ RequestTypeLabels[t] }}
        </option>
      </select>

      <select
        formControlName="status"
        class="border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">All Statuses</option>
        <option *ngFor="let s of statuses" [value]="s">
          {{ RequestStatusLabels[s] }}
        </option>
      </select>

      <button
        type="submit"
        class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Filter
      </button>
    </form>

    <!-- Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        *ngFor="let r of requests; let i = index"
        class="border border-gray-200 rounded-2xl p-5 shadow hover:shadow-lg transition transform hover:-translate-y-1 bg-white"
      >
        <div class="flex justify-between items-center mb-3">
          <span class="text-gray-600 font-semibold">Type:</span>
          <span
            class="px-3 py-1 rounded-full text-white text-xs font-semibold"
            [ngClass]="requestTypeColors[r.requestType]"
          >
            {{ RequestTypeLabels[r.requestType] }}
          </span>
        </div>

        <div class="flex justify-between items-center mb-3">
          <span class="text-gray-600 font-semibold">Status:</span>
          <span
            class="px-3 py-1 rounded-full text-white text-xs font-semibold"
            [ngClass]="requestStatusColors[r.status]"
          >
            {{ RequestStatusLabels[r.status] }}
          </span>
        </div>

        <div class="mb-3">
          <span class="text-gray-600 font-semibold">Description:</span>
          <p class="text-gray-800 text-sm mt-1">{{ r.description }}</p>
        </div>

        <div class="mb-3">
          <span class="text-gray-600 font-semibold">Reply:</span>
          <p class="text-gray-800 text-sm mt-1">
            {{ r.comment || "Pas de réponse pour l'instant." }}
          </p>
        </div>

        <div class="flex items-center justify-between">
          <div *ngIf="r.files?.length">
            <ul class="text-sm">
              <li *ngFor="let f of r.files">
                <a
                  [href]="f.downloadUrl"
                  target="_blank"
                  class="text-blue-600 hover:underline"
                  title="{{ f.originalName }}"
                >
                  View Supporting Doc
                </a>
              </li>
            </ul>
          </div>

          <div class="text-right text-gray-400 text-sm">
            {{ r.submittedAt | date: 'short' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex justify-center gap-3 mt-6">
      <button
        (click)="prevPage()"
        [disabled]="page === 1"
        class="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Previous
      </button>
      <button
        (click)="nextPage()"
        class="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
      >
        Next
      </button>
    </div>
  `,
})
export class EmployeeDashboard implements OnInit {
  RequestTypeLabels = RequestTypeLabels;
  RequestStatusLabels = RequestStatusLabels;

  fb = inject(FormBuilder);
  selfService = inject(SelfService);

  filterForm!: FormGroup;
  requests: Request[] = [];
  statuses = Object.values(RequestStatus);
  types = Object.values(RequestType);

  page = 1;
  limit = 9;
  errorMsg = '';

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      status: [''],
      requestType: [''],
    });

    this.fetchRequests();
  }

  requestTypeColors: Record<RequestType, string> = {
    workCertificate: 'bg-purple-500',
    leave: 'bg-blue-500',
    payslip: 'bg-green-500',
    complaint: 'bg-red-500',
    sickLeave: 'bg-yellow-500',
    medicalFileUpdate: 'bg-indigo-500',
  };

  requestStatusColors: Record<RequestStatus, string> = {
    pending: 'bg-yellow-500',
    approved: 'bg-green-600',
    rejected: 'bg-red-500',
  };

  async fetchRequests() {
    try {
      const filters = {
        ...this.filterForm.value,
        page: this.page,
        limit: this.limit,
      };

      const res: PaginatedRequestResponse = await firstValueFrom(
        this.selfService.getMyRequests(filters),
      );

      // Map files to include downloadUrl
      this.requests = res.requests
        .map((r) => ({
          ...r,
          files: r.files?.map((f) => ({
            ...f,
            downloadUrl: f.downloadUrl, // backend already provides this
          })),
        }))
        .sort(
          (a, b) =>
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime(),
        );
    } catch (error: any) {
      console.error('Fetch error:', error);
      this.errorMsg = error?.error?.message || 'Failed to load requests.';
    }
  }

  nextPage() {
    this.page += 1;
    this.fetchRequests();
  }

  prevPage() {
    if (this.page > 1) {
      this.page -= 1;
      this.fetchRequests();
    }
  }
}
