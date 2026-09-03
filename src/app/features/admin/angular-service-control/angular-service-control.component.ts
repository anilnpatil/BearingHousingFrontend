import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AngularServiceService, AngularServiceResponse } from '../../../core/services/angular-service.service';

interface ServiceConfig {
  name: string;
  id: string;
  description: string;
  port: number;
}
// Define the services to be managed
const SERVICES: ServiceConfig[] = [
  
   {
     name: 'BearingHousingBackendService', 
     id: 'spring-boot', 
     description: 'BearingHousingBackend API Service', 
     port: 8083 },

   { 
    name: 'BearingHousingNoderedService', 
     id: 'node-red', 
     description: 'BearingHousing Node-RED Flow Editor', 
     port: 1880 },  
    {
      name: 'BearingHousingFrontendService',
      id: 'angular',
      description: 'BearingHousing Angular Application Service',
      port: 4200
    }
];

@Component({
  selector: 'app-angular-service-control',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './angular-service-control.component.html',
  styleUrl: './angular-service-control.component.scss'
})
export class AngularServiceControlComponent {
  // Service configurations
  services = signal<ServiceConfig[]>(SERVICES);
  
  // Service status tracking
  serviceStatus = signal<Map<string, { status: string; isRunning: boolean }>>(new Map());
  
  // QR Code state
  qrCode = signal<string | null>(null);
  angularUrl = signal<string | null>(null);

  // UI States
  isLoadingQr = signal<boolean>(false);
  isCheckingService = signal<Map<string, boolean>>(new Map());
  isRestarting = signal<Map<string, boolean>>(new Map());
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  constructor(private angularService: AngularServiceService) {
    // Initialize service status map
    this.initializeServiceStatus();
    // Load the QR code without restarting any service
    this.generateQrCode();
  } 

  //Initialize service status map with default values   
  private initializeServiceStatus(): void {
    const statusMap = new Map<string, { status: string; isRunning: boolean }>();
    this.services().forEach(service => {
      statusMap.set(service.id, { status: 'Unknown', isRunning: false });
    });
    this.serviceStatus.set(statusMap);
  }
  
  // Generate the Angular QR code without changing service state.  
  generateQrCode(): void {
    this.isLoadingQr.set(true);
    this.error.set(null);

    this.angularService.generateQrCode().subscribe({
      next: (response: AngularServiceResponse) => {
        if (response.success) {
          this.qrCode.set(response.qrCode || null);
          this.angularUrl.set(response.url || null);
          
          this.isLoadingQr.set(false);
        } else {
          this.error.set(response.message || 'Failed to generate QR code');
          this.isLoadingQr.set(false);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message || 'Failed to generate QR code');
        this.isLoadingQr.set(false);
      }
    });
  }
  
  // Check status of a specific service    
  checkServiceStatus(serviceId: string): void {    
    const checkingMap = new Map(this.isCheckingService());
    checkingMap.set(serviceId, true);
    this.isCheckingService.set(checkingMap);
    
    this.error.set(null);

    this.angularService.getServiceStatus(serviceId).subscribe({
      next: (response: AngularServiceResponse) => {
        const statusMap = new Map(this.serviceStatus());
        if (response.success) {
          statusMap.set(serviceId, { status: 'Running', isRunning: true });
        } else {
          statusMap.set(serviceId, { status: 'Stopped', isRunning: false });
        }
        this.serviceStatus.set(statusMap);
        
        // Update checking map
        const newCheckingMap = new Map(this.isCheckingService());
        newCheckingMap.set(serviceId, false);
        this.isCheckingService.set(newCheckingMap);
      },
      error: (err: HttpErrorResponse) => {
        const statusMap = new Map(this.serviceStatus());
        statusMap.set(serviceId, { status: 'Error', isRunning: false });
        this.serviceStatus.set(statusMap);
        
        this.error.set(err.error?.message || `Failed to check ${serviceId} status`);
        
        const newCheckingMap = new Map(this.isCheckingService());
        newCheckingMap.set(serviceId, false);
        this.isCheckingService.set(newCheckingMap);
      }
    });
  }
  
  // Restart a specific serviceId - The ID of the service to restart  
  restartService(serviceId: string): void {
    const restartingMap = new Map(this.isRestarting());
    restartingMap.set(serviceId, true);
    this.isRestarting.set(restartingMap);
    
    this.error.set(null);
    this.successMessage.set(null);

    this.angularService.restartServiceByName(serviceId).subscribe({
      next: (response: AngularServiceResponse) => {
        if (response.success) {
          this.successMessage.set(`${serviceId} restarted successfully`);
          
          // Update status after restart
          setTimeout(() => {
            this.checkServiceStatus(serviceId);
          }, 2000);
        } else {
          this.error.set(response.message || `Failed to restart ${serviceId}`);
        }
        
        const newRestartingMap = new Map(this.isRestarting());
        newRestartingMap.set(serviceId, false);
        this.isRestarting.set(newRestartingMap);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message || `Failed to restart ${serviceId}`);
        
        const newRestartingMap = new Map(this.isRestarting());
        newRestartingMap.set(serviceId, false);
        this.isRestarting.set(newRestartingMap);
      }
    });
  }

  // Regenerate QR code manually without restarting any service.   
  regenerateQrCode(): void {
    this.generateQrCode();
  }
  
  // Get service status by ID  
  getServiceStatus(serviceId: string): { status: string; isRunning: boolean } {
    return this.serviceStatus().get(serviceId) || { status: 'Unknown', isRunning: false };
  }
  
  //Check if a service is currently checking   
  isServiceChecking(serviceId: string): boolean {
    return this.isCheckingService().get(serviceId) || false;
  }
  
  // Check if a service is currently restarting  
  isServiceRestarting(serviceId: string): boolean {
    return this.isRestarting().get(serviceId) || false;
  }

  // Dismiss error message  
  dismissError(): void {
    this.error.set(null);
  }
  
  // Dismiss success message  
  dismissSuccess(): void {
    this.successMessage.set(null);
  }
}
