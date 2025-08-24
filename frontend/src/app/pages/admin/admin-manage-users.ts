import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { UserStatus, Role, User } from '../../types/schema.types';

@Component({
  selector: 'app-admin-manage-user',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container mx-auto mt-4 p-6 bg-white rounded-xl shadow">
      <h1 class="text-2xl font-bold mb-4">Manage Users</h1>

      <!-- Filters -->
      <form class="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          [(ngModel)]="search"
          name="search"
          placeholder="Search..."
          class="border rounded px-3 py-2 w-64"
          (input)="fetchUsers()"
        />

        <select
          [(ngModel)]="filterRole"
          name="role"
          class="border rounded px-3 py-2"
          (change)="fetchUsers()"
        >
          <option value="">All Roles</option>
          <option *ngFor="let role of roles" [value]="role">
            {{ role }}
          </option>
        </select>

        <select
          [(ngModel)]="filterStatus"
          name="status"
          class="border rounded px-3 py-2"
          (change)="fetchUsers()"
        >
          <option value="">All Statuses</option>
          <option *ngFor="let status of statuses" [value]="status">
            {{ status }}
          </option>
        </select>

        <a
          [routerLink]="['/admin-create-user']"
          class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
        >
          Create User
        </a>
      </form>

      <!-- User Grid -->
      <div class="overflow-x-auto">
        <div
          class="min-w-[40rem] grid grid-cols-4 bg-gray-100 text-sm font-semibold border-b-2 border-gray-200"
        >
          <div class="px-6 py-3">Name</div>
          <div class="pr-6 py-3">Role</div>
          <div class="pr-6 py-3">Status</div>
          <div class="pr-6 py-3">Action</div>
        </div>

        <div
          *ngFor="let user of users"
          class="min-w-[40rem] grid grid-cols-4 border-b border-gray-100 text-sm bg-white hover:shadow-sm transition"
        >
          <div class="px-6 py-3 font-semibold text-gray-800">
            {{ user.fullName || user.firstName + ' ' + user.lastName || 'N/A' }}
          </div>
          <div class="pr-6 py-3 capitalize">{{ user.role }}</div>
          <div class="pr-6 py-3">
            <span
              class="inline-block text-xs font-medium px-3 py-1 rounded-full"
              [ngClass]="{
                'bg-green-100 text-green-800': user.status === 'active',
                'bg-gray-200 text-gray-700': user.status !== 'active',
              }"
            >
              {{ user.status }}
            </span>
          </div>
          <div class="pr-6 py-3">
            <a
              [routerLink]="['/admin-manage-users', user.id]"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-md"
            >
              Details
            </a>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex justify-between mt-4">
        <button (click)="prevPage()" [disabled]="page <= 1">Prev</button>
        <span>Page {{ page }} of {{ totalPages }}</span>
        <button (click)="nextPage()" [disabled]="page >= totalPages">
          Next
        </button>
      </div>
    </div>
  `,
})
export class AdminManageUser implements OnInit {
  adminService = inject(AdminService);

  users: User[] = [];
  page = 1;
  limit = 10;
  totalPages = 1;

  search = '';
  filterRole = '';
  filterStatus = '';

  roles = Object.values(Role);
  statuses = Object.values(UserStatus);

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers() {
    this.adminService
      .getAllUsers({
        page: this.page,
        limit: this.limit,
        search: this.search,
        role: this.filterRole,
        status: this.filterStatus,
      })
      .subscribe({
        next: (res) => {
          this.users = res.users;
          this.totalPages = res.pagination.totalPages;
        },
        error: (err) => {
          console.error('Failed to fetch users:', err);
        },
      });
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.fetchUsers();
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.fetchUsers();
    }
  }
}
