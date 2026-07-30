import {
  Component, OnInit, OnDestroy, ChangeDetectionStrategy,
  ChangeDetectorRef, inject, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';

import {
  ApexChart, ApexXAxis, ApexYAxis, ApexTitleSubtitle,
  ApexPlotOptions, ApexDataLabels, ApexFill,
  ApexTooltip, ApexLegend, ApexAxisChartSeries,
  ApexStroke, ApexGrid, ChartComponent
} from 'ng-apexcharts';

import { HeaderContentService, FilterConfig } from '../../../../core/services/header-content.service';
import { RejectionGraphService, RejectionType, ViewMode } from './rejection-graph.service';

@Component({
  selector: 'app-rejection-graph',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './rejection-graph.component.html',
  styleUrls: ['./rejection-graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RejectionGraphComponent implements OnInit, OnDestroy {

  @ViewChild('chartObj') chartObj!: ChartComponent;

  viewMode: ViewMode = 'DAY';

  fromDate!: string;
  toDate!: string;
  year!: number;

  sku = 0;
  shift = 0;

  loading = false;
  errorMessage: string | null = null;

  chartSeries: ApexAxisChartSeries = [];
  chartMinWidth = 800;
  periods: string[] = [];

  chartOptions: ApexChart = {
    type: 'bar',
    height: '100%',
    width: '100%',
    toolbar: {
      show: true,
      tools: {
        zoom: true,
        zoomin: true,
        zoomout: true,
        pan: false,
        reset: true
      },
      export: {
        csv: { filename: 'rejection-graph' },
        svg: { filename: 'rejection-graph' },
        png: { filename: 'rejection-graph' }
      },
      autoSelected: 'zoom'
    },
    zoom: {
      enabled: true,
      type: 'x',
      autoScaleYaxis: true
    },
    animations: {
      enabled: true,
      speed: 300,
      animateGradually: {
        enabled: true,
        delay: 150
      },
      dynamicAnimation: {
        enabled: true,
        speed: 350
      }
    }
  };

  xaxis: ApexXAxis = {
    type: 'category',
    tickPlacement: 'on',
    tickAmount: 15,
    categories: [],
    labels: {
      rotate: -45,
      rotateAlways: false,
      trim: true,
      style: {
        fontSize: '11px',
        fontWeight: '500',
        colors: '#475569'
      }
    },
    title: {
      text: 'Period',
      style: {
        fontSize: '13px',
        fontWeight: 'bold',
        color: '#334155'
      }
    }
  };

  yaxis: ApexYAxis = {
    title: {
      text: 'Count',
      style: {
        fontSize: '13px',
        fontWeight: 'bold',
        color: '#334155'
      }
    },
    labels: {
      style: {
        fontSize: '11px',
        fontWeight: '500',
        colors: '#475569'
      }
    },
    min: 0
  };

  title: ApexTitleSubtitle = {
    text: 'Rejection Count by Type',
    align: 'left',
    style: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#1e293b'
    }
  };

  plotOptions: ApexPlotOptions = {
    bar: {
      horizontal: false,
      columnWidth: '60%',
      borderRadius: 4,
      borderRadiusApplication: 'end',
      dataLabels: {
        position: 'top'
      }
    }
  };

  dataLabels: ApexDataLabels = {
    enabled: false
  };

  fill: ApexFill = { opacity: 0.9 };

  tooltip: ApexTooltip = {
    y: { formatter: (val) => `${val} parts` }
  };

  legend: ApexLegend = { position: 'top' };

  stroke: ApexStroke = {
    show: true,
    width: 1,
    colors: ['transparent']
  };

  grid: ApexGrid = {
    borderColor: '#e2e8f0',
    row: {
      colors: ['#f8fafc', 'transparent'],
      opacity: 0.5
    },
    xaxis: {
      lines: {
        show: true
      }
    }
  };

  private destroy$ = new Subject<void>();
  private headerService = inject(HeaderContentService);

  constructor(
    private service: RejectionGraphService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const today = new Date().toISOString().slice(0, 10);
    this.fromDate = today;
    this.toDate = today;
    this.year = new Date().getFullYear();

    this.setupFilters();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.headerService.resetHeaderContent();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFilters(): void {
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
        onChange: v => {
          this.viewMode = v;
          this.setupFilters();
          this.loadData();
        }
      },
      {
        name: 'fromDate',
        type: 'date',
        label: 'From',
        value: this.fromDate,
        visible: this.viewMode === 'DAY',
        onChange: v => {
          this.fromDate = v;
          this.loadData();
        }
      },
      {
        name: 'toDate',
        type: 'date',
        label: 'To',
        value: this.toDate,
        visible: this.viewMode === 'DAY',
        onChange: v => {
          this.toDate = v;
          this.loadData();
        }
      },
      {
        name: 'year',
        type: 'number',
        label: 'Year',
        value: this.year,
        visible: this.viewMode !== 'DAY',
        onChange: v => {
          this.year = v;
          this.loadData();
        }
      },
      {
        name: 'sku',
        type: 'select',
        value: this.sku,
        options: [
          { label: 'ALL SKUs', value: 0 },
          { value: 1, label: 'SP210' },
          { value: 2, label: 'DFC Nano' },
          { value: 3, label: '10" STD MATRIKX models' },
          { value: 4, label: 'DFC Inline RO' },
          { value: 5, label: 'Havells carbon block' },
          { value: 6, label: 'Ecowater078' },
          { value: 7, label: 'Ecowater108' },
          { value: 8, label: 'DFC Chemiblock' },
          { value: 9, label: 'Nova family(I Nova & G nova)' },
          { value: 10, label: 'Livpure' },
          { value: 11, label: 'Ecowater055' },
          { value: 12, label: 'DFC MCHPS' },
          { value: 13, label: 'Aquatru pre' },
          { value: 14, label: 'Aquatru post' }
        ],
        onChange: v => {
          this.sku = v;
          this.loadData();
        }
      },
      {
        name: 'shift',
        type: 'select',
        value: this.shift,
        options: [
          { label: 'ALL Shifts', value: 0 },
          { value: 1, label: 'Shift 1' },
          { value: 2, label: 'Shift 2' },
          { value: 3, label: 'Shift 3' }
        ],
        onChange: v => {
          this.shift = v;
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

    this.headerService.setFilters(filters);
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = null;

    this.service.fetchRejections(this.viewMode, {
      fromDate: this.fromDate,
      toDate: this.toDate,
      year: this.year,
      sku: this.sku,
      shift: this.shift
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: data => {
        this.buildChart(data);
        this.updateExportFilename('rejection-graph');
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: err => {
        this.errorMessage = err.message;
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private buildChart(data: RejectionType[]): void {
    if (!data || data.length === 0) {
      this.chartSeries = [];
      return;
    }

    const periods = [...new Set(data.map(d => d.period))];
    const sortedPeriods = this.sortPeriods(periods);
    const rejectionTypes = [...new Set(data.map(d => d.rejectionType ?? 'Unknown'))];

    const valueMap = new Map<string, number>();
    data.forEach(item => {
      const type = item.rejectionType ?? 'Unknown';
      valueMap.set(`${item.period}|${type}`, item.count);
    });

    this.xaxis = {
      ...this.xaxis,
      categories: sortedPeriods
    };

    this.periods = sortedPeriods;
    this.chartMinWidth = sortedPeriods.length === 1 ? 400 : Math.max(800, sortedPeriods.length * 100);

    this.chartSeries = rejectionTypes.map(type => ({
      name: type,
      data: sortedPeriods.map(period => valueMap.get(`${period}|${type}`) ?? 0)
    }));
  }

  private updateExportFilename(prefix: string): void {
    const filename = this.getExportFilename(prefix);
    this.chartOptions = {
      ...this.chartOptions,
      toolbar: {
        ...this.chartOptions.toolbar,
        export: {
          csv: { filename },
          svg: { filename },
          png: { filename }
        }
      }
    };
  }

  private getExportFilename(prefix: string): string {
    if (this.viewMode === 'DAY') {
      return `${prefix}_${this.fromDate}_to_${this.toDate}`;
    }

    return `${prefix}_${this.viewMode.toLowerCase()}_${this.year}`;
  }

  private sortPeriods(periods: string[]): string[] {
    if (this.viewMode === 'DAY') {
      return [...periods].sort((a, b) => a.localeCompare(b));
    }

    if (this.viewMode === 'WEEK') {
      return [...periods].sort((a, b) => {
        const aNum = Number(a.replace(/^Week\s+/i, ''));
        const bNum = Number(b.replace(/^Week\s+/i, ''));
        return aNum - bNum;
      });
    }

    return [...periods].sort((a, b) => {
      const aNum = Number(a.replace(/^Month\s+/i, ''));
      const bNum = Number(b.replace(/^Month\s+/i, ''));
      return aNum - bNum;
    });
  }
}