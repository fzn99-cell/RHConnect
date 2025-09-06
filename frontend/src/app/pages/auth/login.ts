import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div
      class="flex items-center justify-center min-h-screen bg-[#F5F7FA] pt-14"
    >
      <div class="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <!-- Header -->
        <div class="text-center mb-6">
          <i class="fas fa-briefcase text-[#3498DB] text-5xl mb-2"></i>
          <h2 class="text-2xl font-bold text-[#2C3E50]">RHConnect</h2>
          <p class="text-gray-500">Connectez-vous à votre espace RH</p>
        </div>

        <!-- Messages erreur / succès -->
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

        <!-- Formulaire connexion -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
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
              class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#3498DB]"
            />
            <p *ngIf="emailInvalid()" class="text-red-500 text-xs mt-1">
              E-mail requis ou invalide
            </p>
          </div>

          <!-- Mot de passe -->
          <div>
            <label for="password" class="block text-gray-700 font-medium mb-1">
              <i class="fas fa-lock mr-1"></i>Mot de passe
            </label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="••••••••"
              class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#3498DB]"
            />
            <p *ngIf="passwordInvalid()" class="text-red-500 text-xs mt-1">
              Mot de passe requis
            </p>
          </div>

          <!-- Bouton connexion -->
          <button
            type="submit"
            [disabled]="loading() || loginForm.invalid"
            class="w-full bg-[#3498DB] text-white py-2 rounded font-semibold hover:opacity-90 transition"
          >
            <span
              *ngIf="loading()"
              class="animate-spin mr-2 border-2 border-t-transparent border-white rounded-full w-4 h-4 inline-block"
            ></span>
            {{ loading() ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>

        <p class="text-center text-gray-500 text-sm mt-4">En cas de verrouillage du compte, veuillez contacter l’administrateur pour assistance à l’adresse <span class="text-blue-500">email@example.com</span></p>
      </div>
    </div>
  `,
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  emailInvalid() {
    const control = this.loginForm.get('email');
    return control?.invalid && control?.touched;
  }

  passwordInvalid() {
    const control = this.loginForm.get('password');
    return control?.invalid && control?.touched;
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    const { email, password } = this.loginForm.value;
    this.authService.login(email!, password!).subscribe({
      next: () => {
        this.authService.loadUser().subscribe({
          next: (user) => {
            if (user) {
              this.success.set('Connexion réussie');
              this.router.navigate([`/${user.role}-dashboard`]);
            } else {
              this.error.set("Échec de récupération de l'utilisateur.");
            }
            this.loading.set(false);
          },
          error: () => {
            this.error.set("Échec de chargement de l'utilisateur.");
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.error.set('Identifiants invalides');
        this.loading.set(false);
      },
    });
  }

  quickLogin(email: string, password: string) {
    this.loginForm.setValue({ email, password });
    this.onSubmit();
  }

  forgotPassword(event: Event) {
    event.preventDefault();
    this.router.navigate(['/forgot-password']);
  }
}
