import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  inject
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, interval } from 'rxjs';
import { takeUntil, startWith, switchMap } from 'rxjs/operators';
import { FiltrexApiService, ProductionSummary } from '../sfl-api.service';
import { ErrorService } from '../../../core/services/error.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit, OnDestroy {

  productionData: ProductionSummary = {
    id: 0,
    barcode: '',
    sku: '',
    shift: 0,
    operatorName: '',
    totalPartCount: 0,
    okCount: 0,
    notOkCount: 0,
    cycleStartTime: undefined,
    cycleEndTime: undefined,
    cycleTime: 0,
    productionDateTime: undefined,
    beforeGlueStatus: undefined,
    afterGlueStatus: undefined,
    finalStatus: undefined,
    toxEndLoad: 0,
    toxMidLoad: 0,
    toxStartLoad: 0,
    toxEndDisplacement: 0,
    toxMidDisplacement: 0,
    toxStartDisplacement: 0,
  };

  isLoading = true;
  hasError = false;
  errorMessage = '';
  lastUpdated: string | null = null;

  private destroy$ = new Subject<void>();
  private api = inject(FiltrexApiService);
  private errorService = inject(ErrorService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private startPolling(): void {
    interval(2000)
      .pipe(
        startWith(0),
        takeUntil(this.destroy$),
        switchMap(() => this.api.getLatestProductionSummary())
      )
      .subscribe({
        next: (data) => {
          this.productionData = { ...data };
          this.isLoading = false;
          this.hasError = false;
          this.errorMessage = '';
          this.errorService.clearError();
          this.lastUpdated = data.productionDateTime ?? null;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Dashboard polling error:', error);
          this.hasError = true;
          this.isLoading = false;
          this.errorMessage = this.errorService.handleBackendError(error);
          this.errorService.setError(
            this.errorMessage,
            'Please check your internet connection or contact support if the problem persists.'
          );
          this.cdr.markForCheck();
        }
      });
  }

  retryLoad(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';
    this.errorService.clearError();
    this.cdr.markForCheck();
  }

  shouldShowSecondProcess(): boolean {
    return (this.productionData.numberofProcess ?? 1) > 1;
  }

  getSkuFontSize(): number {
    const skuLength = this.productionData.sku?.length ?? 0;
    return Math.max(0.65, Math.min(2, 2 - Math.max(0, skuLength - 10) * 0.1));
  }

  getProcessStatusLabel(processNumber: number, statusField: 'beforeGlueStatus' | 'afterGlueStatus' | 'graphStatus'): string {
    const processKey = `p${processNumber}_${statusField}`;
    const legacyKey = statusField as keyof ProductionSummary;
    const data = this.productionData as unknown as Record<string, unknown>;
    const status = data[processKey] ?? this.productionData[legacyKey];

    return this.getStatusLabel(status);
  }

  getProcessStatusClass(processNumber: number, statusField: 'beforeGlueStatus' | 'afterGlueStatus' | 'graphStatus'): string {
    const processKey = `p${processNumber}_${statusField}`;
    const legacyKey = statusField as keyof ProductionSummary;
    const data = this.productionData as unknown as Record<string, unknown>;
    return this.getStatusClass(data[processKey] ?? this.productionData[legacyKey]);
  }

  getProcessValue(processNumber: number, field: string): string {
    const key = `p${processNumber}_${field}`;
    const data = this.productionData as unknown as Record<string, unknown>;
    const value = data[key];

    if (value === undefined || value === null || value === '' || value === 0 || value === '0') {
      return '';
    }

    return String(value);
  }

  getDisplayValue(value: unknown): string {
    return value === undefined || value === null || value === '' || value === 0 || value === '0'
      ? ''
      : String(value);
  }

  getCountDisplayValue(value: unknown): string {
    if (value === undefined || value === null || value === '') {
      return '';
    }

    if (value === 0 || value === '0') {
      return '0';
    }

    return String(value);
  }

  getProcessRangeValue(processNumber: number, minField: string, maxField: string): string {
    const minValue = this.getProcessValue(processNumber, minField);
    const maxValue = this.getProcessValue(processNumber, maxField);

    if (!minValue || !maxValue) {
      return '';
    }

    return `${minValue} / ${maxValue}`;
  }

  getStatusLabel(status?: unknown): string {
    if (status === 1 || String(status).trim().toLowerCase() === 'pass') {
      return 'Pass';
    }
    if (status === 2 || String(status).trim().toLowerCase() === 'fail') {
      return 'Fail';
    }
    return '';
  }

  getStatusClass(status: unknown): string {
    const label = this.getStatusLabel(status);
    return label === 'Pass' ? 'status-pass' : label === 'Fail' ? 'status-fail' : 'status-unknown';
  }

  getFinalStatusClass(): string {
    return this.getStatusClass(this.productionData.finalStatus);
  }

  getFinalStatusLabel(): string {
    const label = this.getStatusLabel(this.productionData.finalStatus);
    return label === 'Pass' ? '✅ OK' : label === 'Fail' ? '❌ NOT OK' : '';
  }

}
