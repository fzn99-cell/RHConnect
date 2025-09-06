import { Component, OnInit } from '@angular/core';
import { LinkComponent } from '../components/link';
import { AuthService } from '../services/auth.service';

import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [LinkComponent],
  template: `
    <div
      class="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-200"
    >
      <div class="bg-white shadow-lg rounded-xl p-8 max-w-lg text-center">
        <h1 class="text-3xl font-extrabold text-blue-700 mb-8">
          Système de gestion RH
        </h1>
        <p class="text-gray-600 text-lg mb-8">
          Gérez facilement les employés, la paie et la présence avec notre
          solution moderne.
        </p>
        <app-link to="/dashboard" color="primary" class="text-lg font-semibold">
          Aller au tableau de bord
        </app-link>
      </div>
    </div>
  `,
})
export class Home implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
    } else {
      this.router.navigate(['/login']);
    }
  }
}
