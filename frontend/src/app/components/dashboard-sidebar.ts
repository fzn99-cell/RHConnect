import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Sidebar desktop -->
    <aside
      class="w-64 sticky top-0 h-screen bg-white border-r border-gray-200 shadow-sm hidden md:flex flex-col"
    >
      <div class="p-6 border-b border-gray-200 flex items-center gap-2">
        <div
          class="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600"
        >
          <h2 class="text-lg font-semibold text-white ">R</h2>
        </div>
        <p class="text-blue-600 mt-1 text-lg font-bold">RHConnect</p>
      </div>

      <nav class="flex-1 overflow-y-auto p-4">
        <ul class="space-y-1">
          <li *ngFor="let link of links()" class="text-sm">
            <a
              [routerLink]="link.path"
              routerLinkActive="bg-blue-50 text-blue-600 font-medium"
              class="flex items-center gap-2 px-3 py-3 rounded hover:bg-gray-100 transition"
            >
              <i class="fas fa-angle-right text-gray-400 text-xs"></i>
              {{ link.label }}
            </a>
          </li>
        </ul>
      </nav>

      <div class="p-4 border-t border-gray-200">
        <button
          (click)="logout()"
          class="w-full text-left flex items-center gap-2 px-3 py-3 rounded text-sm text-red-600 hover:bg-red-50 transition"
        >
          <i class="fas fa-sign-out-alt text-red-500"></i>
          Déconnexion
        </button>
      </div>
    </aside>
  `,
})
export class DashboardSidebar {
  private authService = inject(AuthService);
  private router = inject(Router);

  mobileMenuOpen = signal(false);

  links = computed(() => {
    const user = this.authService.getUser();

    if (!user) return [];

    switch (user.role) {
      case 'admin':
        return [
          // { label: 'Tableau de bord', path: '/admin-dashboard' },
          { label: 'Gérer les utilisateurs', path: '/admin-manage-users' },
          { label: 'Ajouter un utilisateur', path: '/admin-create-user' },
          // { label: 'Gérer les demandes', path: '/admin-manage-requests' },
          { label: 'Mon profil', path: '/admin-profile' },
        ];
      case 'hr':
        return [
          { label: 'Tableau de bord', path: '/hr-dashboard' },
          { label: 'Gérer les demandes', path: '/hr-manage-requests' },
          { label: 'Mon profil', path: '/hr-profile' },
        ];
      case 'tl':
        return [
          { label: 'Tableau de bord', path: '/tl-dashboard' },
          { label: 'Gérer les demandes', path: '/tl-manage-requests' },
          { label: 'Mon profil', path: '/tl-profile' },
        ];
      case 'nurse':
        return [
          { label: 'Tableau de bord', path: '/nurse-dashboard' },
          { label: 'Gérer les demandes', path: '/nurse-manage-requests' },
          { label: 'Mon profil', path: '/nurse-profile' },
        ];
      case 'employee':
        return [
          { label: 'Tableau de bord', path: '/employee-dashboard' },
          { label: 'Nouvelle demande', path: '/employee-new-request' },
          { label: 'Mon profil', path: '/employee-profile' },
        ];
      default:
        return [];
    }
  });

  toggleMobileMenu() {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']); // navigation vers la page de connexion
      },
      error: (err) => {
        console.error('Échec de la déconnexion', err);
      },
    });
    this.closeMobileMenu();
  }
}
