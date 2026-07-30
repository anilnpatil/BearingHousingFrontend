import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from '../header/header';
import { SidebarComponent } from '../sidebar/sidebar';
import { Footer } from '../footer/footer';
import { ErrorDisplayComponent } from '../../../shared/components/error-display/error-display.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    Header,
    SidebarComponent,
    Footer,
    ErrorDisplayComponent
  ],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss'],
})
export class LayoutComponent {
  sidebarOpen = signal(false);
  showHeader = signal(false);
  pageTitle = signal<string>('');
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  constructor() {
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe(event => {      
      const isLoginPage = event.urlAfterRedirects.includes('/login');
      this.showHeader.set(!isLoginPage);
      this.updatePageTitle();
    });
    
    const isLoginPage = this.router.url.includes('/login');
    this.showHeader.set(!isLoginPage);
  }

  private updatePageTitle(): void {
    let route = this.activatedRoute;
    let title = '';

    while (route.firstChild) {
      route = route.firstChild;
      if (route.snapshot.data && route.snapshot.data['title']) {
        title = route.snapshot.data['title'];
        break;
      }
    }

    this.pageTitle.set(title);
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}

