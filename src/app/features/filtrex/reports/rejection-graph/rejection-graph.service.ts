import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface RejectionType {
  rejectionType: string | null;
  count: number;
  period: string;
}

export type ViewMode = 'DAY' | 'WEEK' | 'MONTH';

@Injectable({ providedIn: 'root' })
export class RejectionGraphService {

  // ✅ FIXED URL
  private readonly baseUrl = '/api/reports/rejection-types';

  constructor(private http: HttpClient) {}

  fetchRejections(
    mode: ViewMode,
    params: {
      fromDate?: string;
      toDate?: string;
      year?: number;
      sku?: number;
      shift?: number;
    }
  ): Observable<RejectionType[]> {

    let httpParams = new HttpParams();

    // ✅ SAME LOGIC AS TOTALS
    if (params.sku != null && params.sku !== 0)
      httpParams = httpParams.set('sku', params.sku.toString());

    if (params.shift != null && params.shift !== 0)
      httpParams = httpParams.set('shift', params.shift.toString());

    if (mode === 'DAY') {
      if (params.fromDate) httpParams = httpParams.set('fromDate', params.fromDate);
      if (params.toDate) httpParams = httpParams.set('toDate', params.toDate);

      return this.http
        .get<RejectionType[]>(`${this.baseUrl}/day`, { params: httpParams })
        .pipe(catchError(err => this.handleError(err)));
    }

    if (mode === 'WEEK') {
      if (params.year != null)
        httpParams = httpParams.set('year', params.year.toString());

      return this.http
        .get<RejectionType[]>(`${this.baseUrl}/week`, { params: httpParams })
        .pipe(catchError(err => this.handleError(err)));
    }

    // ✅ MONTH (default)
    if (params.year != null)
      httpParams = httpParams.set('year', params.year.toString());

    return this.http
      .get<RejectionType[]>(`${this.baseUrl}/month`, { params: httpParams })
      .pipe(catchError(err => this.handleError(err)));
  }

  // ✅ SAME ERROR HANDLING AS TOTALS
  private handleError(error: HttpErrorResponse) {
    let message = 'Unknown error occurred';

    if (error.error?.message) {
      message = error.error.message;
    } else if (error.status === 0) {
      message = 'Backend service not reachable';
    } else if (error.status >= 400 && error.status < 500) {
      message = 'Request failed. Check inputs and try again.';
    } else if (error.status >= 500) {
      message = 'Server error. Please try again later.';
    }

    console.error('RejectionGraphService error', {
      status: error.status,
      url: error.url,
      message: error.message,
      body: error.error,
    });

    return throwError(() => new Error(message));
  }
}