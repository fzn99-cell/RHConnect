import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div
      class="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-500 to-red-600 pt-14"
    >
      <div class="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <!-- Header -->
        <div class="text-center mb-6">
          <i class="fas fa-user-cog text-red-500 text-5xl mb-2"></i>
          <h2 class="text-2xl font-bold text-gray-800">
            Réinitialiser le mot de passe utilisateur
          </h2>
          <p class="text-gray-500 text-sm">Saisissez un nouveau mot de passe</p>
        </div>

        <!-- Error -->
        <div
          *ngIf="error()"
          class="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm"
        >
          <i class="fas fa-exclamation-triangle mr-1"></i> {{ error() }}
        </div>

        <!-- Success -->
        <div
          *ngIf="success()"
          class="bg-green-100 text-green-600 p-3 rounded mb-4 text-sm"
        >
          <i class="fas fa-check-circle mr-1"></i> {{ success() }}
        </div>

        <!-- Reset Password Form -->
        <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <!-- Password -->
          <div>
            <label for="password" class="block text-gray-700 font-medium mb-1">
              <i class="fas fa-lock mr-1"></i>Nouveau mot de passe
            </label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="••••••••"
              class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <p *ngIf="passwordInvalid()" class="text-red-500 text-xs mt-1">
              Minimum 8 caractères requis
            </p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="loading() || resetForm.invalid"
            class="w-full bg-gradient-to-r from-pink-500 to-red-600 text-white py-2 rounded font-semibold hover:opacity-90 transition"
          >
            <span
              *ngIf="loading()"
              class="animate-spin mr-2 border-2 border-t-transparent border-white rounded-full w-4 h-4 inline-block"
            ></span>
            {{ loading() ? 'En cours...' : 'Réinitialiser le mot de passe' }}
          </button>
        </form>

        <!-- Back Link -->
        <div class="text-center mt-4">
          <a
            class="text-red-600 hover:underline text-sm"
            (click)="goBack($event)"
          >
            <i class="fas fa-arrow-left mr-1"></i>Retour
          </a>
        </div>
      </div>
    </div>
  `,
})
export class AdminResetPassword {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  userId = Number(this.route.snapshot.paramMap.get('id'));

  resetForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  passwordInvalid() {
    const control = this.resetForm.get('password');
    return control?.invalid && control?.touched;
  }

  onSubmit() {
    if (this.resetForm.invalid) return;

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    const { password } = this.resetForm.value;

    this.adminService.resetUserPassword(this.userId, password!).subscribe({
      next: () => {
        this.success.set('Mot de passe réinitialisé avec succès.');
      },
      error: (err) => {
        const msg = err?.error?.error || 'Erreur lors de la réinitialisation.';
        this.error.set(msg);
      },
      complete: () => this.loading.set(false),
    });
  }

  goBack(event: Event) {
    event.preventDefault();
    this.router.navigate(['/admin/users']);
  }
}
