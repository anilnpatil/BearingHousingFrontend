import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { ProductionTotalsReportsService } from './production-totals-reports.service';
import { HeaderContentService, FilterConfig } from '../../../../core/services/header-content.service';
import { ProductionTotalsRow, ViewMode } from '../models';

@Component({
  selector: 'app-production-totals-reports',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './production-totals-reports.component.html',
  styleUrls: ['./production-totals-reports.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductionTotalsReportsComponent implements OnInit, OnDestroy {

  viewMode: ViewMode = 'DAY';
  fromDate!: string;
  toDate!: string;
  year!: number;
  sku = 0;
  shift = 0;

  data: ProductionTotalsRow[] = [];
  loading = false;
  errorMessage: string | null = null;

  private destroy$ = new Subject<void>();
  private headerContentService = inject(HeaderContentService);

  constructor(
    private service: ProductionTotalsReportsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const today = new Date().toISOString().slice(0, 10);
    this.fromDate = today;
    this.toDate = today;
    this.year = new Date().getFullYear();

    this.setupHeaderFilters();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.headerContentService.resetHeaderContent();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupHeaderFilters(): void {
    const filters: FilterConfig[] = [
      {
        name: 'viewMode',
        type: 'select',
        label: 'View',
        value: this.viewMode,
        options: [
          { label: 'Day', value: 'DAY' },
          { label: 'Week', value: 'WEEK' },
          { label: 'Month', value: 'MONTH' }
        ],
        onChange: (value) => {
          this.viewMode = value;          
          this.setupHeaderFilters();          
          this.loadData();
        }
      },
      {
        name: 'fromDate',
        type: 'date',
        label: 'From',
        value: this.fromDate,
        visible: this.viewMode === 'DAY',
        onChange: (value) => {
          this.fromDate = value;
          this.loadData();
        }
      },
      {
        name: 'toDate',
        type: 'date',
        label: 'To',
        value: this.toDate,
        visible: this.viewMode === 'DAY',
        onChange: (value) => {
          this.toDate = value;
          this.loadData();
        }
      },
      {
        name: 'year',
        type: 'number',
        label: 'Year',
        value: this.year,
        visible: this.viewMode !== 'DAY',
        onChange: (value) => {
          this.year = value;
        }
      },
      {
        name: 'sku',
        type: 'select',
        label: 'SKU',
        placeholder: 'ALL',
        value: this.sku,
        options: [
          { label: '0) ALL', value: 0 },
          { label: '1) SP210', value: 1 },
          { label: '2) DFC Nano', value: 2 },
          { label: '3) 10" STD MATRIKX models', value: 3 },
          { label: '4) DFC Inline RO', value: 4 },
          { label: '5) Havells carbon block', value: 5 },
          { label: '6) Ecowater078', value: 6 },
          { label: '7) Ecowater108', value: 7 },
          { label: '8) DFC Chemiblock', value: 8 },
          { label: '9) Nova family(I Nova & G nova)', value: 9 },
          { label: '10) Livpure', value: 10 },
          { label: '11) Ecowater055', value: 11 },
          { label: '12) DFC MCHPS', value: 12 },
          { label: '13) Aquatru pre', value: 13 },
          { label: '14) Aquatru post', value: 14 }
          // other SKUs can be added dynamically by skuOptions
        ],
        onChange: (value) => {
          this.sku = value;
          this.loadData();
        }
      },
      {
        name: 'shift',
        type: 'select',
        label: 'Shift',
        placeholder: 'ALL',
        value: this.shift,
        options:[
          { label: 'ALL', value: 0 },
          { label: '1', value: 1 },
          { label: '2', value: 2 },
          { label: '3', value: 3 }
        ],
        onChange: (value) => {
          this.shift = value;
          this.loadData();
        }
      },
      {
        name: 'apply',
        type: 'button',
        label: this.loading ? 'Loading...' : 'Apply',
        disabled: this.loading,
        onChange: () => this.loadData()
      }
    ];

    this.headerContentService.setFilters(filters);
  }

  private updateFilterButtons(): void {
    const currentFilters = this.headerContentService.headerContent().filters;
    if (currentFilters && currentFilters.length > 0) {
      const applyBtn = currentFilters.find(f => f.name === 'apply');
      if (applyBtn) {
        applyBtn.label = this.loading ? 'Loading...' : 'Apply';
        applyBtn.disabled = this.loading;
      }
    }
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = null;
    this.data = [];
    this.updateFilterButtons();

    this.service.fetchTotals(this.viewMode, {
      fromDate: this.fromDate,
      toDate: this.toDate,
      year: this.year,
      sku: this.sku || 0,
      shift: this.shift || 0
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: rows => {
        this.data = rows ?? [];
        this.loading = false;
        this.updateFilterButtons();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;                
        // console.error('Failed to load production totals', err);
        this.errorMessage = err?.message ?? 'Failed to load production data. Please try again.';
        this.updateFilterButtons();
        this.cdr.markForCheck();
      }
    });
  }
}
