import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule, ChartComponent } from 'ng-apexcharts';
import { Subject, takeUntil, lastValueFrom } from 'rxjs';

import {
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexPlotOptions,
  ApexDataLabels,
  ApexStroke,
  ApexFill,
  ApexTooltip,
  ApexLegend,
  ApexGrid,
  ApexAxisChartSeries
} from 'ng-apexcharts';

import { ProductionTotalsReportsService } from '../production-totals-reports/production-totals-reports.service';
import { HeaderContentService, FilterConfig } from '../../../../core/services/header-content.service';
import { ProductionTotalsRow, ViewMode } from '../models';

interface CompareItem {
  id: string;
  name: string;
  sku: number;
  shift: number;
  color: string;
  active: boolean;
}

@Component({
  selector: 'app-production-trend-chart',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './production-trend-chart.component.html',
  styleUrls: ['./production-trend-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductionTrendChartComponent implements OnInit, OnDestroy {

  @ViewChild('chartObj') chartObj!: ChartComponent;

  viewMode: ViewMode = 'DAY';

  fromDate!: string;
  toDate!: string;
  year!: number;

  sku = 0;
  shift = 0;

  loading = false;
  errorMessage: string | null = null;
  
  // Compare mode properties
  compareModeEnabled = false;
  showAddItemModal = false;
  compareItems: CompareItem[] = [];
  availableSKUs = [
    { value: 0, label: 'ALL SKUs' },
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
  ];
  availableShifts = [
    { value: 0, label: 'ALL Shifts' },
    { value: 1, label: 'Shift 1' },
    { value: 2, label: 'Shift 2' },
    { value: 3, label: 'Shift 3' }
  ];
  selectedCompareSKU: number = 0;
  selectedCompareShift: number = 0;
  selectedCompareType: 'sku' | 'shift' = 'sku';
  
  // Color palette for compare items
  private colorPalette = [
    '#5470c6', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', 
    '#9a60b4', '#ea7ccc', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
  ];
  
  // ApexCharts configurations
  public chartSeries: ApexAxisChartSeries = [];
  public chartOptions: ApexChart = {
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
        csv: { filename: 'production-trend-graph' },
        svg: { filename: 'production-trend-graph' },
        png: { filename: 'production-trend-graph' }
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
  
  public xaxisOptions: ApexXAxis = {
    type: 'category',
    tickPlacement: 'on',
    tickAmount: 15,
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
      text: 'Date',
      style: {
        fontSize: '13px',
        fontWeight: 'bold',
        color: '#334155'
      }
    }
  };
  
  public yaxisOptions: ApexYAxis = {
    title: {
      text: 'Production Count',
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
  
  public chartTitle: ApexTitleSubtitle = {
    text: 'Production Trend',
    align: 'left',
    style: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#1e293b'
    }
  };
  
  public plotOptions: ApexPlotOptions = {
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
  
  public dataLabels: ApexDataLabels = {
    enabled: false
  };
  
  public stroke: ApexStroke = {
    show: true,
    width: 1,
    colors: ['transparent']
  };
  
  public fill: ApexFill = {
    opacity: 0.85
  };
  
  public tooltip: ApexTooltip = {
    enabled: true,
    shared: true,
    intersect: false,
    y: {
      formatter: (val: number, { seriesIndex, dataPointIndex, w }: any) => {
        return `${val} units`;
      }
    }
  };
  
  public legend: ApexLegend = {
    position: 'top',
    horizontalAlign: 'center',
    fontSize: '12px',
    fontWeight: '600',
    markers: {
      size: 10,
      strokeWidth: 0,
      shape: 'circle',
      offsetX: 0,
      offsetY: 0
    }
  };
  
  public grid: ApexGrid = {
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
  private headerContentService = inject(HeaderContentService);
  private currentData: ProductionTotalsRow[] = [];
  
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
    this.loadChart();
  }

  ngOnDestroy(): void {
    this.headerContentService.resetHeaderContent();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getXAxisTitle(): string {
    switch (this.viewMode) {
      case 'DAY': return 'Date';
      case 'WEEK': return 'Week';
      case 'MONTH': return 'Month';
      default: return 'Period';
    }
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
          this.xaxisOptions.title = {
            ...this.xaxisOptions.title,
            text: this.getXAxisTitle()
          };
          if (this.compareModeEnabled) {
            this.refreshCompareData();
          } else {
            this.loadChart();
          }
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
          if (this.compareModeEnabled) {
            this.refreshCompareData();
          } else {
            this.loadChart();
          }
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
          if (this.compareModeEnabled) {
            this.refreshCompareData();
          } else {
            this.loadChart();
          }
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
          if (this.compareModeEnabled) {
            this.refreshCompareData();
          } else {
            this.loadChart();
          }
        }
      },
      {
        name: 'sku',
        type: 'select',
        label: '',
        value: this.sku,
        visible: !this.compareModeEnabled,
        options: this.availableSKUs,
        onChange: (value) => {
          this.sku = value;
          this.loadChart();
        }
      },
      {
        name: 'shift',
        type: 'select',
        label: '',
        placeholder: 'ALL',
        value: this.shift,
        visible: !this.compareModeEnabled,
        options: this.availableShifts,
        onChange: (value) => {
          this.shift = value;
          this.loadChart();
        }
      },
      {
        name: 'compareMode',
        type: 'button',
        label: this.compareModeEnabled ? 'Exit Compare Mode' : 'Compare Mode',
        onChange: () => this.toggleCompareMode()
      },
      {
        name: 'apply',
        type: 'button',
        label: this.loading ? 'Loading...' : 'Apply',
        disabled: this.loading,
        visible: !this.compareModeEnabled,
        onChange: () => this.loadChart()
      }
    ];

    this.headerContentService.setFilters(filters);
  }

  toggleCompareMode(): void {
    this.compareModeEnabled = !this.compareModeEnabled;
    
    if (this.compareModeEnabled) {
      this.compareItems = [];
      this.showAddItemModal = true;
    } else {
      this.compareItems = [];
      this.selectedCompareSKU = 0;
      this.selectedCompareShift = 0;
      this.showAddItemModal = false;
      this.loadChart();
    }
    
    this.updateFilterButtons();
    this.cdr.detectChanges();
  }

  addCompareItem(): void {
    if (this.compareItems.length >= this.colorPalette.length) {
      this.errorMessage = 'Maximum compare items reached';
      this.cdr.detectChanges();
      return;
    }
    
    let displayName = '';
    
    if (this.selectedCompareType === 'sku') {
      // Convert to number for comparison
      const skuValue = Number(this.selectedCompareSKU);
      const skuItem = this.availableSKUs.find(s => s.value === skuValue);
      if (skuItem) {
        displayName = skuItem.label;
      } else {
        displayName = `SKU ${skuValue}`;
      }
    } else {
      // Convert to number for comparison
      const shiftValue = Number(this.selectedCompareShift);
      const shiftItem = this.availableShifts.find(s => s.value === shiftValue);
      if (shiftItem) {
        displayName = shiftItem.label;
      } else {
        displayName = `Shift ${shiftValue}`;
      }
    }
    
    console.log('Adding compare item:', {
      type: this.selectedCompareType,
      value: this.selectedCompareType === 'sku' ? Number(this.selectedCompareSKU) : Number(this.selectedCompareShift),
      displayName: displayName
    });
    
    const newItem: CompareItem = {
      id: Date.now().toString(),
      name: displayName,
      sku: Number(this.selectedCompareSKU),  // Convert to number
      shift: Number(this.selectedCompareShift),  // Convert to number
      color: this.colorPalette[this.compareItems.length % this.colorPalette.length],
      active: true
    };
    
    this.compareItems.push(newItem);
    this.showAddItemModal = false;
    this.refreshCompareData();
  }

  removeCompareItem(id: string): void {
    this.compareItems = this.compareItems.filter(item => item.id !== id);
    if (this.compareItems.length === 0) {
      this.showAddItemModal = true;
    }
    this.refreshCompareData();
  }

  clearAllCompareItems(): void {
    this.compareItems = [];
    this.selectedCompareSKU = 0;
    this.selectedCompareShift = 0;
    this.showAddItemModal = true;
    this.refreshCompareData();
  }

  resetCompareToDefault(): void {
    this.compareItems = [];
    this.selectedCompareSKU = 0;
    this.selectedCompareShift = 0;
    this.showAddItemModal = true;
    this.refreshCompareData();
  }

  async refreshCompareData(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;
    
    const activeItems = this.compareItems.filter(item => item.active);
    
    if (activeItems.length === 0) {
      this.chartSeries = [];
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }
    
    try {
      const requests = activeItems.map(item => {
        return lastValueFrom(this.service.fetchTotals(this.viewMode, {
          fromDate: this.fromDate,
          toDate: this.toDate,
          year: this.year,
          sku: item.sku,  // This is already a number now
          shift: item.shift  // This is already a number now
        }));
      });
      
      const results = await Promise.all(requests);
      const validResults = results.filter((result): result is ProductionTotalsRow[] => result !== undefined);
      this.buildCompareChart(activeItems, validResults);
      this.loading = false;
      this.cdr.markForCheck();
    } catch (err: any) {
      this.loading = false;
      this.errorMessage = err?.message ?? 'Failed to load compare data';
      this.cdr.markForCheck();
    }
  }

  private buildCompareChart(items: CompareItem[], allData: ProductionTotalsRow[][]): void {
    const allDates = new Set<string>();
    allData.forEach(data => {
      data.forEach(row => allDates.add(row.periodKey));
    });
    
    const sortedDates = Array.from(allDates).sort();
    
    if (sortedDates.length === 0) {
      this.chartSeries = [];
      return;
    }
    
    this.xaxisOptions = {
      ...this.xaxisOptions,
      categories: sortedDates
    };
    
    const series: ApexAxisChartSeries = [];
    
    items.forEach((item, index) => {
      const data = allData[index];
      const dataMap = new Map(data.map(d => [d.periodKey, d.totalCount]));
      const mappedData = sortedDates.map(date => dataMap.get(date) || 0);
      
      series.push({
        name: item.name,
        type: 'line',
        data: mappedData,
        color: item.color
      });
    });
    
    this.chartSeries = series;
    
    this.chartOptions = {
      ...this.chartOptions,
      type: 'line'
    };

    this.updateExportFilename('production-trend-graph');
    
    this.tooltip = {
      ...this.tooltip,
      shared: true,
      intersect: false,
      x: {
        formatter: (val: string, { dataPointIndex }: any) => {
          return `Date: ${sortedDates[dataPointIndex]}`;
        }
      },
      y: {
        formatter: (val: number) => {
          return `${val} units`;
        }
      }
    };
    
    let maxTotal = 0;
    series.forEach(s => {
      const maxInSeries = Math.max(...(s.data as number[]));
      maxTotal = Math.max(maxTotal, maxInSeries);
    });
    
    this.yaxisOptions = {
      ...this.yaxisOptions,
      max: Math.ceil(maxTotal * 1.1)
    };
    
    this.cdr.detectChanges();
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

  private updateFilterButtons(): void {
    const currentFilters = this.headerContentService.headerContent().filters;
    if (currentFilters && currentFilters.length > 0) {
      const compareBtn = currentFilters.find(f => f.name === 'compareMode');
      if (compareBtn) {
        compareBtn.label = this.compareModeEnabled ? 'Exit Compare Mode' : 'Compare Mode';
      }
      
      const applyBtn = currentFilters.find(f => f.name === 'apply');
      if (applyBtn) {
        applyBtn.label = this.loading ? 'Loading...' : 'Apply';
      }
      
      const skuFilter = currentFilters.find(f => f.name === 'sku');
      const shiftFilter = currentFilters.find(f => f.name === 'shift');
      
      if (skuFilter) skuFilter.visible = !this.compareModeEnabled;
      if (shiftFilter) shiftFilter.visible = !this.compareModeEnabled;
      if (applyBtn) applyBtn.visible = !this.compareModeEnabled;
    }
  }

  loadChart(): void {
    this.loading = true;
    this.errorMessage = null;
    this.updateFilterButtons();

    this.service.fetchTotals(this.viewMode, {
      fromDate: this.fromDate,
      toDate: this.toDate,
      year: this.year,
      sku: this.sku,
      shift: this.shift
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: rows => {
        this.currentData = rows || [];
        this.buildChart(this.currentData);
        this.updateExportFilename('production-trend-graph');
        this.loading = false;
        this.updateFilterButtons();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;        
        this.errorMessage = err?.message ?? 'Failed to load production data. Please try again.';
        this.updateFilterButtons();
        this.cdr.markForCheck();
      }
    });
  }

  private buildChart(rows: ProductionTotalsRow[]): void {
    if (!rows || rows.length === 0) {
      this.chartSeries = [];
      this.errorMessage = 'No data available for the selected criteria';
      return;
    }

    this.chartOptions = {
      ...this.chartOptions,
      type: 'bar'
    };

    const categories = rows.map(r => r.periodKey);
    const totalCounts = rows.map(r => r.totalCount);
    const okCounts = rows.map(r => r.okCount);
    const notOkCounts = rows.map(r => r.notOkCount);

    const okPercentages = rows.map(r => 
      r.totalCount ? ((r.okCount / r.totalCount) * 100).toFixed(1) : '0'
    );
    const notOkPercentages = rows.map(r => 
      r.totalCount ? ((r.notOkCount / r.totalCount) * 100).toFixed(1) : '0'
    );

    this.xaxisOptions = {
      ...this.xaxisOptions,
      categories: categories
    };

    this.chartSeries = [
      {
        name: 'Total Production',
        type: 'column',
        data: totalCounts,
        color: '#facc15'
      },
      {
        name: 'OK Production',
        type: 'column',
        data: okCounts,
        color: '#22c55e'
      },
      {
        name: 'NOT OK Production',
        type: 'column',
        data: notOkCounts,
        color: '#ef4444'
      }
    ];

    this.tooltip = {
      ...this.tooltip,
      shared: true,
      intersect: false,
      x: {
        formatter: (val: string, { dataPointIndex }: any) => {
          return `Date: ${categories[dataPointIndex]}`;
        }
      },
      y: {
        formatter: (val: number, { seriesIndex, dataPointIndex, w }: any) => {
          const seriesName = w.config.series[seriesIndex]?.name;
          if (seriesName === 'OK Production') {
            return `${val} units (${okPercentages[dataPointIndex]}%)`;
          } else if (seriesName === 'NOT OK Production') {
            return `${val} units (${notOkPercentages[dataPointIndex]}%)`;
          }
          return `${val} units (100%)`;
        }
      }
    };

    const maxTotal = Math.max(...totalCounts, 10);
    this.yaxisOptions = {
      ...this.yaxisOptions,
      max: maxTotal
    };

    this.cdr.detectChanges();
  }

  onChartClick(event: any): void {
    console.log('Chart clicked:', event);
  }
}