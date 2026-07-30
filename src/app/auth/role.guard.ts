import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService, UserRole } from './auth.service';

export const roleGuard = (role: UserRole): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const current = authService.getRole();
    
    if (role === 'ADMIN') {
      return current === 'ADMIN';
    }
    
    if (role === 'USER') {
      return current === 'USER' || current === 'ADMIN';
    }
    
    return false;
  };
};
