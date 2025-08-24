import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center min-h-screen bg-[#F5F7FA] pt-14">
      <div class="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <div class="text-center mb-6">
          <i class="fas fa-briefcase text-[#3498DB] text-5xl mb-2"></i>
          <h2 class="text-2xl font-bold text-[#2C3E50]">RHConnect</h2>
          <p class="text-gray-500">Connectez-vous à votre espace RH</p>
        </div>
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class AuthLayout {}
