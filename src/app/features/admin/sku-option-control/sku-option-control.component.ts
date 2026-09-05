import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SkuOption, SkuOptionService } from '../../../core/services/sku-option.service';

@Component({
  selector: 'app-sku-option-control',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sku-option-control.component.html',
  styleUrls: ['./sku-option-control.component.scss']
})
export class SkuOptionControlComponent implements OnInit {
  options = signal<SkuOption[]>([]);
  value = '';
  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  message = signal<string | null>(null);

  constructor(private service: SkuOptionService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: options => {
        this.options.set(options);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Unable to load SKU values.');
        this.loading.set(false);
      }
    });
  }

  add(): void {
    const value = this.value.trim();
    if (!value) {
      this.error.set('Enter a SKU value.');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.message.set(null);
    this.service.add(value).subscribe({
      next: option => {
        this.options.update(options => [...options, option]);
        this.value = '';
        this.message.set('SKU added successfully.');
        this.saving.set(false);
      },
      error: err => {
        this.error.set(err.error?.message || 'Unable to add SKU.');
        this.saving.set(false);
      }
    });
  }

  delete(option: SkuOption): void {
    if (!confirm(`Delete SKU "${option.value}"?`)) {
      return;
    }
    this.service.delete(option.id).subscribe({
      next: () => {
        this.options.update(options => options.filter(item => item.id !== option.id));
        this.message.set('SKU deleted successfully.');
      },
      error: err => this.error.set(err.error?.message || 'Unable to delete SKU.')
    });
  }
}