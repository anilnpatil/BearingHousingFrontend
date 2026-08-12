import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductionReportRow } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductionReportService {
  private readonly baseUrl =
    'http://localhost:8083/api/reports/productionSummary';

  constructor(private http: HttpClient) {}

  fetchDay(
    from: string,
    to: string,
    sku: number,
    shift: number | null
  ): Observable<ProductionReportRow[]> {
    let params = new HttpParams()
      .set('from', from)
      .set('to', to)
      .set('sku', sku);

    if (shift !== null) {
      params = params.set('shift', shift.toString());
    }

    return this.http.get<ProductionReportRow[]>(`${this.baseUrl}/day`, { params });
  }

  fetchWeek(
    year: number,
    sku: number,
    shift: number | null
  ): Observable<ProductionReportRow[]> {
    let params = new HttpParams()
      .set('year', year.toString())
      .set('sku', sku);

    if (shift !== null) {
      params = params.set('shift', shift.toString());
    }

    return this.http.get<ProductionReportRow[]>(`${this.baseUrl}/week`, { params });
  }

  fetchMonth(
    year: number,
    sku: number,
    shift: number | null
  ): Observable<ProductionReportRow[]> {
    let params = new HttpParams()
      .set('year', year.toString())
      .set('sku', sku);

    if (shift !== null) {
      params = params.set('shift', shift.toString());
    }

    return this.http.get<ProductionReportRow[]>(`${this.baseUrl}/month`, { params });
  }
}
