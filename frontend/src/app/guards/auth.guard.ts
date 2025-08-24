import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('Vérification AuthGuard :', authService.getUser());

  if (authService.isAuthenticated()) {
    return true;
  }

  console.warn(
    'Non authentifié - Intercepté par AuthGuard — redirection vers /login',
  );
  router.navigate(['/login']); // redirection vers home/login
  return false;
};
