import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProductionTotalsRow, ViewMode } from '../models';


@Injectable({ providedIn: 'root' })
export class ProductionTotalsReportsService {


private readonly baseUrl = '/api/reports/production/totals';


constructor(private http: HttpClient) {}


fetchTotals(
mode: ViewMode,
params: {
fromDate?: string;
toDate?: string;
year?: number;
sku?: number;
shift?: number;
}
): Observable<ProductionTotalsRow[]> {
		// Build params only when values are present
		let httpParams = new HttpParams();
		if (params.sku != null && params.sku !== 0) httpParams = httpParams.set('sku', params.sku.toString());
		if (params.shift != null && params.shift !== 0) httpParams = httpParams.set('shift', params.shift.toString());

		if (mode === 'DAY') {
			if (params.fromDate) httpParams = httpParams.set('fromDate', params.fromDate);
			if (params.toDate) httpParams = httpParams.set('toDate', params.toDate);

			return this.http
				.get<ProductionTotalsRow[]>(`${this.baseUrl}/day`, { params: httpParams })
				.pipe(catchError(err => this.handleError(err)));
		}

		if (mode === 'WEEK') {
			if (params.year != null) httpParams = httpParams.set('year', params.year.toString());

			return this.http
				.get<ProductionTotalsRow[]>(`${this.baseUrl}/week`, { params: httpParams })
				.pipe(catchError(err => this.handleError(err)));
		}

		// default to MONTH
		if (params.year != null) httpParams = httpParams.set('year', params.year.toString());

		return this.http
			.get<ProductionTotalsRow[]>(`${this.baseUrl}/month`, { params: httpParams })
			.pipe(catchError(err => this.handleError(err)));
}


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

	// Log for debugging
	// eslint-disable-next-line no-console
	console.error('ProductionTotalsReportsService error', {
		status: error.status,
		url: error.url,
		message: error.message,
		body: error.error,
	});

	return throwError(() => new Error(message));
}
}