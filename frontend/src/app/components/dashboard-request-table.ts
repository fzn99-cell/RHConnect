import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Request, RequestStatus, RequestType } from '../types/schema.types';
import { RequestTypeLabels } from '../types/enumsWithFrenchLabels';

@Component({
  selector: 'app-dashboard-request-table',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="overflow-x-auto">
      <div
        class="min-w-[60rem] grid grid-cols-4 bg-gray-100 text-sm font-semibold border-b-2 border-gray-200"
      >
        <div class="px-6 py-3">Employee</div>
        <div class="px-6 py-3">Type</div>
        <div class="px-6 py-3">Date</div>
        <div class="px-6 py-3">Status</div>
      </div>

      <div
        *ngFor="let r of requests"
        class="min-w-[60rem] grid grid-cols-4 items-start border-b border-gray-100 text-sm bg-white hover:shadow-sm transition"
      >
        <div class="px-6 py-4 font-semibold text-gray-800">
          <a
            *ngIf="r.user"
            [routerLink]="['/profile', r.user.id]"
            class="font-semibold text-blue-600 hover:underline block"
          >
            {{ getUserName(r.user) }}
          </a>
        </div>
        <div class="px-6 py-4">
          <span
            class="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-md capitalize"
          >
            {{ getTypeLabel(r.requestType) }}
          </span>
        </div>
        <div class="px-6 py-4 text-gray-600 text-sm">
          {{ r.submittedAt | date: 'MMM d, y' }}
        </div>
        <div class="px-6 py-4">
          <span
            [ngClass]="statusClasses[r.status]"
            class="inline-block text-xs font-medium px-2 py-1 rounded-md capitalize"
          >
            {{ r.status }}
          </span>
        </div>
      </div>
    </div>
  `,
})
export class DashboardRequestTableComponent {
  @Input() requests: Request[] = [];
  typeLabels = RequestTypeLabels;
  RequestStatus = RequestStatus;

  statusClasses: Record<RequestStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  getTypeLabel(type: RequestType): string {
    return this.typeLabels[type] || type;
  }

  getUserName(user: Request['user']): string {
    if (!user) return 'N/A';
    return (
      user.fullName ||
      `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
      'N/A'
    );
  }
}
