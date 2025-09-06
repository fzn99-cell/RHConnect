import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { heroChatBubbleLeftRight, heroEye } from '@ng-icons/heroicons/outline';

import { RequestService } from '../services/request.service';
import { RequestFiltersComponent } from '../components/request-filters';
import { RequestTableComponent } from '../components/request-table';
import { RequestReviewModalComponent } from '../components/request-review-modal';
import { RequestViewModalComponent } from '../components/request-view-modal';
import { RequestPaginationComponent } from '../components/request-pagination';
import { RequestTypeLabels } from '../types/enumsWithFrenchLabels';
import {
  Request,
  RequestStatus,
  RequestType,
  Department,
} from '../types/schema.types';

@Component({
  selector: 'app-manage-requests',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    RequestFiltersComponent,
    RequestPaginationComponent,
    RequestReviewModalComponent,
    RequestViewModalComponent,
    RequestTableComponent,
  ],
  providers: [provideIcons({ heroEye, heroChatBubbleLeftRight })],
  template: `
    <h1 class="text-2xl font-bold mb-4">Manage Requests</h1>

    <app-request-filters
      [departments]="departments"
      [statuses]="statuses"
      [requestTypes]="requestTypes"
      [typeLabels]="typeLabels"
      (filterChange)="fetchRequests($event)"
    ></app-request-filters>

    <app-request-table
      [requests]="requests"
      [typeLabels]="typeLabels"
      (review)="openReviewModal($event)"
      (view)="viewRequest($event)"
    ></app-request-table>

    <app-request-pagination
      [page]="page"
      [disableNext]="requests.length < limit"
      (prev)="prevPage()"
      (next)="nextPage()"
    ></app-request-pagination>

    <app-request-review-modal
      [open]="isReviewModalOpen"
      [request]="activeRequest"
      [statuses]="statuses"
      (cancel)="closeReviewModal()"
      (submit)="handleReviewSubmit($event)"
    ></app-request-review-modal>

    <app-request-view-modal
      [open]="isViewModalOpen"
      [request]="selectedRequest"
      (close)="isViewModalOpen = false"
    ></app-request-view-modal>
  `,
})
export class ManageRequestsComponent implements OnInit {
  fb = inject(FormBuilder);
  requestService = inject(RequestService);

  @Input() departments: Department[] = Object.values(Department);
  @Input() statuses: RequestStatus[] = Object.values(RequestStatus);
  @Input() requestTypes: RequestType[] = Object.values(RequestType);
  @Input() typeLabels = RequestTypeLabels;

  requests: Request[] = [];
  activeRequest: Request | null = null;
  selectedRequest: Request | null = null;

  page = 1;
  limit = 5;

  isReviewModalOpen = false;
  isViewModalOpen = false;
  activeRequestId: number | null = null;

  filterForm!: FormGroup;

  ngOnInit() {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      department: [''],
      status: [''],
      requestType: [''],
      userId: [''],
    });

    this.fetchRequests();
  }

  fetchRequests(filters?: any) {
    const payload = { ...filters, page: this.page, limit: this.limit };
    this.requestService
      .getAllRequests(payload)
      .subscribe((resp) => (this.requests = resp.requests));
  }

  prevPage() {
    this.changePage(-1);
  }
  nextPage() {
    this.changePage(1);
  }
  private changePage(delta: number) {
    const newPage = this.page + delta;
    if (newPage < 1) return;
    this.page = newPage;
    this.fetchRequests();
  }

  openReviewModal(id: number) {
    const request = this.requests.find((r) => r.id === id);
    if (!request) return;
    this.activeRequest = request;
    this.activeRequestId = id;
    this.isReviewModalOpen = true;
  }
  
  closeReviewModal() {
    this.activeRequest = null;
    this.isReviewModalOpen = false;
  }

  viewRequest(id: number) {
    this.requestService.getRequestById(id).subscribe((req) => {
      this.selectedRequest = req;
      this.isViewModalOpen = true;
    });
  }

  handleReviewSubmit({
    status,
    comment,
    file,
  }: {
    status: RequestStatus;
    comment: string;
    file: File | null;
  }) {
    if (!this.activeRequestId) return;
    this.requestService
      .reviewRequest(this.activeRequestId, status, comment.trim(), file)
      .subscribe(() => {
        this.fetchRequests();
        this.closeReviewModal();
      });
  }
}
