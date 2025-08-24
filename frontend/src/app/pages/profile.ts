// profile.ts
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { User } from '../types/schema.types';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">User Profile</h1>

      <!-- Loading -->
      @if (loading) {
        <div class="flex justify-center items-center h-64">
          <div
            class="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"
          ></div>
        </div>
      }

      <!-- Error -->
      @if (error) {
        <div
          class="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg shadow-sm mb-6"
        >
          {{ error }}
        </div>
      }

      <!-- Profile Card -->
      @if (user && !loading) {
        <div class="flex flex-col gap-6 overflow-hidden">
          <!-- Profile Header -->
          <div class="p-6 border-b border-gray-200 rounded-xl bg-white">
            <div class="flex items-center gap-4">
              @if (user.avatar) {
                <img
                  [src]="user.avatar"
                  [alt]="user.fullName || 'Avatar'"
                  class="h-16 w-16 rounded-full border border-gray-200 shadow-sm object-cover"
                />
              } @else {
                <div
                  class="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center text-white text-xl font-bold"
                >
                  {{ getInitials(user.firstName, user.lastName) }}
                </div>
              }

              <div>
                <h2 class="text-xl font-semibold text-gray-800">
                  {{
                    user.fullName ||
                      user.firstName + ' ' + user.lastName ||
                      'N/A'
                  }}
                </h2>
                <p class="text-gray-500">{{ user.email }}</p>
                <span
                  class="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full"
                  [class]="getStatusClass(user.status)"
                >
                  {{ user.status }}
                </span>
              </div>
            </div>
          </div>

          <!-- Info Sections -->
          <div class="grid gap-6">
            <!-- Personal Info -->
            <div
              class="space-y-4 w-full p-4 border border-gray-200 rounded-xl bg-gray-50"
            >
              <h3
                class="text-xl font-semibold text-blue-600 border-b border-gray-200 pb-2"
              >
                Personal Information
              </h3>
              <p>
                <strong>First Name:</strong>
                {{ user.firstName || 'Not provided' }}
              </p>
              <p>
                <strong>Last Name:</strong>
                {{ user.lastName || 'Not provided' }}
              </p>
              <p><strong>Phone:</strong> {{ user.phone || 'Not provided' }}</p>
            </div>

            <!-- Location -->
            <div
              class="space-y-4 w-full p-4 border border-gray-200 rounded-xl bg-gray-50"
            >
              <h3
                class="text-xl font-semibold text-blue-600 border-b border-gray-200 pb-2"
              >
                Location
              </h3>
              <p>
                <strong>Country:</strong> {{ user.country || 'Not provided' }}
              </p>
              <p><strong>City:</strong> {{ user.city || 'Not provided' }}</p>
            </div>

            <!-- System Info -->
            <div
              class="space-y-4 w-full p-4 border border-gray-200 rounded-xl bg-gray-50"
            >
              <h3
                class="text-xl font-semibold text-blue-600 border-b border-gray-200 pb-2"
              >
                System Information
              </h3>
              <p><strong>Email:</strong> {{ user.email }}</p>
              <p><strong>Department:</strong> {{ user.department || 'N/A' }}</p>
              <p><strong>Role:</strong> {{ user.role || 'N/A' }}</p>
              <p>
                <strong>Created At:</strong> {{ formatDate(user.createdAt) }}
              </p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class Profile implements OnInit {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);

  user: User | null = null;
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    const userId = Number(this.route.snapshot.paramMap.get('id'));
    if (!userId) {
      this.error = 'Invalid user ID';
      this.loading = false;
      return;
    }

    this.userService.getUserById(userId).subscribe({
      next: ({ user }) => {
        this.user = user;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load user profile';
        this.loading = false;
      },
    });
  }

  getInitials(firstName?: string | null, lastName?: string | null): string {
    const first = firstName?.charAt(0).toUpperCase() || '';
    const last = lastName?.charAt(0).toUpperCase() || '';
    return first + last || 'U';
  }

  getStatusClass(status: string): string {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    return (
      statusClasses[status as keyof typeof statusClasses] ||
      'bg-gray-100 text-gray-800'
    );
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
