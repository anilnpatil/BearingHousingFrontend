import { Injectable, signal } from '@angular/core';

export interface ErrorState {
  hasError: boolean;
  message: string;
  details?: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private errorState = signal<ErrorState>({
    hasError: false,
    message: '',
    details: undefined,
    timestamp: new Date()
  });

  public error$ = this.errorState.asReadonly();

  setError(message: string, details?: string) {
    this.errorState.set({
      hasError: true,
      message,
      details,
      timestamp: new Date()
    });
  }

  clearError() {
    this.errorState.set({
      hasError: false,
      message: '',
      details: undefined,
      timestamp: new Date()
    });
  }

  handleBackendError(error: any): string {
    if (!error) {
      return 'An unknown error occurred';
    }

    // Handle different error types
    if (error.status === 0) {
      return 'Backend server is not reachable. Please check your connection or contact support.';
    } else if (error.status === 404) {
      return 'The requested resource was not found.';
    } else if (error.status === 500) {
      return 'Server error. The backend encountered an issue. Please try again later.';
    } else if (error.status === 503) {
      return 'Service unavailable. The backend is temporarily unavailable.';
    } else if (error.status >= 400 && error.status < 500) {
      return error.error?.message || `Client error: ${error.statusText}`;
    } else if (error.status >= 500) {
      return error.error?.message || `Server error: ${error.statusText}`;
    } else if (error.message) {
      return error.message;
    }

    return 'Unable to communicate with backend. Please try again.';
  }
}
