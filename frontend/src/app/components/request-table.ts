import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroEye, heroChatBubbleLeftRight } from '@ng-icons/heroicons/outline';
import { RouterModule } from '@angular/router';
import { Request, RequestStatus, RequestType } from '../types/schema.types';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-request-table',
  standalone: true,
  imports: [CommonModule, NgIcon, RouterModule],
  providers: [provideIcons({ heroEye, heroChatBubbleLeftRight })],
  template: `
    <div class="overflow-x-auto">
      <div
        class="min-w-[60rem] grid grid-cols-5 bg-gray-100 text-sm font-semibold border-b-2 border-gray-200"
      >
        <div class="px-6 py-3">Employee</div>
        <div class="px-6 py-3">Type</div>
        <div class="px-6 py-3">Date</div>
        <div class="px-6 py-3">Status</div>
        <div class="px-6 py-3">Actions</div>
      </div>

      <div
        *ngFor="let r of requests"
        class="min-w-[60rem] grid grid-cols-5 items-start border-b border-gray-100 text-sm bg-white hover:shadow-sm transition"
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
        <div class="px-6 py-4 flex gap-2">
          <!-- Chat/Review button only if role is NOT admin -->
          <button
            *ngIf="!isAdmin"
            class="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md font-medium flex items-center gap-1"
            (click)="reviewRequest(r.id)"
          >
            <ng-icon name="heroChatBubbleLeftRight" class="w-4 h-4"></ng-icon>
          </button>

          <button
            class="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-md font-medium flex items-center gap-1"
            (click)="view.emit(r.id)"
          >
            <ng-icon name="heroEye" class="w-4 h-4"></ng-icon>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class RequestTableComponent {
  private authService = inject(AuthService);
  @Input() request!: Request | null;

  @Input() requests: Request[] = [];
  @Input() typeLabels: Partial<Record<RequestType, string>> = {};

  @Output() review = new EventEmitter<number>();
  @Output() view = new EventEmitter<number>();

  getTypeLabel(type: RequestType): string {
    const label = this.typeLabels[type] || type;
    console.log(
      '[Table] getTypeLabel called with:',
      type,
      'resolved label:',
      label,
    );
    return label;
  }

  get isAdmin(): boolean {
    const role = this.authService.getUser()?.role;
    console.log('[Table] Checking isAdmin, user role:', role);
    return role === 'admin';
  }

  statusClasses: Record<RequestStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  getUserName(user: Request['user']): string {
    console.log('[Table] getUserName called with:', user);
    if (!user) return 'N/A';
    if (user.fullName) return user.fullName;
    if (user.firstName && user.lastName)
      return `${user.firstName} ${user.lastName}`;
    return 'N/A';
  }

  reviewRequest(id: number) {
    console.log(
      '[Table] reviewRequest triggered with id:',
      id,
      'typeof:',
      typeof id,
    );
    this.review.emit(id);
    console.log('[Table] review event emitted for id:', id);
  }
}
