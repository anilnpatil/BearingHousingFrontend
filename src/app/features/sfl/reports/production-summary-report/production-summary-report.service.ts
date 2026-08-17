import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductionReportRow } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductionReportService {
  private readonly baseUrl = '/api/reports/productionSummary';

  constructor(private http: HttpClient) {}

  fetchDay(
    from: string,
    to: string,
    sku: string | number,
    shift: number | null
  ): Observable<ProductionReportRow[]> {
    const normalizedSku = this.normalizeSku(sku);

    let params = new HttpParams()
      .set('from', from)
      .set('to', to)
      .set('sku', normalizedSku);

    if (shift !== null) {
      params = params.set('shift', shift.toString());
    }

    return this.http.get<ProductionReportRow[]>(`${this.baseUrl}/day`, { params });
  }

  fetchWeek(
    year: number,
    sku: string | number,
    shift: number | null
  ): Observable<ProductionReportRow[]> {
    const normalizedSku = this.normalizeSku(sku);

    let params = new HttpParams()
      .set('year', year.toString())
      .set('sku', normalizedSku);

    if (shift !== null) {
      params = params.set('shift', shift.toString());
    }

    return this.http.get<ProductionReportRow[]>(`${this.baseUrl}/week`, { params });
  }

  fetchMonth(
    year: number,
    sku: string | number,
    shift: number | null
  ): Observable<ProductionReportRow[]> {
    const normalizedSku = this.normalizeSku(sku);

    let params = new HttpParams()
      .set('year', year.toString())
      .set('sku', normalizedSku);

    if (shift !== null) {
      params = params.set('shift', shift.toString());
    }

    return this.http.get<ProductionReportRow[]>(`${this.baseUrl}/month`, { params });
  }

  private normalizeSku(sku: string | number): string {
    if (sku === null || sku === undefined || sku === '' || sku === 0 || sku === '0') {
      return 'ALL';
    }

    return String(sku);
  }
}
