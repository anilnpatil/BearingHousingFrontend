// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { API_CONFIG } from '../../api.config';
// import { ProductionSummary } from '../../filtrex-api.service';

// export interface BarcodeImageInfo {

//   status: string;

//   imageUrl: string;

// }

// export interface BarcodeSearchReportResponse {

//   productionData: ProductionSummary;

//   p1_beforeImage: BarcodeImageInfo;
//   p1_afterImage: BarcodeImageInfo;
//   p1_graphImage: BarcodeImageInfo;

//   p2_beforeImage?: BarcodeImageInfo;
//   p2_afterImage?: BarcodeImageInfo;
//   p2_graphImage?: BarcodeImageInfo;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class BarcodeSearchReportService {

//   constructor(
//     private http: HttpClient
//   ) { }

//   searchReport(barcode: string) {

//     return this.http.get<BarcodeSearchReportResponse>(
//       `${API_CONFIG.FILTREX.BARCODE_SEARCH_REPORT}/${barcode}`
//     );

//   }

// }

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../api.config';
import { ProductionSummary } from '../../sfl-api.service';

export interface BarcodeImageInfo {
  status: string;
  imageUrl: string;
}

export interface BarcodeSearchReportResponse {
  productionData: ProductionSummary;
  p1_beforeImage: BarcodeImageInfo;
  p1_afterImage: BarcodeImageInfo;
  p1_graphImage: BarcodeImageInfo;
  p2_beforeImage?: BarcodeImageInfo;
  p2_afterImage?: BarcodeImageInfo;
  p2_graphImage?: BarcodeImageInfo;
}

@Injectable({ providedIn: 'root' })
export class BarcodeSearchReportService {
  constructor(private http: HttpClient) {}

  searchReport(barcode: string): Observable<BarcodeSearchReportResponse> {
    return this.http.get<BarcodeSearchReportResponse>(
      `${API_CONFIG.FILTREX.BARCODE_SEARCH_REPORT}/${barcode}`
    );
  }
}