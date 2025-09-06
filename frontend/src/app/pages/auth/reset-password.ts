import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div
      class="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 pt-14"
    >
      <div class="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <!-- Header -->
        <div class="text-center mb-6">
          <i class="fas fa-lock text-indigo-500 text-5xl mb-2"></i>
          <h2 class="text-2xl font-bold text-gray-800">
            Réinitialiser le mot de passe
          </h2>
          <p class="text-gray-500 text-sm">Entrez votre nouveau mot de passe</p>
        </div>

        <!-- Messages -->
        <div
          *ngIf="error()"
          class="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm"
        >
          <i class="fas fa-exclamation-triangle mr-1"></i> {{ error() }}
        </div>
        <div
          *ngIf="success()"
          class="bg-green-100 text-green-600 p-3 rounded mb-4 text-sm"
        >
          <i class="fas fa-check-circle mr-1"></i> {{ success() }}
        </div>

        <!-- Formulaire Réinitialisation -->
        <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label for="password" class="block text-gray-700 font-medium mb-1">
              <i class="fas fa-key mr-1"></i>Nouveau mot de passe
            </label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="••••••••"
              class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <p *ngIf="passwordInvalid()" class="text-red-500 text-xs mt-1">
              Mot de passe requis (min 6 caractères)
            </p>
          </div>

          <!-- Bouton Réinitialiser -->
          <button
            type="submit"
            [disabled]="loading() || resetForm.invalid"
            class="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 rounded font-semibold hover:opacity-90 transition"
          >
            <span
              *ngIf="loading()"
              class="animate-spin mr-2 border-2 border-t-transparent border-white rounded-full w-4 h-4 inline-block"
            ></span>
            {{ loading() ? 'Réinitialisation...' : 'Réinitialiser' }}
          </button>
        </form>

        <!-- Retour à la connexion -->
        <div class="text-center mt-4">
          <a
            class="text-indigo-600 hover:underline text-sm"
            (click)="backToLogin($event)"
          >
            <i class="fas fa-arrow-left mr-1"></i>Retour à la connexion
          </a>
        </div>
      </div>
    </div>
  `,
})
export class ResetPassword {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  email: string | null = null;
  token: string | null = null;

  resetForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor() {
    // Get email & token from query params
    this.route.queryParamMap.subscribe((params) => {
      this.email = params.get('email');
      this.token = params.get('token');
    });
  }

  passwordInvalid() {
    const control = this.resetForm.get('password');
    return control?.invalid && control?.touched;
  }

  onSubmit() {
    if (this.resetForm.invalid || !this.email || !this.token) {
      this.error.set('Lien invalide ou formulaire incomplet.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    const { password } = this.resetForm.value;

    this.authService
      .resetPassword(this.email, this.token, password!)
      .subscribe({
        next: () => {
          this.success.set('Mot de passe réinitialisé avec succès');
          setTimeout(() => this.router.navigate(['/login']), 1500);
        },
        error: () => {
          this.error.set(
            'Échec de la réinitialisation. Lien invalide ou expiré.',
          );
        },
        complete: () => this.loading.set(false),
      });
  }

  backToLogin(event: Event) {
    event.preventDefault();
    this.router.navigate(['/login']);
  }
}
