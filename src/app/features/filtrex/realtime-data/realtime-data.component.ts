import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subject } from 'rxjs';
import { startWith, switchMap, takeUntil } from 'rxjs/operators';
import { FiltrexApiService, LiveData } from '../filtrex-api.service';
import { ErrorService } from '../../../core/services/error.service';

@Component({
  selector: 'app-realtime-data',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './realtime-data.component.html',
  styleUrls: ['./realtime-data.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RealtimeDataComponent implements OnInit, OnDestroy {

  liveData!: LiveData;

  partStatusOk = false;
  isLoading = true;
  hasError = false;
  errorMessage = '';

  private destroy$ = new Subject<void>();
  private api = inject(FiltrexApiService);
  private errorService = inject(ErrorService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    interval(2000)
      .pipe(
        startWith(0),
        switchMap(() => this.api.getLiveData()),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data) => {
          if (data && data.length > 0) {
            this.liveData = data[0];
            this.partStatusOk = this.liveData.partStatus === 1;
            this.isLoading = false;
            this.hasError = false;
            this.errorMessage = '';
            this.errorService.clearError();
          }
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Realtime data error:', error);
          this.hasError = true;
          this.isLoading = false;
          this.errorMessage = this.errorService.handleBackendError(error);
          this.errorService.setError(
            this.errorMessage,
            'Unable to fetch real-time machine data. Please check your connection.'
          );
          this.cdr.markForCheck();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  retryLoad(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';
    this.errorService.clearError();
    this.cdr.markForCheck();
  }

  isPositiveStatus(value: number | string | undefined): boolean {
    const normalized = value?.toString().trim().toLowerCase();
    return normalized === '1' || normalized === 'ok' || normalized === 'true';
  }
}
