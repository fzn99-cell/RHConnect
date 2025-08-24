import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div
      class="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 pt-14"
    >
      <div class="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <!-- Header -->
        <div class="text-center mb-6">
          <i class="fas fa-unlock-alt text-indigo-500 text-5xl mb-2"></i>
          <h2 class="text-2xl font-bold text-gray-800">
            Mot de passe oublié ?
          </h2>
          <p class="text-gray-500 text-sm">
            Entrez votre adresse e-mail pour réinitialiser votre mot de passe
          </p>
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

        <!-- Formulaire Mot de passe oublié -->
        <form
          [formGroup]="forgotForm"
          (ngSubmit)="onSubmit()"
          class="space-y-4"
        >
          <!-- Email -->
          <div>
            <label for="email" class="block text-gray-700 font-medium mb-1">
              <i class="fas fa-envelope mr-1"></i>E-mail
            </label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="votre.email@entreprise.com"
              class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <p *ngIf="emailInvalid()" class="text-red-500 text-xs mt-1">
              E-mail requis ou invalide
            </p>
          </div>

          <!-- Bouton Envoyer -->
          <button
            type="submit"
            [disabled]="loading() || forgotForm.invalid"
            class="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 rounded font-semibold hover:opacity-90 transition"
          >
            <span
              *ngIf="loading()"
              class="animate-spin mr-2 border-2 border-t-transparent border-white rounded-full w-4 h-4 inline-block"
            ></span>
            {{ loading() ? 'Envoi...' : 'Réinitialiser' }}
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
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  emailInvalid() {
    const control = this.forgotForm.get('email');
    return control?.invalid && control?.touched;
  }

  onSubmit() {
    if (this.forgotForm.invalid) return;

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    const { email } = this.forgotForm.value;

    // Simulate API call
    this.authService.sendPasswordReset(email!).subscribe({
      next: () => {
        this.success.set('Un email de réinitialisation a été envoyé');
      },
      error: () => {
        this.error.set('Une erreur est survenue. Veuillez réessayer');
      },
      complete: () => this.loading.set(false),
    });
  }

  backToLogin(event: Event) {
    event.preventDefault();
    this.router.navigate(['/login']);
  }
}
