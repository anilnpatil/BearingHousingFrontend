import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CupConsumptionReportRow {
  period: string;
  shift: number;
  cupConsumed: number;
}

@Injectable({ providedIn: 'root' })
export class CupConsumptionReportService {
  private readonly baseUrl = '/api/reports/cupConsumption';

  constructor(private http: HttpClient) {}

  fetchDay(from: string, to: string, shift: number | null): Observable<CupConsumptionReportRow[]> {
    let params = new HttpParams().set('from', from).set('to', to);
    return this.withShift(`${this.baseUrl}/day`, params, shift);
  }

  fetchMonth(year: number, month: number, shift: number | null): Observable<CupConsumptionReportRow[]> {
    let params = new HttpParams().set('year', year.toString());
    if (month > 0) {
      params = params.set('month', month.toString());
    }
    return this.withShift(`${this.baseUrl}/month`, params, shift);
  }

  fetchYear(year: number, shift: number | null): Observable<CupConsumptionReportRow[]> {
    const params = new HttpParams().set('year', year.toString());
    return this.withShift(`${this.baseUrl}/year`, params, shift);
  }

  private withShift(url: string, params: HttpParams, shift: number | null): Observable<CupConsumptionReportRow[]> {
    if (shift !== null) {
      params = params.set('shift', shift.toString());
    }
    return this.http.get<CupConsumptionReportRow[]>(url, { params });
  }
}
