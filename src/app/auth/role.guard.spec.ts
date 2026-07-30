import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { roleGuard } from './role.guard';
import { AuthService } from './auth.service';

describe('roleGuard', () => {
  it('allows ADMIN role', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: { getRole: () => 'ADMIN' }
        }
      ]
    });

    const guard = TestBed.runInInjectionContext(() =>
      roleGuard('ADMIN')
    );

    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const result = guard(route, state);

    expect(result).toBe(true);
  });
});
