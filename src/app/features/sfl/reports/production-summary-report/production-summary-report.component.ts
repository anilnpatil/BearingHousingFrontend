import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { ProductionReportService } from './production-summary-report.service';
import { HeaderContentService, FilterConfig } from '../../../../core/services/header-content.service';
import {
  ProductionReportRow,
  ProductionReportViewRow,
  SummaryDateBlock,
} from '../models';

type ViewType = 'DAY' | 'WEEK' | 'MONTH';

@Component({
  selector: 'app-view-production-summary-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './production-summary-report.component.html',
  styleUrls: ['./production-summary-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductionReportComponent implements OnInit, OnDestroy {

  from!: string;
  to!: string;
  year = new Date().getFullYear();
  sku = 0;
  shift = 0;
  view: ViewType = 'DAY';
  mode: 'TABLE' | 'SUMMARY' = 'SUMMARY';

  summaryData: SummaryDateBlock[] = [];
  rawData: ProductionReportRow[] = [];
  viewData: ProductionReportViewRow[] = [];
  skuOptions: number[] = [];

  loading = false;
  errorMessage: string | null = null;

  private destroy$ = new Subject<void>();
  private service = inject(ProductionReportService);
  private headerContentService = inject(HeaderContentService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    const today = new Date().toISOString().slice(0, 10);
    this.from = today;
    this.to = today;
    this.year = new Date().getFullYear();

    this.setupHeaderFilters();
    this.load();
  }

  ngOnDestroy(): void {
    this.headerContentService.resetHeaderContent();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupHeaderFilters(): void {
    const filters: FilterConfig[] = [
      {
        name: 'view',
        type: 'select',
        label: 'View',
        value: this.view,
        options: [
          { label: 'Day', value: 'DAY' },
          { label: 'Week', value: 'WEEK' },
          { label: 'Month', value: 'MONTH' }
        ],
        onChange: (value) => {
          this.view = value;
          this.setupHeaderFilters();
          this.loadData();
        }
      },
      {
        name: 'year',
        type: 'number',
        label: 'Year',
        value: this.year,
        visible: this.view !== 'DAY',
        onChange: (value) => {
          this.year = Number(value);
          this.loadData();
        }
      },
      {
        name: 'from',
        type: 'date',
        label: 'From',
        value: this.from,
        visible: this.view === 'DAY',
        onChange: (value) => {
          this.from = value;
          this.loadData();
        }
      },
      {
        name: 'to',
        type: 'date',
        label: 'To',
        value: this.to,
        visible: this.view === 'DAY',
        onChange: (value) => {
          this.to = value;
          this.loadData();
        }
      },
      {
        name: 'sku',
        type: 'select',
        label: 'SKU',
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
        options: [
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

  private loadData(): void {
    const shiftParam = this.shift === 0 ? null : Number(this.shift);

    this.loading = true;
    this.errorMessage = null;
    this.updateFilterButtons();

    let request$;
    if (this.view === 'DAY') {
      request$ = this.service.fetchDay(this.from, this.to, this.sku, shiftParam);
    } else if (this.view === 'WEEK') {
      request$ = this.service.fetchWeek(this.year, this.sku, shiftParam);
    } else {
      request$ = this.service.fetchMonth(this.year, this.sku, shiftParam);
    }

    request$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.rawData = data ?? [];
          this.skuOptions = [...new Set(this.rawData.map(r => r.sku))];
          this.aggregate();
          this.buildSummary();
          this.loading = false;
          this.updateFilterButtons();
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Production report error:', error);
          this.loading = false;
          this.errorMessage =
            error?.message ?? 'Failed to load production report. Please try again.';
          this.updateFilterButtons();
          this.cdr.markForCheck();
        }
      });
  }

  load(): void {
    this.loadData();
  }

  aggregate(): void {
    if (this.view === 'DAY') {
      this.viewData = this.rawData.map(r => ({
        key: r.date,
        sku: r.sku,
        shift: r.shift,
        totalCount: r.totalCount,
        okCount: r.okCount,
        notOkCount: r.notOkCount
      }));
      return;
    }

    const map = new Map<string, ProductionReportViewRow>();

    for (const r of this.rawData) {
      const d = new Date(r.date);
      const key =
        this.view === 'WEEK'
          ? `${d.getFullYear()}-W${this.getISOWeek(d)}`
          : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      const gk = `${key}_${r.sku}_${r.shift}`;

      if (!map.has(gk)) {
        map.set(gk, {
          key,
          sku: r.sku,
          shift: r.shift,
          totalCount: 0,
          okCount: 0,
          notOkCount: 0
        });
      }

      const agg = map.get(gk)!;
      agg.totalCount += r.totalCount;
      agg.okCount += r.okCount;
      agg.notOkCount += r.notOkCount;
    }

    this.viewData = Array.from(map.values());
  }

  buildSummary(): void {
    const map = new Map<string, SummaryDateBlock>();

    for (const r of this.rawData) {
      const key = this.getSummaryKey(r.date);

      if (!map.has(key)) {
        map.set(key, {
          date: key,
          total: 0,
          ok: 0,
          notOk: 0,
          skus: []
        });
      }

      const dateBlock = map.get(key)!;

      dateBlock.total += r.totalCount;
      dateBlock.ok += r.okCount;
      dateBlock.notOk += r.notOkCount;

      let skuRow = dateBlock.skus.find(s => s.sku === r.sku);
      if (!skuRow) {
        skuRow = { sku: r.sku, shifts: {} };
        dateBlock.skus.push(skuRow);
      }

      if (!skuRow.shifts[r.shift]) {
        skuRow.shifts[r.shift] = { total: 0, ok: 0, notOk: 0 };
      }

      skuRow.shifts[r.shift].total += r.totalCount;
      skuRow.shifts[r.shift].ok += r.okCount;
      skuRow.shifts[r.shift].notOk += r.notOkCount;
    }

    this.summaryData = Array.from(map.values());
  }

  private getSummaryKey(dateStr: string): string {
    const d = new Date(dateStr);

    if (this.view === 'DAY') {
      return dateStr;
    }

    if (this.view === 'WEEK') {
      return `${d.getFullYear()}-W${this.getISOWeek(d)}`;
    }

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  private getISOWeek(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}
