import { Component, input, output, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
})
export class SidebarComponent {
  open = input.required<boolean>();
  close = output<void>();

  private auth = inject(AuthService);
  private router = inject(Router);

  isAdmin(): boolean {
    return this.auth.hasRole('ADMIN');
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
    this.close.emit();
  }
}
