import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service'; 

export const clienteGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.getUsuarioTipo() === 'CLIENTE') {
    return true;
  } else {
    console.warn('Acesso negado: Não é cliente ou não autenticado.');
    authService.logout(); 
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};