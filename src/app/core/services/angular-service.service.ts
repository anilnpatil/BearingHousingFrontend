import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';

export interface AngularServiceResponse {
  success: boolean;
  message?: string;
  error?: string;
  command?: string;
  service?: string;
  exitCode?: number;
  ip?: string;
  port?: number;
  url?: string;
  qrCode?: string;
  warning?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AngularServiceService {
  private apiUrl = `http://${window.location.hostname}:8083/api/angular`;

  constructor(private http: HttpClient) {}

  /**
   * Get the Angular service status (legacy - for backward compatibility)
   */
  getStatus(): Observable<AngularServiceResponse> {
    return this.http.get<AngularServiceResponse>(`${this.apiUrl}/status`).pipe(
      timeout(20000)
    );
  }

  /**
   * Get status of a specific service by name
   * @param serviceName - The service ID/name (e.g., 'angular', 'node-red', 'spring-boot')
   */
  getServiceStatus(serviceName: string): Observable<AngularServiceResponse> {
    return this.http.get<AngularServiceResponse>(`${this.apiUrl}/status/${serviceName}`).pipe(
      timeout(20000)
    );
  }

  /**
   * Start the Angular service (legacy - for backward compatibility)
   */
  startService(): Observable<AngularServiceResponse> {
    return this.http.post<AngularServiceResponse>(`${this.apiUrl}/start`, {}).pipe(
      timeout(20000)
    );
  }

  /**
   * Stop the Angular service (legacy - for backward compatibility)
   */
  stopService(): Observable<AngularServiceResponse> {
    return this.http.post<AngularServiceResponse>(`${this.apiUrl}/stop`, {}).pipe(
      timeout(20000)
    );
  }

  /**
   * Restart the Angular service (legacy - for backward compatibility)
   */
  restartService(): Observable<AngularServiceResponse> {
    return this.http.post<AngularServiceResponse>(`${this.apiUrl}/restart`, {}).pipe(
      timeout(20000)
    );
  }

  /**
   * Restart a specific service by name
   * @param serviceName - The service ID/name (e.g., 'angular', 'node-red', 'spring-boot')
   */
  restartServiceByName(serviceName: string): Observable<AngularServiceResponse> {
    return this.http.post<AngularServiceResponse>(`${this.apiUrl}/restart/${serviceName}`, {}).pipe(
      timeout(20000)
    );
  }

  /**
   * Generate QR code for Angular URL
   */
  generateQrCode(): Observable<AngularServiceResponse> {
    return this.http.get<AngularServiceResponse>(`${this.apiUrl}/qr`).pipe(
      timeout(20000)
    );
  }
}
