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
import { RouterModule } from '@angular/router';

import { RequestService } from '../../services/request.service';
import { DashboardRequestStats } from '../../components/dashboard-request-stats';
import { DashboardRequestTableComponent } from '../../components/dashboard-request-table';
import { RequestTypeLabels } from '../../types/enumsWithFrenchLabels';
import {
  Request,
  RequestType,
  Department,
  RequestStatus,
} from '../../types/schema.types';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DashboardRequestStats,
    DashboardRequestTableComponent,
  ],
  providers: [provideIcons({ heroEye, heroChatBubbleLeftRight })],
  template: `
    <app-dashboard-request-stats
      [requestTypes]="requestTypes"
      [pendingCounts]="pendingCounts"
      [typeLabels]="typeLabels"
    ></app-dashboard-request-stats>

    <app-dashboard-request-table
      [requests]="requests"
    ></app-dashboard-request-table>
  `,
})
export class AdminDashboard implements OnInit {
  fb = inject(FormBuilder);
  requestService = inject(RequestService);

  requests: Request[] = [];
  pendingCounts: Partial<Record<RequestType, number>> = {};

  filterForm!: FormGroup;

  requestTypes = Object.values(RequestType);
  departments = Object.values(Department);
  statuses = Object.values(RequestStatus);
  typeLabels = RequestTypeLabels;

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
        page: 1,
        limit: 5,
      })
      .subscribe((resp) => (this.requests = resp.requests));
  }

  fetchPendingCounts() {
    this.requestService
      .getPendingCounts()
      .subscribe((resp) => (this.pendingCounts = resp));
  }
}
