import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export const RoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const rolesAutorises = route.data['roles'] as string[];

  const user = authService.getUser();
  if (user) {
    return rolesAutorises.includes(user.role);
  }

  // Si l'utilisateur n'est pas encore chargé, on le récupère depuis le backend
  return authService.loadUser().pipe(
    switchMap((utilisateurCharge) => {
      if (utilisateurCharge && rolesAutorises.includes(utilisateurCharge.role)) {
        return of(true);
      } else {
        router.navigate(['/login']);
        return of(false);
      }
    }),
  );
};
