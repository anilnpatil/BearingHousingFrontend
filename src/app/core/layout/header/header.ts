import { Component, output, input, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationService } from '../../services/navigation.service';
import { HeaderContentService } from '../../services/header-content.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class Header {
  toggleSidebar = output<void>();
  pageTitle = input<string>('');
  
  headerContent$ = inject(HeaderContentService).headerContent;
  private navigationService = inject(NavigationService);

  constructor(
    private router: Router,
    private activated: ActivatedRoute
  ) {}

  onToggle(): void {
    this.toggleSidebar.emit();
  }

  onBack(): void {
    this.navigationService.goBack();
  }

  onFilterChange(filter: any, newValue: any): void {
    if (filter.onChange) {
      filter.onChange(newValue);
    }
  }
}

