import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],

  template: `
    <nav
      class="sticky top-0 hidden md:flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200  shadow-sm"
    >
      <!-- Left: Page Title -->
      <div class="text-lg font-semibold text-gray-800">Dashboard</div>

      <!-- Right: User Info -->
      <div class="flex items-center gap-4">
        <!-- User Initials -->
        <div
          class="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm uppercase"
        >
          {{ initials() }}
        </div>

        <!-- Role Display -->
        <div class="text-sm text-gray-700 font-medium">
          {{ roleDisplay() }}
        </div>
      </div>
    </nav>

    <!--  -->
    <!--  -->
    <!--  -->

    <!-- HEADER MOBILE -->
    <header
      class="w-full sticky top-0 bg-white border-b border-gray-200 shadow-sm flex justify-between items-center md:hidden"
    >
      <div class="p-4 flex items-center gap-2">
        <div
          class="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600"
        >
          <h2 class="text-lg font-semibold text-white ">R</h2>
        </div>
        <p class="text-blue-600 mt-1 text-lg font-bold">RHConnect</p>
      </div>

      <!-- Bouton hamburger -->
      <button
        aria-label="Toggle menu"
        (click)="toggleMobileMenu()"
        class="p-4 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600"
      >
        <svg
          *ngIf="!mobileMenuOpen()"
          class="w-6 h-6 text-blue-600"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
        <svg
          *ngIf="mobileMenuOpen()"
          class="w-6 h-6 text-blue-600"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </header>

    <!-- Menu mobile déroulant -->
    <nav
      *ngIf="mobileMenuOpen()"
      class="md:hidden bg-white border-b border-gray-200 shadow-sm "
    >
      <ul class="flex flex-col p-4 space-y-1">
        <li *ngFor="let link of links()" class="text-sm">
          <a
            [routerLink]="link.path"
            routerLinkActive="bg-blue-50 text-blue-600 font-medium"
            class="flex items-center gap-2 px-3 py-3 rounded hover:bg-gray-100 transition"
            (click)="closeMobileMenu()"
          >
            <i class="fas fa-angle-right text-gray-400 text-xs"></i>
            {{ link.label }}
          </a>
        </li>

        <li>
          <button
            (click)="logout()"
            class="w-full text-left flex items-center gap-2 px-3 py-3 rounded text-sm text-red-600 hover:bg-red-50 transition"
          >
            <i class="fas fa-sign-out-alt text-red-500"></i>
            Déconnexion
          </button>
        </li>
      </ul>
    </nav>
  `,
})
export class DashboardNavbar {
  private authService = inject(AuthService);

  private router = inject(Router);

  mobileMenuOpen = signal(false);

  user = computed(() => this.authService.getUser());

  initials = () => {
    const user = this.user();
    if (!user) return '';
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase();
  };

  roleDisplay = () => {
    const roleMap: Record<string, string> = {
      admin: 'Administrateur',
      hr: 'Admin RH',
      tl: "Chef d'équipe",
      nurse: 'Infirmier/Infirmière',
      employee: 'Employé',
    };

    const role = this.user()?.role;
    return role && roleMap[role] ? roleMap[role] : 'Unknown';
  };

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
