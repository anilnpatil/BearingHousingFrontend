import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import {
  FiltrexApiService,
  ProductionSummary,
  PagedResponse
} from '../../filtrex-api.service';
import { HeaderContentService, FilterConfig } from '../../../../core/services/header-content.service';
import { ReportFullscreenService } from '../../../../core/services/report-fullscreen.service';

@Component({
  selector: 'app-view-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './view-report.component.html',
  styleUrls: ['./view-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewReportComponent implements OnInit, OnDestroy {

  startDate: string = '';
  endDate: string = '';
  shift = 0;
  sku = 0;

  data: ProductionSummary[] = [];
  loading = false;
  errorMessage: string | null = null;
  hasMultipleProcessRows = false;

  /** Pagination */
  page = 0;
  pageInput = 1;
  size = 15;
  totalElements = 0;
  totalPages = 0;

  private destroy$ = new Subject<void>();
  private api = inject(FiltrexApiService);
  private cdr = inject(ChangeDetectorRef);
  private headerContentService = inject(HeaderContentService);
  private reportFullscreenService = inject(ReportFullscreenService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  isReportFullscreen = this.reportFullscreenService.isFullscreen;

  ngOnInit(): void {
    this.reportFullscreenService.setFullscreen(true);

    const params = this.route.snapshot.queryParams as Record<string, string>;
    const today = this.formatDate(new Date());
    this.startDate = params['startDate'] || today;
    this.endDate = params['endDate'] || today;
    this.shift = params['shift'] ? Number(params['shift']) : 0;
    this.sku = params['sku'] ? Number(params['sku']) : 0;

    const pageNumber = Number(params['page']);
    this.page = Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber - 1 : 0;
    this.pageInput = this.page + 1;

    this.setupHeaderFilters();
    this.fetchData(false);
  }

  /** Open barcode search report for the clicked row */
  openBarcode(item: ProductionSummary): void {
    if (!item || !item.barcode) {
      return;
    }

    this.router.navigate(['barcode-search-report'], {
      state: { barcode: String(item.barcode), from: 'view-reports' }
    });
  }

  shouldShowSecondProcess(): boolean {
    return this.hasMultipleProcessRows;
  }

  shouldShowProcess(row: ProductionSummary, processNumber: number): boolean {
    const processCount = row.numberofProcess ?? 1;
    return processCount >= processNumber;
  }

  ngOnDestroy(): void {
    this.reportFullscreenService.setFullscreen(false);
    this.headerContentService.resetHeaderContent();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupHeaderFilters(): void {
    const filters: FilterConfig[] = [
      {
        name: 'startDate',
        type: 'date',
        label: 'From',
        value: this.startDate,
        onChange: (value) => {
          this.startDate = value;
          this.fetchData(true);
        }
      },
      {
        name: 'endDate',
        type: 'date',
        label: 'To',
        value: this.endDate,
        onChange: (value) => {
          this.endDate = value;
          this.fetchData(true);
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
        ],
        onChange: (value) => {
          this.sku = value;          
          this.fetchData(true);
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
          this.fetchData(true);;
        }
      },
      {
        name: 'apply',
        type: 'button',
        label: this.loading ? 'Loading...' : 'Apply',
        disabled: this.loading,
        onChange: () => this.apply()
      },
      {
        name: 'download',
        type: 'button',
        label: 'Download',
        disabled: this.loading || this.data.length === 0,
        onChange: () => this.downloadReport()
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

      const downloadBtn = currentFilters.find(f => f.name === 'download');
      if (downloadBtn) {
        downloadBtn.disabled = this.loading || this.data.length === 0;
      }
    }
  }

  /** Apply filters */
  apply(): void {
    this.page = 0;
    this.fetchData(true);
  }

  isProcessStatusOk(
    row: ProductionSummary,
    processNumber: number,
    statusField: 'beforeGlueStatus' | 'afterGlueStatus'
  ): boolean {
    return this.getProcessStatusValue(row, processNumber, statusField) === 1;
  }

  getProcessStatusLabel(
    row: ProductionSummary,
    processNumber: number,
    statusField: 'beforeGlueStatus' | 'afterGlueStatus'
  ): string {
    const status = this.getProcessStatusValue(row, processNumber, statusField);

    if (status === 1) {
      return 'OK';
    }

    if (status === 0) {
      return 'NOT OK';
    }

    return 'N/A';
  }

  getProcessValue(
    row: ProductionSummary,
    processNumber: number,
    field: string
  ): string | number {
    const key = `p${processNumber}_${field}`;
    const rowData = row as unknown as Record<string, unknown>;
    const value = rowData[key] ?? rowData[field];

    if (value === undefined || value === null || value === '') {
      return 'N/A';
    }

    return typeof value === 'number' ? value : String(value);
  }

  private getProcessStatusValue(
    row: ProductionSummary,
    processNumber: number,
    statusField: 'beforeGlueStatus' | 'afterGlueStatus'
  ): number | undefined {
    const processKey = `p${processNumber}_${statusField}`;
    const rowData = row as unknown as Record<string, unknown>;
    const value = rowData[processKey] ?? rowData[statusField];

    if (typeof value === 'number') {
      return value;
    }

    return undefined;
  }

  /** Download the current report view as CSV */
  downloadReport(): void {
    if (!this.data.length) {
      return;
    }

    const rows = this.data.map((row) => ({
      productionDateTime: row.productionDateTime ?? '',
      barcode: row.barcode ?? '',
      shift: row.shift ?? '',
      operatorName: row.operatorName ?? '',
      finalStatus: row.finalStatus === 1 ? 'OK' : 'NOT OK',
      P1_BeforeGlueStatus: this.getProcessStatusLabel(row, 1, 'beforeGlueStatus'),
      P1_AfterGlueStatus: this.getProcessStatusLabel(row, 1, 'afterGlueStatus'),
      P1_ToxLoadMax: this.getProcessValue(row, 1, 'toxLoadMax'),
      P1_ToxLoadActual: this.getProcessValue(row, 1, 'toxLoadActual'),
      P1_ToxLoadMin: this.getProcessValue(row, 1, 'toxLoadMin'),
      P1_ToxDisplacementMax: this.getProcessValue(row, 1, 'toxDisplacementMax'),
      P1_ToxDisplacementActual: this.getProcessValue(row, 1, 'toxDisplacementActual'),
      P1_ToxDisplacementMin: this.getProcessValue(row, 1, 'toxDisplacementMin'),
      P2_BeforeGlueStatus: this.getProcessStatusLabel(row, 2, 'beforeGlueStatus'),
      P2_AfterGlueStatus: this.getProcessStatusLabel(row, 2, 'afterGlueStatus'),
      P2_ToxLoadMax: this.getProcessValue(row, 2, 'toxLoadMax'),
      P2_ToxLoadActual: this.getProcessValue(row, 2, 'toxLoadActual'),
      P2_ToxLoadMin: this.getProcessValue(row, 2, 'toxLoadMin'),
      P2_ToxDisplacementMax: this.getProcessValue(row, 2, 'toxDisplacementMax'),
      P2_ToxDisplacementActual: this.getProcessValue(row, 2, 'toxDisplacementActual'),
      P2_ToxDisplacementMin: this.getProcessValue(row, 2, 'toxDisplacementMin'),
      cycleTime: row.cycleTime ?? ''
    }));

    const headers = Object.keys(rows[0]);
    const csvContent = this.buildCsvContent(headers, rows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = this.buildDownloadFilename();
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // buildDownloadFilename(): string {
  //   const now = new Date();
  //   const stamp = now.toISOString().replace(/[:.]/g, '-');
  //   const parts = ['report', this.startDate || 'all', this.endDate || 'all'];

  //   if (this.shift !== 0) {
  //     parts.push(`shift-${this.shift}`);
  //   }

  //   if (this.sku !== 0) {
  //     parts.push(`sku-${this.sku}`);
  //   }

  //   return `${parts.join('-')}-${stamp}.csv`;
  // }

  buildDownloadFilename(): string {
  const now = new Date();

  const timeStamp = [
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0')
  ].join('-');

  const parts = [
    'report',
    this.startDate || 'all',
    'to',
    this.endDate || 'all'
  ];

  if (this.shift !== 0) {
    parts.push(`shift-${this.shift}`);
  }

  if (this.sku !== 0) {
    parts.push(`sku-${this.sku}`);
  }

  return `${parts.join('-')}-${timeStamp}.csv`;
}

  private buildCsvContent(headers: string[], rows: Array<Record<string, string | number>>): string {
    const escapeValue = (value: string | number): string => {
      const stringValue = String(value ?? '');
      return /[",\n]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
    };

    const headerLine = headers.map(escapeValue).join(',');
    const bodyLines = rows.map((row) => headers.map((header) => escapeValue(row[header])).join(','));

    return [headerLine, ...bodyLines].join('\n');
  }

  /** Previous page */
  prev(): void {
    if (this.page > 0) {
      this.page--;
      this.fetchData(false);
    }
  }

  /** Next page */
  next(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.fetchData(false);
    }
  }

  /** Go to entered page number */
  goToPage(): void {
    const targetPage = Number(this.pageInput);
    if (!Number.isInteger(targetPage) || targetPage < 1 || targetPage > this.totalPages) {
      return;
    }

    const newPage = targetPage - 1;
    if (newPage !== this.page) {
      this.page = newPage;
      this.fetchData(false);
    }
  }

  /** Core loader */
  private fetchData(reset: boolean): void {
    this.loading = true;
    this.errorMessage = null;
    this.updateFilterButtons();

    const start = this.startDate || this.endDate;
    const end = this.endDate || this.startDate;
    const shiftValue = this.shift === 0 ? undefined : Number(this.shift);
    const skuValue = this.sku === 0 ? undefined : String(this.sku);

    this.api
      .getPagedReportByDateRange(
        start,
        end,
        this.page,
        this.size,
        shiftValue,
        skuValue
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: PagedResponse<ProductionSummary>) => {
          const responsePage = Number(res.number);
          if (Number.isInteger(responsePage) && responsePage >= 0) {
            this.page = responsePage;
          }
          this.pageInput = this.page + 1;
          this.totalPages = Number.isInteger(res.totalPages) ? res.totalPages : Number(res.totalPages) || 0;
          this.totalElements = Number.isInteger(res.totalElements) ? res.totalElements : Number(res.totalElements) || 0;
          // navigating pages.
          this.data = res.content;
          this.hasMultipleProcessRows = this.data.some((row) => (row.numberofProcess ?? 1) > 1);

          this.loading = false;
          this.errorMessage = null;
          this.updateFilterButtons();
          this.cdr.markForCheck();
          this.updateRouteQueryParams();

          setTimeout(() => this.scrollToTop(), 0);
        },
        error: (err) => {          
          // console.error('Report fetch error', err);
          this.data = [];
          this.loading = false;
          this.errorMessage = err?.message ?? 'Failed to load report data. Please try again or adjust your filters.';
          this.updateFilterButtons();
          this.cdr.markForCheck();
        }
      });
  }

  /** Update the URL query parameters to preserve current table state */
  private updateRouteQueryParams(): void {
    const queryParams: any = {
      startDate: this.startDate,
      endDate: this.endDate,
      page: Number.isInteger(this.page) ? this.page + 1 : 1,
      size: this.size
    };

    if (this.shift !== 0) {
      queryParams.shift = this.shift;
    }

    if (this.sku !== 0) {
      queryParams.sku = this.sku;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true
    });
  }

  /** Ensure the table wrapper is scrolled to show the top of the page */
  private scrollToTop(): void {
    try {
      const wrapper = document.querySelector('.table-wrapper') as HTMLElement | null;
      if (wrapper) {
        wrapper.scrollTop = 0;
      } else {        
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    } catch (e) {      
      // console.warn('scrollToTop failed', e);
    }
  }

  /** Date helper */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

