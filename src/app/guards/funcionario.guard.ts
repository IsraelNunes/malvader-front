import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service'; // Importe seu AuthService

export const funcionarioGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredCargo = route.data['cargo'] as string[]; // Espera um array de cargos, ex: ['GERENTE']

  if (authService.isAuthenticated() && authService.getUsuarioTipo() === 'FUNCIONARIO') {
    if (requiredCargo && requiredCargo.length > 0) {
      const userCargo = authService.getUsuarioCargo();
      if (userCargo && requiredCargo.includes(userCargo)) {
        return true;
      } else {
        console.warn(`Acesso negado: Cargo '${userCargo}' não tem permissão para '${requiredCargo.join(', ')}' em ${state.url}`);
        router.navigate(['/login']); // Ou uma página de acesso negado
        return false;
      }
    }
    return true; // É FUNCIONARIO e não tem restrição de cargo específica
  } else {
    console.warn('Acesso negado: Não é funcionário ou não autenticado.');
    authService.logout(); // Garante que sessões inválidas sejam limpas
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};