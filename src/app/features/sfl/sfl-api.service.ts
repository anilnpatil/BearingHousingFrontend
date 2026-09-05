import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { API_CONFIG } from './api.config';

/*    MODELS  */

export interface LiveData {
  slNo: number;
  sku: number;
  shift: number;
  topCapPressAndHoldTime: number;
  bottomCapPressAndHoldTime: number;
  blockHeightValue: number;
  blockHeightInspectionStatus: number;
  airFlowTestResult: number;
  partStatus: number;
  cycleTime: number; 
  productionDateTime: any;
  productionDate: any;
  clothRefillStatus: number;
  capRefillStatus: number;
  glueRefillStatus: number; 
  
}
export interface ProductionSummary {
  id?: number;
  barcode?: string;
  operatorName?: string;
  shift: number;
  sku?: string;
  numberofProcess?: number;
  cycleStartTime?: string;
  beforeGlueStatus?: number;
  afterGlueStatus?: number;
  toxLoadActual?: number;
  toxLoadMin?: number;
  toxLoadMax?: number;
  toxDisplacementActual?: number;
  toxDisplacementMin?: number;
  toxDisplacementMax?: number;
  finalStatus?: number;
  okCount?: number;
  notOkCount?: number;
  totalPartCount?: number;
  cycleEndTime?: string;
  cycleTime?: number;
  productionDateTime?: string;

  p1_beforeGlueStatus?: number;
  p1_afterGlueStatus?: number;
  p1_toxLoadActual?: number;
  p1_toxLoadMin?: number;
  p1_toxLoadMax?: number;  
  p1_toxDisplacementMin?: number;
  p1_toxDisplacementMax?: number;
  p1_toxDisplacementActual?: number;
  p1_graphStatus?: number;

  p2_beforeGlueStatus?: number;
  p2_afterGlueStatus?: number;
  p2_toxLoadActual?: number;
  p2_toxLoadMin?: number;
  p2_toxLoadMax?: number;  
  p2_toxDisplacementMin?: number;
  p2_toxDisplacementMax?: number;
  p2_toxDisplacementActual?: number;
  p2_graphStatus?: number;
}

export interface SkuOption {
  id: number;
  value: string;
}

// Pagination response model
export interface PagedResponse<T> {
  content: T[];

  number: number;          // current page (0-based)
  size: number;            // page size
  totalElements: number;
  totalPages: number;
  last: boolean;
}

interface ApiResponse<T> {
  statusCode: string;
  body: T;
}


// SERVICE
@Injectable({
  providedIn: 'root'
})
export class FiltrexApiService {

  constructor(private http: HttpClient) {}

  
  getLiveData(): Observable<LiveData[]> {
    return this.http
      .get<LiveData[]>(API_CONFIG.FILTREX.LIVE_DATA)
      .pipe(shareReplay(1));
  }

  //PRODUCTION SUMMARY (Single object)  
  getProductionSummaryByShift(shift: number): Observable<ProductionSummary> {
    return this.http.get<ProductionSummary>(
      `${API_CONFIG.FILTREX.PRODUCTION_SUMMARY_SHIFT}?shift=${shift}`
    );
  }

  getLatestProductionSummary(): Observable<ProductionSummary> {
    return this.http.get<ProductionSummary>(API_CONFIG.FILTREX.PRODUCTION_LATEST);
  }

  //PAGINATED PRODUCTION REPORT (SPRING PAGE)
  getPagedReportByDateRange(
    start: string,
    end: string,
    page: number,
    size: number,
    shift?: number,
    sku?: string
  ): Observable<PagedResponse<ProductionSummary>> {

    const params: any = {
      start,
      end,
      page,
      size
    };

    if (shift !== undefined) {
      params.shift = shift;
    }

    if (sku !== undefined) {
      params.sku = sku;
    }

    return this.http.get<PagedResponse<ProductionSummary>>(
      API_CONFIG.FILTREX.REPORT_BY_DATE_RANGE,
      { params }
    );
  }

  getSkuOptions(): Observable<SkuOption[]> {
    return this.http.get<SkuOption[]>(API_CONFIG.FILTREX.SKU_OPTIONS);
  }
}
