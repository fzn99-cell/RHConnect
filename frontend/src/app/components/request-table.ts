import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroEye, heroChatBubbleLeftRight } from '@ng-icons/heroicons/outline';
import { RouterModule } from '@angular/router';
import { Request, RequestType } from '../types/schema.types';

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
            class="px-6 py-4 font-semibold text-blue-600 hover:underline block"
          >
            {{
              r.user.fullName ||
                r.user.firstName + ' ' + r.user.lastName ||
                'N/A'
            }}
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
            [ngClass]="{
              'bg-yellow-100 text-yellow-800': r.status === 'pending',
              'bg-green-100 text-green-800': r.status === 'approved',
              'bg-red-100 text-red-800': r.status === 'rejected'
            }"
            class="inline-block text-xs font-medium px-2 py-1 rounded-md capitalize"
          >
            {{ r.status }}
          </span>
        </div>
        <div class="px-6 py-4 flex gap-2">
          <!-- Chat/Review button only if role is NOT admin -->
          <button
            *ngIf="currentUserRole !== 'admin'"
            class="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md font-medium flex items-center gap-1"
            (click)="review.emit(r.id)"
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
  @Input() requests: Request[] = [];
  @Input() typeLabels: Record<RequestType, string> = {} as any;

  // Pass the current logged-in user's role
  @Input() currentUserRole: string | null = null;

  @Output() review = new EventEmitter<number>();
  @Output() view = new EventEmitter<number>();

  getTypeLabel(type: RequestType): string {
    return this.typeLabels[type] || type;
  }
}
