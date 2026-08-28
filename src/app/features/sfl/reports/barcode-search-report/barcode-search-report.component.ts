import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  inject,
  ElementRef,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';

import {
  BarcodeSearchReportService,
  BarcodeSearchReportResponse
} from './barcode-search-report.service';

import { ProductionSummary } from '../../sfl-api.service';

import {
  HeaderContentService,
  FilterConfig
} from '../../../../core/services/header-content.service';

import { ReportFullscreenService } from '../../../../core/services/report-fullscreen.service';
import { BarcodeWebsocketService } from '../../../../core/services/barcode-websocket.service';
import {
  DomSanitizer,
  SafeResourceUrl
} from '@angular/platform-browser';
import type { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';

interface ProcessImageSet {
  label: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  graphImageUrl: SafeResourceUrl | null;
  graphDownloadUrl: string;
  beforeImageStatus: string;
  afterImageStatus: string;
  graphImageStatus: string;
}

@Component({
  selector: 'app-barcode-search-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './barcode-search-report.component.html',
  styleUrls: ['./barcode-search-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BarcodeSearchReportComponent
  implements OnInit, OnDestroy {

  @ViewChild('scannerVideo') private scannerVideo?: ElementRef<HTMLVideoElement>;

  barcode = '';
  loading = false;
  scannerOpen = false;
  scannerError: string | null = null;
  errorMessage: string | null = null;
  productionData: ProductionSummary | null = null;
  processImageSets: ProcessImageSet[] = [];

  private destroy$ = new Subject<void>();
  private service = inject(BarcodeSearchReportService);
  private headerContentService = inject(HeaderContentService);
  private reportFullscreenService = inject(ReportFullscreenService);
  private barcodeWebsocketService = inject(BarcodeWebsocketService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private readonly pdfObjectUrls = new Set<string>();
  private scanner?: BrowserMultiFormatReader;
  private scannerControls?: IScannerControls;

  ngOnInit(): void {
    this.reportFullscreenService.setFullscreen(true);
    this.setupHeaderFilters();
    this.barcodeWebsocketService.connect();
    this.barcodeWebsocketService.barcode$
      .pipe(takeUntil(this.destroy$))
      .subscribe((receivedBarcode) => {
        this.barcode = receivedBarcode;
        this.updateBarcodeFilterValue();
        this.searchBarcode();
      });

    const navState: any = history.state || {};
    if (navState?.barcode) {
      this.barcode = String(navState.barcode).trim();
      setTimeout(() => {
        this.searchBarcode();
      }, 0);
    }
  }

  ngOnDestroy(): void {
    this.headerContentService.resetHeaderContent();
    this.reportFullscreenService.setFullscreen(false);
    this.stopScanner();
    this.pdfObjectUrls.forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
    this.pdfObjectUrls.clear();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupHeaderFilters(): void {
    const filters: FilterConfig[] = [
      {
        name: 'barcode',
        type: 'input',
        label: 'Barcode',
        placeholder: 'Enter Barcode',
        value: this.barcode,
        onChange: (value) => {
          this.barcode = String(value ?? '').trim();
        }
      },
      {
        name: 'scan',
        type: 'button',
        label: 'Scan',
        disabled: this.loading,
        onChange: () => {
          void this.openScanner();
        }
      },
      {
        name: 'search',
        type: 'button',
        label: this.loading ? 'Searching...' : 'Search',
        disabled: this.loading,
        onChange: () => {
          this.searchBarcode();
        }
      }
    ];

    this.headerContentService.setFilters(filters);
  }

  async openScanner(): Promise<void> {
    if (this.scannerOpen || this.loading) {
      return;
    }

    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      this.scannerOpen = true;
      this.scannerError = 'Camera scanning requires a secure browser context. Use localhost or HTTPS, then allow camera access.';
      this.cdr.markForCheck();
      return;
    }

    this.scannerOpen = true;
    this.scannerError = null;
    this.cdr.markForCheck();

    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    if (!this.scannerVideo?.nativeElement) {
      this.scannerError = 'Unable to open the barcode scanner.';
      this.cdr.markForCheck();
      return;
    }

    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
      cameraStream.getTracks().forEach(track => track.stop());

      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      this.scanner = new BrowserMultiFormatReader();
      this.scannerControls = await this.scanner.decodeFromConstraints(
        { video: { facingMode: { ideal: 'environment' } }, audio: false },
        this.scannerVideo.nativeElement,
        (result) => {
          const scannedValue = result?.getText().trim();
          if (!scannedValue) {
            return;
          }

          this.barcode = scannedValue;
          this.updateBarcodeFilterValue();
          this.stopScanner();
          this.service
            .publishBarcodeScan(scannedValue)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              error: (error) => console.error('Unable to broadcast barcode scan:', error)
            });
          this.searchBarcode();
        }
      );
    } catch (error) {
      console.error('Unable to start barcode scanner:', error);
      const errorName = error instanceof DOMException ? error.name : '';
      this.scannerError = errorName === 'NotAllowedError'
        ? 'Camera permission was denied. Allow camera access in the browser settings and try again.'
        : 'Camera is unavailable on this device. Enter the barcode manually.';
      this.cdr.markForCheck();
    }
  }

  closeScanner(): void {
    this.stopScanner();
  }

  private stopScanner(): void {
    this.scannerControls?.stop();
    this.scannerControls = undefined;
    this.scanner = undefined;
    this.scannerOpen = false;
    this.cdr.markForCheck();
  }

  private updateBarcodeFilterValue(): void {
    const filters = this.headerContentService.headerContent().filters;
    if (!filters?.length) {
      return;
    }

    this.headerContentService.setFilters(filters.map(filter =>
      filter.name === 'barcode' ? { ...filter, value: this.barcode } : filter
    ));
  }

  private updateFilterButtons(): void {
    const filters = this.headerContentService.headerContent().filters;
    if (!filters?.length) {
      return;
    }

    this.headerContentService.setFilters(filters.map(filter => {
      if (filter.name === 'search') {
        return { ...filter, label: this.loading ? 'Searching...' : 'Search', disabled: this.loading };
      }
      if (filter.name === 'scan') {
        return { ...filter, disabled: this.loading };
      }
      return filter;
    }));
  }

  searchBarcode(): void {
    const barcodeValue = this.barcode.trim();

    if (!barcodeValue) {
      this.errorMessage = 'Please enter a valid barcode.';
      this.productionData = null;
      this.processImageSets = [];
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.productionData = null;
    this.processImageSets = [];
    this.updateFilterButtons();

    this.service
      .searchReport(barcodeValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: BarcodeSearchReportResponse) => {
          this.productionData = response.productionData;
          this.processImageSets = [];

          // Process P1
          if (response.p1_beforeImage) {
            const processSet: ProcessImageSet = {
              label: 'Process P1',
              beforeImageUrl: this.buildImageUrl(response.p1_beforeImage.imageUrl),
              afterImageUrl: this.buildImageUrl(response.p1_afterImage?.imageUrl),
              graphImageUrl: null,
              graphDownloadUrl: this.buildImageUrl(response.p1_graphImage?.imageUrl),
              beforeImageStatus: response.p1_beforeImage.status ?? '',
              afterImageStatus: response.p1_afterImage?.status ?? '',
              graphImageStatus: response.p1_graphImage?.status ?? ''
            };

            this.processImageSets.push(processSet);

            void this.loadPdfInApp(response.p1_graphImage?.imageUrl).then((safeUrl) => {
              processSet.graphImageUrl = safeUrl;
              this.cdr.detectChanges();
            });
          }

          // Process P2 (if exists)
          if (response.p2_beforeImage) {
            const processSet: ProcessImageSet = {
              label: 'Process P2',
              beforeImageUrl: this.buildImageUrl(response.p2_beforeImage.imageUrl),
              afterImageUrl: this.buildImageUrl(response.p2_afterImage?.imageUrl),
              graphImageUrl: null,
              graphDownloadUrl: this.buildImageUrl(response.p2_graphImage?.imageUrl),
              beforeImageStatus: response.p2_beforeImage.status ?? '',
              afterImageStatus: response.p2_afterImage?.status ?? '',
              graphImageStatus: response.p2_graphImage?.status ?? ''
            };

            this.processImageSets.push(processSet);

            void this.loadPdfInApp(response.p2_graphImage?.imageUrl).then((safeUrl) => {
              processSet.graphImageUrl = safeUrl;
              this.cdr.detectChanges();
            });
          }

          this.loading = false;
          this.errorMessage = null;
          this.updateFilterButtons();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading report:', error);
          this.loading = false;
          this.productionData = null;
          this.processImageSets = [];
          this.errorMessage = error?.error?.message ?? 'Unable to load barcode report.';
          this.updateFilterButtons();
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Build absolute URL for images
   */
  private buildImageUrl(url: string | null | undefined): string {
    if (!url) {
      return '';
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    const cleanUrl = url.startsWith('/') ? url : '/' + url;
    return `${window.location.origin}${cleanUrl}`;
  }

  /**
   * Load the PDF as a blob so it can be displayed in the app instead of opening in a browser tab.
   */
  private async loadPdfInApp(url: string | null | undefined): Promise<SafeResourceUrl | null> {
    if (!url) {
      return null;
    }

    const absoluteUrl = this.buildImageUrl(url);

    if (!absoluteUrl) {
      return null;
    }

    try {
      const response = await fetch(absoluteUrl, { credentials: 'include' });
      if (!response.ok) {
        throw new Error(`Unable to load PDF (${response.status})`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      this.pdfObjectUrls.add(objectUrl);

      return this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
    } catch (error) {
      console.error('Unable to load PDF in-app:', error);
      return this.sanitizer.bypassSecurityTrustResourceUrl(absoluteUrl);
    }
  }

  /**
   * Handle image load error
   */
  onImageError(event: any): void {
    console.error('Image failed to load:', event);
    // You can add custom error handling here
    // For example, show a default placeholder image
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWRlZGVkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
    }
  }

  /**
   * Handle PDF load success
   */
  onPdfLoad(event: any): void {
    console.log('PDF loaded successfully');
  }

  /**
   * Handle PDF load error
   */
  onPdfError(event: any): void {
    console.error('PDF failed to load:', event);
    // You can add custom error handling here
  }

  public isOkStatus(status: string | null | undefined): boolean {
    if (!status) {
      return false;
    }
    const normalized = status.trim().toUpperCase();
    return normalized === 'A_OK' || normalized === 'B_OK' || normalized === 'OK';
  }

  /**
   * Download the PDF directly from the backend.
   */
  async downloadPdf(url: string): Promise<void> {
    if (!url) {
      return;
    }

    try {
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = 'graph.pdf';
      link.click();

      setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }

  goBack(): void {
    const navState: any = history.state || {};

    if (navState && navState.from === 'view-reports' && navState.previous) {
      this.router.navigate(
        ['view-reports'],
        {
          state: {
            previous: navState.previous
          }
        }
      );
      return;
    }

    this.router.navigate(['dashboard']);
  }
}