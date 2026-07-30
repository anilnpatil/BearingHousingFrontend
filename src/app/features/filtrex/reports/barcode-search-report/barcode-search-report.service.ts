import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../api.config';
import { ProductionSummary } from '../../filtrex-api.service';

// export interface BarcodeImageInfo {
//   status?: string | null;
//   imageUrl?: string | null;
//   url?: string | null;
// }

export interface BarcodeImageInfo {

  status: string;

  imageUrl: string;

}

// export interface BarcodeProcessImageGroup {
//   beforeImage?: BarcodeImageInfo | BarcodeImageInfo[] | null;
//   afterImage?: BarcodeImageInfo | BarcodeImageInfo[] | null;
//   graphImage?: BarcodeImageInfo | BarcodeImageInfo[] | null;
// }

// export interface BarcodeSearchReportResponse {
//   beforeImage?: BarcodeImageInfo | BarcodeImageInfo[] | null;
//   afterImage?: BarcodeImageInfo | BarcodeImageInfo[] | null;
//   graphImage?: BarcodeImageInfo | BarcodeImageInfo[] | null;
//   processImages?: Record<string, BarcodeProcessImageGroup> | BarcodeProcessImageGroup[] | null;
//   productionData: ProductionSummary;
// }

export interface BarcodeSearchReportResponse {

  productionData: ProductionSummary;

  p1_beforeImage: BarcodeImageInfo;
  p1_afterImage: BarcodeImageInfo;
  p1_graphImage: BarcodeImageInfo;

  p2_beforeImage?: BarcodeImageInfo;
  p2_afterImage?: BarcodeImageInfo;
  p2_graphImage?: BarcodeImageInfo;

}

// @Injectable({ providedIn: 'root' })
// export class BarcodeSearchReportService {
//   constructor(private http: HttpClient) {}

//   searchReport(barcode: string): Observable<BarcodeSearchReportResponse> {
//     return this.http.get<BarcodeSearchReportResponse>(
//       `${API_CONFIG.FILTREX.BARCODE_SEARCH_REPORT}/${barcode}`
//     );
//   }
// }

@Injectable({
  providedIn: 'root'
})
export class BarcodeSearchReportService {

  constructor(
    private http: HttpClient
  ) { }

  searchReport(barcode: string) {

    return this.http.get<BarcodeSearchReportResponse>(
      `${API_CONFIG.FILTREX.BARCODE_SEARCH_REPORT}/${barcode}`
    );

  }

}
