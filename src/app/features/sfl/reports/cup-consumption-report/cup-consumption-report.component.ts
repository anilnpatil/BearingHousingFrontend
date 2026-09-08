import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { HeaderContentService, FilterConfig } from '../../../../core/services/header-content.service';
import {
  CupConsumptionReportRow,
  CupConsumptionReportService
} from './cup-consumption-report.service';

type ReportView = 'DAY' | 'MONTH' | 'YEAR';

@Component({
  selector: 'app-cup-consumption-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cup-consumption-report.component.html',
  styleUrls: ['./cup-consumption-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CupConsumptionReportComponent implements OnInit, OnDestroy {
  view: ReportView = 'DAY';
  from = '';
  to = '';
  year = new Date().getFullYear();
  month = 0;
  shift = 0;
  rows: CupConsumptionReportRow[] = [];
  loading = false;
  errorMessage: string | null = null;

  private readonly destroy$ = new Subject<void>();
  private readonly service = inject(CupConsumptionReportService);
  private readonly headerContentService = inject(HeaderContentService);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    const today = new Date().toISOString().slice(0, 10);
    this.from = today;
    this.to = today;
    this.setupFilters();
    this.load();
  }

  ngOnDestroy(): void {
    this.headerContentService.resetHeaderContent();
    this.destroy$.next();
    this.destroy$.complete();
  }

  get totalCupConsumed(): number {
    return this.rows.reduce((total, row) => total + (row.cupConsumed ?? 0), 0);
  }

  load(): void {
    this.loading = true;
    this.errorMessage = null;
    this.updateApplyButton();

    const shift = this.shift === 0 ? null : this.shift;
    const request$ = this.view === 'DAY'
      ? this.service.fetchDay(this.from, this.to, shift)
      : this.view === 'MONTH'
        ? this.service.fetchMonth(this.year, this.month, shift)
        : this.service.fetchYear(this.year, shift);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: rows => {
        this.rows = rows ?? [];
        this.loading = false;
        this.updateApplyButton();
        this.cdr.markForCheck();
      },
      error: error => {
        console.error('Cup consumption report error:', error);
        this.rows = [];
        this.loading = false;
        this.errorMessage = error?.message ?? 'Failed to load cup consumption report.';
        this.updateApplyButton();
        this.cdr.markForCheck();
      }
    });
  }

  periodLabel(period: string): string {
    if (this.view === 'YEAR') {
      return period.slice(0, 4);
    }
    if (this.view === 'MONTH') {
      return period.slice(0, 7);
    }
    return period;
  }

  private setupFilters(): void {
    const filters: FilterConfig[] = [
      {
        name: 'view',
        type: 'select',
        label: 'View',
        value: this.view,
        options: [
          { label: 'Day', value: 'DAY' },
          { label: 'Month', value: 'MONTH' },
          { label: 'Year', value: 'YEAR' }
        ],
        onChange: value => {
          this.view = value as ReportView;
          this.setupFilters();
          this.load();
        }
      },
      {
        name: 'from',
        type: 'date',
        label: 'From',
        value: this.from,
        visible: this.view === 'DAY',
        onChange: value => {
          this.from = String(value);
          this.load();
        }
      },
      {
        name: 'to',
        type: 'date',
        label: 'To',
        value: this.to,
        visible: this.view === 'DAY',
        onChange: value => {
          this.to = String(value);
          this.load();
        }
      },
      {
        name: 'year',
        type: 'number',
        label: 'Year',
        value: this.year,
        visible: this.view !== 'DAY',
        onChange: value => {
          this.year = Number(value);
          this.load();
        }
      },
      {
        name: 'month',
        type: 'select',
        label: 'Month',
        value: this.month,
        visible: this.view === 'MONTH',
        options: [
          { label: 'All Months', value: 0 },
          ...Array.from({ length: 12 }, (_, index) => ({
            label: String(index + 1).padStart(2, '0'),
            value: index + 1
          }))
        ],
        onChange: value => {
          this.month = Number(value);
          this.load();
        }
      },
      {
        name: 'shift',
        type: 'select',
        label: 'Shift',
        value: this.shift,
        options: [
          { label: 'All Shifts', value: 0 },
          { label: '1', value: 1 },
          { label: '2', value: 2 },
          { label: '3', value: 3 }
        ],
        onChange: value => {
          this.shift = Number(value);
          this.load();
        }
      },
      {
        name: 'apply',
        type: 'button',
        label: this.loading ? 'Loading...' : 'Apply',
        disabled: this.loading,
        onChange: () => this.load()
      }
    ];

    this.headerContentService.setFilters(filters);
  }

  private updateApplyButton(): void {
    const filters = this.headerContentService.headerContent().filters;
    const apply = filters?.find(filter => filter.name === 'apply');
    if (apply) {
      apply.label = this.loading ? 'Loading...' : 'Apply';
      apply.disabled = this.loading;
    }
  }
}
