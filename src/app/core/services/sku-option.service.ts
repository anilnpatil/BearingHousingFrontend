import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SkuOption {
  id: number;
  value: string;
}

@Injectable({ providedIn: 'root' })
export class SkuOptionService {
  private readonly endpoint = '/api/sku-options';

  constructor(private http: HttpClient) {}

  getAll(): Observable<SkuOption[]> {
    return this.http.get<SkuOption[]>(this.endpoint);
  }

  add(value: string): Observable<SkuOption> {
    return this.http.post<SkuOption>(this.endpoint, { value });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}