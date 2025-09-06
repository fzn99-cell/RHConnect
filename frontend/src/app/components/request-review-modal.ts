import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Request, RequestStatus, RequestType } from '../types/schema.types';

@Component({
  selector: 'app-request-review-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      *ngIf="open"
      class="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
        <h2 class="text-lg font-semibold mb-4">Review Request</h2>

        <div class="mb-4">
          <label for="reviewStatus" class="block mb-1 font-medium"
            >Status</label
          >
          <select
            id="reviewStatus"
            [(ngModel)]="selectedReviewStatus"
            class="w-full border rounded p-2"
          >
            <option [ngValue]="null" disabled>Select status</option>
            <option *ngFor="let status of statuses" [ngValue]="status">
              {{ status }}
            </option>
          </select>
        </div>

        <!-- Only show file upload if the request is payslip and approved -->
        <div
          *ngIf="
            selectedReviewStatus === RequestStatus.approved &&
            request?.requestType === RequestType.payslip
          "
          class="mb-4"
        >
          <label for="fileUpload" class="block mb-1 font-medium"
            >Attach Payslip</label
          >
          <input
            id="fileUpload"
            type="file"
            (change)="onFileSelected($event)"
            accept=".pdf,.png"
            class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div class="mb-4">
          <label for="comment" class="block mb-1 font-medium"
            >Comment (optional)</label
          >
          <textarea
            id="comment"
            [(ngModel)]="commentText"
            rows="4"
            class="w-full border rounded p-2"
            placeholder="Add a comment..."
          ></textarea>
        </div>

        <div class="flex justify-end gap-2">
          <button
            class="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
            (click)="cancel.emit()"
          >
            Cancel
          </button>
          <button
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            [disabled]="!selectedReviewStatus"
            (click)="submitReview()"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  `,
})
export class RequestReviewModalComponent implements OnChanges {
  @Input() open = false;
  @Input() request: Request | null = null;
  @Input() statuses: RequestStatus[] = [];
  @Input() file: File | null = null;

  commentText = '';
  selectedReviewStatus: RequestStatus | null = null;
  selectedFile: File | null = null;

  RequestStatus = RequestStatus;
  RequestType = RequestType;

  @Output() cancel = new EventEmitter<void>();
  @Output() submit = new EventEmitter<{
    status: RequestStatus;
    comment: string;
    file: File | null;
  }>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['open'] && this.open) {
      // Reset modal state every time it opens
      this.commentText = '';
      this.selectedReviewStatus = null;
      this.selectedFile = null;
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] || null;
  }

  submitReview() {
    if (!this.selectedReviewStatus) return;

    const fileToSend =
      this.selectedReviewStatus === RequestStatus.approved &&
      this.request?.requestType === RequestType.payslip
        ? this.selectedFile
        : null;

    this.submit.emit({
      status: this.selectedReviewStatus,
      comment: this.commentText,
      file: fileToSend,
    });
  }
}
