import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Request, RequestType } from '../types/schema.types';
import { RequestTypeLabels } from '../types/enumsWithFrenchLabels';

@Component({
  selector: 'app-request-view-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="open"
      class="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[80vh] overflow-y-auto p-6 flex flex-col"
      >
        <h2 class="text-2xl font-bold mb-6 border-b pb-2">Request Details</h2>

        <section class="mb-6 space-y-3">
          <div class="flex justify-between">
            <span class="text-gray-600 font-medium">Request ID:</span>
            <span class="font-semibold text-gray-900">{{ request?.id }}</span>
          </div>

          <div class="flex justify-between">
            <span class="text-gray-600 font-medium">Type:</span>
            <span class="capitalize font-semibold text-blue-600">
              {{ getTypeLabel(request?.requestType) }}
            </span>
          </div>

          <div>
            <span class="text-gray-600 font-medium block mb-1"
              >Description:</span
            >
            <p
              class="text-gray-800 bg-gray-100 rounded-md p-3 whitespace-pre-line"
            >
              {{ request?.description || 'No description provided.' }}
            </p>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-gray-600 font-medium">Status:</span>
            <span
              [ngClass]="{
                'bg-yellow-100 text-yellow-800': request?.status === 'pending',
                'bg-green-100 text-green-800': request?.status === 'approved',
                'bg-red-100 text-red-800': request?.status === 'rejected',
              }"
              class="inline-block text-xs font-semibold px-3 py-1 rounded-full capitalize"
            >
              {{ request?.status }}
            </span>
          </div>

          <div class="flex justify-between">
            <span class="text-gray-600 font-medium">Submitted At:</span>
            <span class="text-gray-800 font-semibold">
              {{ request?.submittedAt | date: 'medium' }}
            </span>
          </div>

          <div *ngIf="request?.comment">
            <span class="text-gray-600 font-medium block mb-1">Comment:</span>
            <p
              class="text-gray-800 bg-gray-100 rounded-md p-3 whitespace-pre-line"
            >
              {{ request?.comment }}
            </p>
          </div>
        </section>

        <section class="mb-6 border-t border-gray-200 pt-4">
          <h3 class="text-xl font-semibold mb-4">User Info</h3>
          <div class="grid grid-cols-2 gap-y-3 gap-x-6 text-gray-700">
            <div>
              <span class="font-medium text-gray-600">Name:</span>
              <div class="font-semibold text-gray-900">
                {{ request?.user?.fullName || 'N/A' }}
              </div>
            </div>
            <div>
              <span class="font-medium text-gray-600">Email:</span>
              <div class="font-semibold text-gray-900">
                {{ request?.user?.email || 'N/A' }}
              </div>
            </div>
            <div>
              <span class="font-medium text-gray-600">Department:</span>
              <div class="font-semibold text-gray-900">
                {{ request?.user?.department || 'N/A' }}
              </div>
            </div>
          </div>
        </section>

        <section
          *ngIf="request?.medicalFileUpdateRequest"
          class="border-t border-gray-200 pt-4"
        >
          <h3 class="text-xl font-semibold mb-4">Medical File Request</h3>
          <p
            class="text-gray-800 bg-gray-100 rounded-md p-3 whitespace-pre-line"
          >
            <strong>Notes:</strong> {{ medicalFileNotes }}
          </p>
        </section>

        <section
          *ngIf="request?.files?.length"
          class="border-t border-gray-200 pt-4 mt-6"
        >
          <h3 class="text-xl font-semibold mb-4">File</h3>
          <ul class="flex items-center gap-4 p-0 m-0 list-none">
            <li *ngFor="let file of request?.files">
              <button
                (click)="openFileWithDelay(file)"
                class="text-white underline bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md inline-block"
              >
                <ng-container *ngIf="loadingFile === file; else label">
                  Opening...
                </ng-container>
                <ng-template #label>Open File</ng-template>
              </button>
            </li>
          </ul>
        </section>

        <div class="mt-auto flex justify-end">
          <button
            class="bg-gray-300 hover:bg-gray-400 px-5 py-2 rounded-md font-semibold transition"
            (click)="close.emit()"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  `,
})
export class RequestViewModalComponent {
  @Input() open = false;
  @Input() request: Request | null = null;
  @Output() close = new EventEmitter<void>();
  loadingFile: any = null;
  typeLabels = RequestTypeLabels;

  getTypeLabel(type: string | undefined): string {
    return type ? this.typeLabels[type as RequestType] || type : '';
  }

  get medicalFileNotes(): string {
    return this.request?.medicalFileUpdateRequest?.notes || 'None';
  }

  // Add a helper that supports multiple shapes
  getFileUrl(file: any): string {
    if (!file) return '';
    if (file.downloadUrl) return file.downloadUrl;

    // fallback: construct with backend host
    const backendHost = 'http://localhost:3000'; // or environment variable
    if (file.filePath) return `${backendHost}/uploads/${file.filePath}`;
    if (file.storedName) return `${backendHost}/uploads/${file.storedName}`;

    return '';
  }

  openFileWithDelay(file: any) {
    this.loadingFile = file;

    const url = this.getFileUrl(file);

    setTimeout(() => {
      window.open(url, '_blank');
      this.loadingFile = null;
    }, 1500); // simulate 1.5s load
  }
  getFilenameFromPath(path?: string) {
    if (!path) return '';
    const parts = path.split('/');
    return parts[parts.length - 1] || path;
  }
}
