import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Department, Role, User, UserStatus } from '../../types/schema.types';
import { AdminService } from '../../services/admin.service';
import {
  DepartmentLabels,
  RoleLabels,
  UserStatusLabels,
} from '../../types/enumsWithFrenchLabels';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <ng-container *ngIf="loading; else content">
        <p class="text-gray-500">Loading user details...</p>
      </ng-container>

      <ng-template #content>
        <ng-container *ngIf="error; else userDetails">
          <p class="text-red-600">{{ error }}</p>
        </ng-container>

        <ng-template #userDetails>
          <h2 class="text-2xl font-bold mb-6">User Details</h2>

          <!-- Existing read-only fields -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div *ngFor="let field of fields">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ field.label }}
              </label>
              <div
                class="bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm text-gray-800"
              >
                {{ field.value }}
              </div>
            </div>
          </div>

          <!-- Editable fields for patch -->
          <h3 class="text-xl font-bold mb-2">Edit User</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div *ngFor="let field of editableFields">
              <label class="block text-sm font-medium mb-1">{{
                field.label
              }}</label>

              <!-- Role select -->
              <select
                *ngIf="field.key === 'role'"
                [(ngModel)]="field.value"
                class="border rounded px-2 py-1 w-full"
              >
                <option *ngFor="let role of roles" [value]="role">
                  {{ roleLabels[role] }}
                </option>
              </select>

              <!-- Department select -->
              <select
                *ngIf="field.key === 'department'"
                [(ngModel)]="field.value"
                class="border rounded px-2 py-1 w-full"
              >
                <option *ngFor="let dept of departments" [value]="dept">
                  {{ departmentLabels[dept] }}
                </option>
              </select>

              <!-- Status select -->
              <select
                *ngIf="field.key === 'status'"
                [(ngModel)]="field.value"
                class="border rounded px-2 py-1 w-full"
              >
                <option *ngFor="let status of statuses" [value]="status">
                  {{ statusLabels[status] }}
                </option>
              </select>

              <!-- Boolean switches -->
              <select
                *ngIf="
                  field.key === 'notificationPreference' ||
                  field.key === 'confidentialityPreference'
                "
                [(ngModel)]="field.value"
                class="border rounded px-2 py-1 w-full"
              >
                <option [ngValue]="true">Yes</option>
                <option [ngValue]="false">No</option>
              </select>

              <!-- Default text input -->
              <input
                *ngIf="
                  ![
                    'role',
                    'department',
                    'status',
                    'notificationPreference',
                    'confidentialityPreference',
                  ].includes(field.key)
                "
                type="text"
                [(ngModel)]="field.value"
                class="border rounded px-2 py-1 w-full"
              />
            </div>
          </div>
          <button
            (click)="saveChanges()"
            class="px-4 py-2 bg-blue-600 text-white rounded mb-6"
          >
            Save Changes
          </button>

          <!-- Password reset -->
          <h3 class="text-xl font-bold mb-2">Reset Password</h3>
          <div class="mb-2">
            <input
              type="password"
              [(ngModel)]="newPassword"
              placeholder="New password"
              class="border rounded px-2 py-1 w-full"
            />
          </div>
          <button
            (click)="resetPassword()"
            class="px-4 py-2 bg-green-600 text-white rounded"
          >
            Reset Password
          </button>
        </ng-template>
      </ng-template>
    </div>
  `,
})
export class AdminUserDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private adminService = inject(AdminService);

  user: User | null = null;
  loading = true;
  error: string | null = null;

  fields: Array<{ label: string; value: string | number | boolean }> = [];
  editableFields: Array<{ key: keyof User; label: string; value: any }> = [];
  newPassword = '';

  allowedRoles = [
    { value: Role.employee, label: 'Employé' },
    { value: Role.tl, label: "Chef d'équipe" },
    { value: Role.hr, label: 'Ressources Humaines' },
    { value: Role.nurse, label: 'Infirmière' },
  ];

  roles = this.allowedRoles.map((r) => r.value); // array of strings/enum values
  departments = Object.values(Department);
  statuses = Object.values(UserStatus);

  roleLabels = this.allowedRoles.reduce(
    (acc, r) => {
      acc[r.value] = r.label;
      return acc;
    },
    {} as Record<Role, string>,
  );

  departmentLabels = DepartmentLabels;
  statusLabels = UserStatusLabels;

  ngOnInit() {
    const userId = Number(this.route.snapshot.paramMap.get('userId'));
    if (!userId) {
      this.error = 'No user id provided in route.';
      this.loading = false;
      return;
    }

    this.adminService.getUserById(userId).subscribe({
      next: ({ user }) => {
        this.user = user;

        // Keep original display fields
        this.fields = [
          { label: 'ID', value: user.id },
          { label: 'Full Name', value: user.fullName || '—' },
          { label: 'First Name', value: user.firstName || '—' },
          { label: 'Last Name', value: user.lastName || '—' },
          { label: 'Email', value: user.email || '—' },
          { label: 'Phone', value: user.phone || '—' },
          { label: 'Country', value: user.country || '—' },
          { label: 'City', value: user.city || '—' },
          { label: 'Department', value: user.department },
          { label: 'Role', value: user.role },
          { label: 'Status', value: user.status },
          {
            label: 'Notification Preference',
            value: user.notificationPreference ? 'Yes' : 'No',
          },
          {
            label: 'Confidentiality Preference',
            value: user.confidentialityPreference ? 'Yes' : 'No',
          },
          {
            label: 'Created At',
            value: new Date(user.createdAt).toLocaleString(),
          },
        ];

        // Prepare editable fields for patch
        this.editableFields = [
          { key: 'fullName', label: 'Full Name', value: user.fullName || '' },
          {
            key: 'firstName',
            label: 'First Name',
            value: user.firstName || '',
          },
          { key: 'lastName', label: 'Last Name', value: user.lastName || '' },
          { key: 'phone', label: 'Phone', value: user.phone || '' },
          { key: 'country', label: 'Country', value: user.country || '' },
          { key: 'city', label: 'City', value: user.city || '' },
          {
            key: 'department',
            label: 'Department',
            value: user.department || '',
          },
          { key: 'role', label: 'Role', value: user.role || '' },
          { key: 'status', label: 'Status', value: user.status || '' },
        ];

        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load user details.';
        this.loading = false;
      },
    });
  }

  saveChanges() {
    if (!this.user) return;

    const updates: Partial<User> = {};
    this.editableFields.forEach((f) => (updates[f.key] = f.value));

    this.adminService.patchUser(this.user.id, updates).subscribe({
      next: ({ user }) => {
        this.user = user;
        alert('User updated successfully.');
      },
      error: (err) => {
        console.error(err);
        alert('Failed to update user.');
      },
    });
  }

  resetPassword() {
    if (!this.user) return;
    if (this.newPassword.length < 8) {
      alert('Password must be at least 8 characters.');
      return;
    }

    this.adminService
      .resetUserPassword(this.user.id, this.newPassword)
      .subscribe({
        next: ({ message }) => {
          alert(message);
          this.newPassword = '';
        },
        error: (err) => {
          console.error(err);
          alert('Failed to reset password.');
        },
      });
  }
}
