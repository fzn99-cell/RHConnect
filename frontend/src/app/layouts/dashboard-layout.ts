import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardSidebar } from '../components/dashboard-sidebar';
import { DashboardNavbar } from '../components/dashboard-navbar';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, DashboardSidebar, DashboardNavbar],
  template: `
    <div class="min-h-screen bg-gray-200 flex flex-col">
      <main class="flex-1 flex">
        <app-dashboard-sidebar></app-dashboard-sidebar>

        <section class="flex-1 overflow-x-auto">
          <app-dashboard-navbar></app-dashboard-navbar>
          <div class="p-6 w-full overflow-x-auto">
          <router-outlet></router-outlet>
          </div>
        </section>
      </main>
    </div>
  `,
})
export class DashboardLayout {}
