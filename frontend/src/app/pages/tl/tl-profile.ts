// my-profile.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { User } from '../../types/schema.types';
import { SelfService } from '../../services/self.service';

@Component({
  selector: 'app-tl-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Mon Profil</h1>

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
                  {{
                    getInitials(user.firstName ?? null, user.lastName ?? null)
                  }}
                </div>
              }

              <div>
                <h2 class="text-xl font-semibold text-gray-800">
                  {{ user.fullName || 'Nom non défini' }}
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

          <!-- PROFILE FORM -->
          <form
            [formGroup]="profileForm"
            (ngSubmit)="onSubmit()"
            class="p-6 space-y-6 border-gray-200 rounded-xl w-full bg-white"
          >
            <!-- Personal Info -->
            <div
              class="space-y-4 w-full p-4 border border-gray-200 rounded-xl bg-gray-50"
            >
              <h3
                class="text-xl font-semibold text-blue-600 border-b border-gray-200 pb-2"
              >
                Informations Personnelles
              </h3>

              <div
                *ngFor="
                  let field of [
                    'firstName',
                    'lastName',
                    'phone',

                  ]
                "
              >
                <label
                  class="block text-sm font-medium text-gray-700 mb-1 capitalize"
                >
                  {{ field }}
                </label>
                <input
                  type="text"
                  [formControlName]="field"
                  class="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <!-- Localisation -->
            <div
              class="space-y-4 w-full p-4 border border-gray-200 rounded-xl bg-gray-50"
            >
              <h3
                class="text-xl font-semibold text-blue-600 border-b border-gray-200 pb-2"
              >
                Localisation
              </h3>

              <div *ngFor="let locField of ['country', 'city']">
                <label
                  class="block text-sm font-medium text-gray-700 mb-1 capitalize"
                >
                  {{ locField }}
                </label>
                <input
                  type="text"
                  [formControlName]="locField"
                  class="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <!-- Preferences -->
            <div
              class="space-y-4 w-full p-4 border border-gray-200 rounded-xl bg-gray-50"
            >
              <h3
                class="text-xl font-semibold text-blue-600 border-b border-gray-200 pb-2"
              >
                Préférences
              </h3>

              <div class="flex flex-col space-y-4">
                <div class="flex items-center gap-3">
                  <input
                    type="checkbox"
                    formControlName="notificationPreference"
                    id="notifications"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label for="notifications" class="text-sm text-gray-700">
                    Recevoir les notifications
                  </label>
                </div>

                <div class="flex items-center gap-3">
                  <input
                    type="checkbox"
                    formControlName="confidentialityPreference"
                    id="confidentiality"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label for="confidentiality" class="text-sm text-gray-700">
                    Préférences de confidentialité
                  </label>
                </div>
              </div>
            </div>

            <!-- System Info (Read-only) -->
            <div
              class="space-y-4 w-full p-4 border border-gray-200 rounded-xl bg-gray-50"
            >
              <h3
                class="text-xl font-semibold text-blue-600 border-b border-gray-200 pb-2"
              >
                Informations Système
              </h3>

              <div
                *ngFor="
                  let sysField of [
                    { label: 'Email', value: user.email },
                    { label: 'Département', value: user.department },
                    { label: 'Rôle', value: user.role },
                    {
                      label: 'Date de création',
                      value: formatDate(user.createdAt),
                    },
                  ]
                "
              >
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ sysField.label }}
                </label>
                <input
                  type="text"
                  [value]="sysField.value"
                  readonly
                  class="w-full px-3 py-2 border border-gray-300 bg-gray-100 text-gray-500 rounded-xl"
                />
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end gap-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                (click)="resetForm()"
                class="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                [disabled]="!profileForm.dirty || updating"
                class="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                @if (updating) {
                  <span class="flex items-center gap-2">
                    <svg
                      class="animate-spin h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Mise à jour...
                  </span>
                } @else {
                  Mettre à jour
                }
              </button>
            </div>
          </form>

          <!-- Change Password Section -->
          <div class="p-6 bg-white border border-gray-200 rounded-xl">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              Changer le mot de passe
            </h3>
            <p class="text-sm text-gray-600 mb-4">
              Pour des raisons de sécurité, utilisez un mot de passe fort.
            </p>
            <button
              class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              (click)="showPasswordModal = true"
            >
              Changer le mot de passe
            </button>
          </div>

          <!-- Change Password Modal -->
          <div
            *ngIf="showPasswordModal"
            class="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center"
          >
            <div class="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
              <h2 class="text-lg font-bold mb-4">Changer le mot de passe</h2>

              <form
                (ngSubmit)="submitPasswordChange()"
                [formGroup]="passwordForm"
                class="space-y-4"
              >
                <input
                  type="password"
                  formControlName="oldPassword"
                  placeholder="Ancien mot de passe"
                  class="w-full px-3 py-2 border rounded"
                  required
                />
                <input
                  type="password"
                  formControlName="newPassword"
                  placeholder="Nouveau mot de passe"
                  class="w-full px-3 py-2 border rounded"
                  required
                />
                <div class="flex justify-end gap-3">
                  <button
                    type="button"
                    (click)="closePasswordModal()"
                    class="px-4 py-2 border rounded"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    class="px-4 py-2 bg-blue-600 text-white rounded"
                    [disabled]="passwordForm.invalid"
                  >
                    Confirmer
                  </button>
                </div>
              </form>

              <div
                *ngIf="passwordChangeMessage"
                class="mt-4 text-sm text-center text-gray-600"
              >
                {{ passwordChangeMessage }}
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class TlProfile implements OnInit {
  private fb = inject(FormBuilder);
  private selfService = inject(SelfService);

  user: User | null = null;
  loading = true;
  updating = false;
  error: string | null = null;

  profileForm: FormGroup = this.fb.group({
    firstName: [''],
    lastName: [''],
    phone: [''],
    country: [''],
    city: [''],
    avatar: ['', Validators.pattern(/^https?:\/\/.+/)],

    notificationPreference: [true],
    confidentialityPreference: [true],
  });

  passwordForm: FormGroup = this.fb.group({
    oldPassword: ['', Validators.required],
    newPassword: ['', Validators.required],
  });

  showPasswordModal = false;
  passwordChangeMessage = '';

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.error = null;

    this.selfService.getMyProfile().subscribe({
      next: ({ user }) => {
        this.user = user;
        this.populateForm(user);
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err.message || 'Erreur lors du chargement du profil';
        this.loading = false;
      },
    });
  }

  populateForm(user: User): void {
    this.profileForm.patchValue({
      firstName: user.firstName || 'First Name not Added',
      lastName: user.lastName || 'Last Name not Added',
      phone: user.phone || 'Phone not Added',
      country: user.country || 'Country not Added',
      city: user.city || 'City not Added',
      avatar: user.avatar || '',

      notificationPreference: user.notificationPreference,
      confidentialityPreference: user.confidentialityPreference,
    });
    this.profileForm.markAsPristine();
  }

  onSubmit(): void {
    if (this.profileForm.invalid || !this.profileForm.dirty) return;

    this.updating = true;
    this.error = null;

    const formData = this.profileForm.value;

    this.selfService.patchMyProfile(formData).subscribe({
      next: ({ user }) => {
        this.user = user;
        this.profileForm.markAsPristine();
        this.updating = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la mise à jour';
        this.updating = false;
      },
    });
  }

  resetForm(): void {
    if (this.user) this.populateForm(this.user);
  }

  submitPasswordChange(): void {
    if (this.passwordForm.invalid) return;

    const oldPassword = this.passwordForm.value.oldPassword?.trim();
    const newPassword = this.passwordForm.value.newPassword?.trim();

    this.selfService.changeMyPassword(oldPassword, newPassword).subscribe({
      next: (res) => {
        this.passwordChangeMessage = res.message;
        this.passwordForm.reset();
      },
      error: (err) => {
        this.passwordChangeMessage =
          err.error?.message || 'Erreur lors du changement de mot de passe';
      },
    });
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
    this.passwordForm.reset();
    this.passwordChangeMessage = '';
  }

  getInitials(firstName: string | null, lastName: string | null): string {
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
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
