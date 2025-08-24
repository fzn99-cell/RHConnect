import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import { heroEye, heroChatBubbleLeftRight } from '@ng-icons/heroicons/outline';

import { RequestService } from '../../services/request.service';
import {
  Request,
  RequestStatus,
  RequestType,
  Department,
} from '../../types/schema.types';
import { RouterModule } from '@angular/router';

import { RequestStats } from '../../components/request-stats';
import { RequestReviewModalComponent } from '../../components/request-review-modal';
import { RequestViewModalComponent } from '../../components/request-view-modal';
import { RequestTableComponent } from '../../components/request-table';

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    RequestStats,
    RequestReviewModalComponent,
    RequestViewModalComponent,
    RequestTableComponent,
  ],
  providers: [provideIcons({ heroEye, heroChatBubbleLeftRight })],
  template: `
    <app-request-stats
      [requestTypes]="requestTypes"
      [pendingCounts]="pendingCounts"
      [typeLabels]="typeLabels"
    ></app-request-stats>

    <!-- REQUEST TABLE -->
    <app-request-table
      [requests]="requests"
      [typeLabels]="typeLabels"
      (review)="openReviewModal($event)"
      (view)="viewRequest($event)"
    ></app-request-table>

    <!-- REVIEW MODAL -->
    <app-request-review-modal
      [open]="isReviewModalOpen"
      [commentText]="commentText"
      [selectedReviewStatus]="selectedReviewStatus"
      [statuses]="statuses"
      (cancel)="closeReviewModal()"
      (submit)="handleReviewSubmit($event)"
    ></app-request-review-modal>

    <!-- VIEW MODAL -->
    <app-request-view-modal
      [open]="isViewModalOpen"
      [request]="selectedRequest"
      (close)="isViewModalOpen = false"
    ></app-request-view-modal>
  `,
})
export class HrDashboard implements OnInit {
  fb = inject(FormBuilder);
  requestService = inject(RequestService);

  filterForm!: FormGroup;
  requests: Request[] = [];
  pendingCounts: Partial<Record<RequestType, number>> = {};
  page = 1;
  limit = 5;

  isReviewModalOpen = false;
  activeRequestId: number | null = null;
  commentText = '';
  selectedReviewStatus: RequestStatus | null = null;

  selectedRequest: Request | null = null;
  isViewModalOpen = false;

  RequestStatus = RequestStatus;
  statuses = Object.values(RequestStatus);
  departments = Object.values(Department);
  requestTypes = Object.values(RequestType);

  typeLabels: Record<RequestType, string> = {
    payslip: 'Fiche de Paie',
    workCertificate: 'Attestation du Travail',
    leave: 'Congé',
    sickLeave: 'Arrêt Maladie',
    complaint: 'Réclamation',
    medicalFileUpdate: 'Mise à jour Dossier Assurance Médical',
  };

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      department: [''],
      status: [''],
      requestType: [''],
      userId: [''],
    });

    this.fetchRequests();
    this.fetchPendingCounts();
  }

  fetchRequests() {
    this.requestService
      .getAllRequests({
        ...this.filterForm.value,
        page: this.page,
        limit: this.limit,
      })
      .subscribe((resp) => (this.requests = resp.requests));
  }

  fetchPendingCounts() {
    this.requestService
      .getPendingCounts()
      .subscribe((resp) => (this.pendingCounts = resp));
  }

  changePage(delta: number) {
    const newPage = this.page + delta;
    if (newPage < 1) return;
    this.page = newPage;
    this.fetchRequests();
  }

  prevPage() {
    this.changePage(-1);
  }

  nextPage() {
    this.changePage(1);
  }

  openReviewModal(requestId: number) {
    this.activeRequestId = requestId;
    this.resetReviewState();
    this.isReviewModalOpen = true;
  }

  closeReviewModal() {
    this.isReviewModalOpen = false;
    this.activeRequestId = null;
    this.resetReviewState();
  }

  private resetReviewState() {
    this.commentText = '';
    this.selectedReviewStatus = null;
  }

  handleReviewSubmit({
    status,
    comment,
  }: {
    status: RequestStatus;
    comment: string;
  }) {
    if (!this.activeRequestId) return;

    this.requestService
      .reviewRequest(this.activeRequestId, status, comment.trim())
      .subscribe(() => {
        this.fetchRequests();
        this.closeReviewModal();
      });
  }

  viewRequest(id: number) {
    this.requestService.getRequestById(id).subscribe((req) => {
      this.selectedRequest = req;
      this.isViewModalOpen = true;
    });
  }

  getTypeLabel(type: string): string {
    return this.typeLabels[type as RequestType] || '';
  }

  getPendingCount(type: string): number {
    return this.pendingCounts[type as RequestType] || 0;
  }
}
