import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const funcionarioGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredCargo = route.data['cargo'] as string[]; 

  if (authService.isAuthenticated() && authService.getUsuarioTipo() === 'FUNCIONARIO') {
    if (requiredCargo && requiredCargo.length > 0) {
      const userCargo = authService.getUsuarioCargo();
      if (userCargo && requiredCargo.includes(userCargo)) {
        return true;
      } else {
        console.warn(`Acesso negado: Cargo '${userCargo}' não tem permissão para '${requiredCargo.join(', ')}' em ${state.url}`);
        router.navigate(['/login']); 
        return false;
      }
    }
    return true;
  } else {
    console.warn('Acesso negado: Não é funcionário ou não autenticado.');
    authService.logout(); 
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};