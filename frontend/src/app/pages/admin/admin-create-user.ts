// src/app/pages/admin-create-user.ts
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { Role, Department, UserStatus } from '../../types/schema.types';

interface CreateUserRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  department: Department;
  role: Role;
  status: UserStatus;
  notificationPreference: boolean;
  confidentialityPreference: boolean;
  country?: string;
  city?: string;
}

interface CreateUserResponse {
  message: string;
  user: {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
    fullName: string | null;
    phone: string | null;
    department: Department;
    role: Role;
    status: UserStatus;
    createdAt: string;
  };
}

@Component({
  selector: 'app-admin-create-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Créer un Utilisateur</h1>
        <p class="text-gray-600 mt-2">
          Ajouter un nouvel utilisateur au système
        </p>
      </div>

      @if (error) {
        <div
          class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6"
        >
          {{ error }}
        </div>
      }

      @if (success) {
        <div
          class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6"
        >
          {{ success }}
        </div>
      }

      <div class="bg-white shadow rounded-lg">
        <form [formGroup]="createUserForm" (ngSubmit)="onSubmit()" class="p-6">
          <!-- Required Fields -->
          <div class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
              Informations Obligatoires
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Email <span class="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  formControlName="email"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  [class.border-red-500]="
                    createUserForm.get('email')?.invalid &&
                    createUserForm.get('email')?.touched
                  "
                />
                @if (
                  createUserForm.get('email')?.invalid &&
                  createUserForm.get('email')?.touched
                ) {
                  <p class="text-red-500 text-xs mt-1">Email valide requis</p>
                }
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe <span class="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  formControlName="password"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  [class.border-red-500]="
                    createUserForm.get('password')?.invalid &&
                    createUserForm.get('password')?.touched
                  "
                />
                @if (
                  createUserForm.get('password')?.invalid &&
                  createUserForm.get('password')?.touched
                ) {
                  <p class="text-red-500 text-xs mt-1">
                    Mot de passe d'au moins 6 caractères requis
                  </p>
                }
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Rôle <span class="text-red-500">*</span>
                </label>
                <select
                  formControlName="role"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un rôle</option>
                  @for (role of allowedRoles; track role.value) {
                    <option [value]="role.value">{{ role.label }}</option>
                  }
                </select>
                @if (
                  createUserForm.get('role')?.invalid &&
                  createUserForm.get('role')?.touched
                ) {
                  <p class="text-red-500 text-xs mt-1">Rôle requis</p>
                }
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Département</label
                >
                <select
                  formControlName="department"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  @for (dept of departments; track dept.value) {
                    <option [value]="dept.value">{{ dept.label }}</option>
                  }
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Statut</label
                >
                <select
                  formControlName="status"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  @for (stat of statuses; track stat.value) {
                    <option [value]="stat.value">{{ stat.label }}</option>
                  }
                </select>
              </div>
            </div>
          </div>

          <!-- Personal Information -->
          <div class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
              Informations Personnelles
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Prénom</label
                >
                <input
                  type="text"
                  formControlName="firstName"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Nom</label
                >
                <input
                  type="text"
                  formControlName="lastName"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Téléphone</label
                >
                <input
                  type="tel"
                  formControlName="phone"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <!-- <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
                <input type="url" formControlName="avatar"
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       [class.border-red-500]="createUserForm.get('avatar')?.invalid && createUserForm.get('avatar')?.touched">
                @if (createUserForm.get('avatar')?.invalid && createUserForm.get('avatar')?.touched) {
                  <p class="text-red-500 text-xs mt-1">URL valide requise</p>
                }
              </div> -->

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Pays</label
                >
                <input
                  type="text"
                  formControlName="country"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Ville</label
                >
                <input
                  type="text"
                  formControlName="city"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <!-- Preferences -->
          <div class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
              Préférences
            </h2>
            <div class="space-y-4">
              <div class="flex items-center space-x-3">
                <input
                  type="checkbox"
                  formControlName="notificationPreference"
                  id="notifications"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="notifications" class="text-sm text-gray-700"
                  >Activer les notifications</label
                >
              </div>

              <div class="flex items-center space-x-3">
                <input
                  type="checkbox"
                  formControlName="confidentialityPreference"
                  id="confidentiality"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="confidentiality" class="text-sm text-gray-700"
                  >Préférences de confidentialité</label
                >
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              (click)="resetForm()"
              class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Réinitialiser
            </button>
            <button
              type="submit"
              [disabled]="createUserForm.invalid || creating"
              class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (creating) {
                <span class="flex items-center">
                  <svg
                    class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Création...
                </span>
              } @else {
                Créer l'utilisateur
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class AdminCreateUser {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private adminService = inject(AdminService);

  creating = false;
  error: string | null = null;
  success: string | null = null;

  allowedRoles = [
    { value: Role.employee, label: 'Employé' },
    { value: Role.tl, label: "Chef d'équipe" },
    { value: Role.hr, label: 'Ressources Humaines' },
    { value: Role.nurse, label: 'Infirmière' },
  ];

  departments = [
    { value: Department.none, label: 'Aucun' },
    { value: Department.hiring, label: 'Recrutement' },
    { value: Department.technical, label: 'Technique' },
    { value: Department.nurse, label: 'Infirmerie' },
    { value: Department.finance, label: 'Finance' },
    { value: Department.operations, label: 'Opérations' },
    { value: Department.marketing, label: 'Marketing' },
  ];

  statuses = [
    { value: UserStatus.active, label: 'Actif' },
    { value: UserStatus.onLeave, label: 'En congé' },
  ];

  createUserForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['', Validators.required],
    department: [Department.none],
    status: [UserStatus.active],
    firstName: [''],
    lastName: [''],
    phone: [''],
    avatar: ['', Validators.pattern(/^https?:\/\/.+/)],
    country: [''],
    city: [''],
    notificationPreference: [true],
    confidentialityPreference: [true],
  });

  onSubmit(): void {
    if (this.createUserForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.creating = true;
    this.error = null;
    this.success = null;

    const formData: CreateUserRequest = this.createUserForm.value;

    this.adminService.createUser(formData).subscribe({
      next: (res) => {
        this.success = res.message || 'Utilisateur créé avec succès';
        this.resetForm();
        this.creating = false;

        setTimeout(() => {
          this.router.navigate(['/admin-manage-users']);
        }, 2000);
      },
      error: (err) => {
        this.error =
          err?.error?.error ||
          err?.error?.message ||
          'Erreur lors de la création';
        this.creating = false;
      },
    });
  }

  resetForm(): void {
    this.createUserForm.reset({
      department: Department.none,
      status: UserStatus.active,
      notificationPreference: true,
      confidentialityPreference: true,
    });
    this.error = null;
    this.success = null;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.createUserForm.controls).forEach((key) => {
      const control = this.createUserForm.get(key);
      control?.markAsTouched();
    });
  }
}
