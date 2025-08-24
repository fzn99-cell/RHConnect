import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RequestStatus } from '../types/schema.types';

@Component({
  selector: 'app-request-review-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      *ngIf="open"
      class="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
        <h2 class="text-lg font-semibold mb-4">Review Request</h2>

        <textarea
          [(ngModel)]="commentText"
          rows="4"
          class="w-full border rounded p-2 mb-4"
          placeholder="Add a comment (optional)..."
        ></textarea>

        <label for="reviewStatus" class="block mb-1 font-medium">Status</label>
        <select
          id="reviewStatus"
          [(ngModel)]="selectedReviewStatus"
          class="w-full border rounded p-2 mb-4"
        >
          <option [ngValue]="null" disabled>Select status</option>
          <option *ngFor="let status of statuses" [ngValue]="status">
            {{ status }}
          </option>
        </select>

        <div class="flex justify-end gap-2">
          <button class="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded" (click)="cancel.emit()">Cancel</button>
          <button
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            [disabled]="!selectedReviewStatus"
            (click)="submit.emit({ status: selectedReviewStatus!, comment: commentText })"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  `
})
export class RequestReviewModalComponent {
  @Input() open = false;
  @Input() commentText = '';
  @Input() selectedReviewStatus: RequestStatus | null = null;
  @Input() statuses: RequestStatus[] = [];

  @Output() cancel = new EventEmitter<void>();
  @Output() submit = new EventEmitter<{ status: RequestStatus; comment: string }>();
}
