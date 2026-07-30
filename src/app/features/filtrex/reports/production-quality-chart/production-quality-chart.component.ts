import { Component, ChangeDetectorRef, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartData, ChartOptions } from 'chart.js';

import { ProductionTotalsReportsService } from '../production-totals-reports/production-totals-reports.service';
import { HeaderContentService, FilterConfig } from '../../../../core/services/header-content.service';
import { ViewMode, ProductionTotalsRow } from '../models';

@Component({
  selector: 'app-production-quality-chart',
  standalone: true,
  imports: [
    CommonModule,
    // Needed for `ngModel` in the filter controls
    FormsModule
  ],
  templateUrl: './production-quality-chart.component.html',
  styleUrls: ['./production-quality-chart.component.scss']
})
export class ProductionQualityChartComponent implements OnInit, OnDestroy {

  mode: ViewMode = 'DAY';
  fromDate?: string;
  toDate?: string;
  year?: number;
  sku = 0;
  shift = 0;

  loading = false;
  errorMessage: string | null = null;

  // aggregated values
  total = 0;
  ok = 0;
  notOk = 0;
  okPerc = 0;
  notOkPerc = 0;
  ppm = 0; // parts-per-million (defects per million)

  // inline gradient styles for circles
  okStyle: { [k: string]: string } = {};
  notOkStyle: { [k: string]: string } = {};

  // Per-period cards
  periods: Array<{
    periodKey: string;
    fromDate: string;
    toDate: string;
    totalCount: number;
    okCount: number;
    notOkCount: number;
    okPerc: number;
    notOkPerc: number;
    ppm: number;
    style: { [k: string]: string };
    okLabelWrapper?: string;
    okLabelInner?: string;
    notOkLabelWrapper?: string;
    notOkLabelInner?: string;
  }> = [];

  chartData: ChartData<'pie'> = {
    labels: ['OK', 'NOT OK'],
    datasets: [
      {
        data: [],
        backgroundColor: ['#22c55e', '#ef4444']
      }
    ]
  };

  chartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  private headerContentService = inject(HeaderContentService);
  currentYear = new Date().getFullYear();

  constructor(private service: ProductionTotalsReportsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const today = new Date().toISOString().slice(0, 10);
    this.fromDate = today;
    this.toDate = today;
    this.year = new Date().getFullYear();

    this.setupHeaderFilters();
    this.load();
  }

  ngOnDestroy(): void {
    this.headerContentService.resetHeaderContent();
  }

  private setupHeaderFilters(): void {
    const filters: FilterConfig[] = [
      {
        name: 'mode',
        type: 'select',
        label: 'View',
        value: this.mode,
        options: [
          { label: 'Day', value: 'DAY' },
          { label: 'Week', value: 'WEEK' },
          { label: 'Month', value: 'MONTH' }
        ],
        onChange: (value) => {
          this.mode = value;
          this.setupHeaderFilters();
          this.load();
        }
      },
      {
        name: 'fromDate',
        type: 'date',
        label: 'From',
        value: this.fromDate,
        visible: this.mode === 'DAY',
        onChange: (value) => {
          this.fromDate = value;
          this.load();
        }
      },
      {
        name: 'toDate',
        type: 'date',
        label: 'To',
        value: this.toDate,
        visible: this.mode === 'DAY',
        onChange: (value) => {
          this.toDate = value;
          this.load();
        }
      },
      {
        name: 'year',
        type: 'number',
        label: 'Year',
        value: this.year,
        visible: this.mode !== 'DAY',
        onChange: (value) => {
          this.year = value;
          this.load();
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
          this.load();
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

  load(): void {
    this.loading = true;
    this.updateFilterButtons();
    this.errorMessage = null;

    this.service.fetchTotals(this.mode, {
      fromDate: this.fromDate,
      toDate: this.toDate,
      year: this.year,
      sku: this.sku,
      shift: this.shift
    }).subscribe({
      next: rows => this.map(rows),
      error: (err) => {
        // show friendly message and log
        // eslint-disable-next-line no-console
        console.error('ProductionQualityChart load error', err);
        this.errorMessage = err?.message ?? 'Failed to load quality data';
        this.loading = false;
        this.updateFilterButtons();
        this.cdr.markForCheck();
      }
    });
  }

  private map(rows: ProductionTotalsRow[]): void {
    this.ok = rows.reduce((s, r) => s + r.okCount, 0);
    this.notOk = rows.reduce((s, r) => s + r.notOkCount, 0);
    this.total = rows.reduce((s, r) => s + r.totalCount, 0);

    this.okPerc = this.total ? +(this.ok / this.total * 100).toFixed(1) : 0;
    this.notOkPerc = this.total ? +(this.notOk / this.total * 100).toFixed(1) : 0;

    // PPM = defects / total * 1,000,000
    this.ppm = this.total ? Math.round((this.notOk / this.total) * 1_000_000) : 0;

    // update chart data (keep pie as fallback)
    this.chartData.datasets[0].data = [this.ok, this.notOk];

    // prepare inline styles using conic-gradient for circular ring (per period)
    this.periods = rows.map(r => {
      const okc = r.okCount || 0;
      const nokc = r.notOkCount || 0;
      const tot = r.totalCount || 0;
      const okp = tot ? +(okc / tot * 100).toFixed(1) : 0;
      const nokp = tot ? +(nokc / tot * 100).toFixed(1) : 0;
      const ppmv = tot ? Math.round((nokc / tot) * 1_000_000) : 0;

      const style = {
        // draw OK then NOT OK segments starting at 0
        'background-image': `conic-gradient(#22c55e 0 ${okp}%, #ef4444 ${okp}% 100%)`
      };

      // label positions: compute mid-angles for ok and notOk segments
      const okMid = (okp / 100) * 360 / 2; // midpoint of OK segment
      const notOkMid = (okp / 100) * 360 + (nokp / 100) * 360 / 2; // midpoint of NOT OK segment

      const radius = 48; // px outward from center for labels
      const wrapperOk = `rotate(${okMid}deg) translateX(${radius}px)`;
      const innerOk = `rotate(${-okMid}deg)`;

      const wrapperNotOk = `rotate(${notOkMid}deg) translateX(${radius}px)`;
      const innerNotOk = `rotate(${-notOkMid}deg)`;

      return {
        periodKey: r.periodKey,
        fromDate: r.fromDate,
        toDate: r.toDate,
        totalCount: tot,
        okCount: okc,
        notOkCount: nokc,
        okPerc: okp,
        notOkPerc: nokp,
        ppm: ppmv,
        style
        , okLabelWrapper: wrapperOk
        , okLabelInner: innerOk
        , notOkLabelWrapper: wrapperNotOk
        , notOkLabelInner: innerNotOk
      };
    });

    this.loading = false;
    this.updateFilterButtons();
    this.cdr.markForCheck();
  }
}
