import { Injectable, signal } from '@angular/core';

export interface FilterConfig {
  name: string;
  type: 'select' | 'input' | 'date' | 'number' | 'button' | 'string';
  value?: any;
  options?: Array<{ label: string; value: any }>;
  placeholder?: string;
  label?: string;
  visible?: boolean;
  disabled?: boolean;
  onChange?: (value: any) => void;
}

export interface HeaderContent {
  showTitle?: boolean;
  filters?: FilterConfig[];
  autoApply?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HeaderContentService {
  headerContent = signal<HeaderContent>({
    showTitle: true,
    filters: [],
    autoApply: false
  });

  setHeaderContent(content: HeaderContent): void {
    this.headerContent.set(content);
  }

  setFilters(filters: FilterConfig[]): void {
    const current = this.headerContent();
    this.headerContent.set({
      ...current,
      filters: filters
    });
  }

  resetHeaderContent(): void {
    this.headerContent.set({
      showTitle: true,
      filters: [],
      autoApply: false
    });
  }
}
