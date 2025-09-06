import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import { heroChatBubbleLeftRight, heroEye } from '@ng-icons/heroicons/outline';
import { RouterModule } from '@angular/router';
import { ManageRequestsComponent } from '../../components/manage-request';

@Component({
  selector: 'app-admin-manage-requests',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ManageRequestsComponent,
  ],
  providers: [provideIcons({ heroEye, heroChatBubbleLeftRight })],
  template: ` <app-manage-requests></app-manage-requests> `,
})
export class AdminManageRequests {}
