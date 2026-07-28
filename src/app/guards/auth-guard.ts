import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService); 
  const router = inject(Router); 

  if (!authService.isLogado()) {
    router.navigate(['/login']);
    return false;
  }

  const perfisPermitidos = route.data?.['roles'] as Array<string>;

  if (perfisPermitidos) {
    const perfilUsuario = authService.getPerfil();

    if (!perfisPermitidos.includes(perfilUsuario || '')) {
      alert('Acesso Negado! Você não tem permissão para acessar esta área.');
      router.navigate(['/dashboard']);
      return false;
    }
  }
  return true;
};
