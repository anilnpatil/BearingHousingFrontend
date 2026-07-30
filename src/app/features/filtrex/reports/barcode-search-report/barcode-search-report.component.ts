// import {
//   Component,
//   ChangeDetectionStrategy,
//   OnInit,
//   OnDestroy,
//   ChangeDetectorRef,
//   inject
// } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Subject, takeUntil } from 'rxjs';
// import { Router } from '@angular/router';

// import {
//   BarcodeSearchReportService,
//   BarcodeSearchReportResponse,
//   BarcodeImageInfo,
//   BarcodeProcessImageGroup
// } from './barcode-search-report.service';
// import { HeaderContentService, FilterConfig } from '../../../../core/services/header-content.service';
// import { ProductionSummary } from '../../filtrex-api.service';
// import { ReportFullscreenService } from '../../../../core/services/report-fullscreen.service';

// interface ProcessImageSet {
//   label: string;
//   beforeImageUrl: string | null;
//   afterImageUrl: string | null;
//   graphImageUrl: string | null;
//   beforeImageStatus: string | null;
//   afterImageStatus: string | null;
//   graphImageStatus: string | null;
// }

// @Component({
//   selector: 'app-barcode-search-report',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './barcode-search-report.component.html',
//   styleUrls: ['./barcode-search-report.component.scss'],
//   changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class BarcodeSearchReportComponent implements OnInit, OnDestroy {
//   barcode = '';
//   loading = false;
//   errorMessage: string | null = null;

//   productionData: ProductionSummary | null = null;
//   processImageSets: ProcessImageSet[] = [];

//   beforeImageUrl: string | null = null;
//   afterImageUrl: string | null = null;
//   graphImageUrl: string | null = null;

//   beforeImageStatus: string | null = null;
//   afterImageStatus: string | null = null;
//   graphImageStatus: string | null = null;

//   private destroy$ = new Subject<void>();
//   private service = inject(BarcodeSearchReportService);
//   private headerContentService = inject(HeaderContentService);
//   private reportFullscreenService = inject(ReportFullscreenService);
//   private cdr = inject(ChangeDetectorRef);
//   private router = inject(Router);

//   ngOnInit(): void {
//     this.reportFullscreenService.setFullscreen(true);
//     this.setupHeaderFilters();
//     // If navigated here with a barcode and previous state, auto-search
//     const navState: any = history.state || {};
//     if (navState && navState.barcode) {
//       this.barcode = String(navState.barcode).trim();
//       setTimeout(() => this.searchBarcode(), 0);
//     }
//   }

//   ngOnDestroy(): void {
//     this.headerContentService.resetHeaderContent();
//     this.reportFullscreenService.setFullscreen(false);
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   private setupHeaderFilters(): void {
//     const filters: FilterConfig[] = [
//       {
//         name: 'barcode',
//         type: 'input',
//         label: 'Barcode',
//         placeholder: 'Enter barcode',
//         value: this.barcode,
//         onChange: (value) => {
//           this.barcode = String(value ?? '').trim();
//         }
//       },
//       {
//         name: 'search',
//         type: 'button',
//         label: this.loading ? 'Searching...' : 'Search',
//         disabled: this.loading,
//         onChange: () => this.searchBarcode()
//       }
//     ];

//     this.headerContentService.setFilters(filters);
//   }

//   private updateFilterButtons(): void {
//     const currentFilters = this.headerContentService.headerContent().filters;
//     if (currentFilters && currentFilters.length > 0) {
//       const searchBtn = currentFilters.find((f) => f.name === 'search');
//       if (searchBtn) {
//         searchBtn.label = this.loading ? 'Searching...' : 'Search';
//         searchBtn.disabled = this.loading;
//       }
//     }
//   }

//   searchBarcode(): void {
//     const barcodeValue = String(this.barcode ?? '').trim();

//     if (!barcodeValue) {
//       this.errorMessage = 'Please enter a valid barcode before searching.';
//       this.productionData = null;
//       this.processImageSets = [];
//       this.beforeImageUrl = null;
//       this.afterImageUrl = null;
//       this.graphImageUrl = null;
//       this.cdr.markForCheck();
//       return;
//     }

//     this.loading = true;
//     this.errorMessage = null;
//     this.productionData = null;
//     this.processImageSets = [];
//     this.beforeImageUrl = null;
//     this.afterImageUrl = null;
//     this.graphImageUrl = null;
//     this.updateFilterButtons();

//     this.service
//       .searchReport(encodeURIComponent(barcodeValue))
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (result: BarcodeSearchReportResponse) => {
//           this.productionData = result.productionData;
//           this.processImageSets = this.buildProcessImageSets(result);

//           const fallbackSet = this.processImageSets[0];
//           this.beforeImageUrl = fallbackSet?.beforeImageUrl ?? null;
//           this.afterImageUrl = fallbackSet?.afterImageUrl ?? null;
//           this.graphImageUrl = fallbackSet?.graphImageUrl ?? null;
//           this.beforeImageStatus = fallbackSet?.beforeImageStatus ?? null;
//           this.afterImageStatus = fallbackSet?.afterImageStatus ?? null;
//           this.graphImageStatus = fallbackSet?.graphImageStatus ?? null;

//           this.loading = false;
//           this.errorMessage = null;
//           this.updateFilterButtons();
//           this.cdr.markForCheck();
//         },
//         error: (err) => {
//           this.loading = false;
//           this.errorMessage =
//             err?.message ?? 'Failed to load barcode report. Please try again.';
//           this.updateFilterButtons();
//           this.cdr.markForCheck();
//         }
//       });
//   }

//   private buildProcessImageSets(response: BarcodeSearchReportResponse): ProcessImageSet[] {
//     const result = response as unknown as Record<string, unknown>;
//     const sets: ProcessImageSet[] = [];

//     const normalizeImageInfo = (value: unknown): BarcodeImageInfo | null => {
//       if (!value) {
//         return null;
//       }

//       if (Array.isArray(value)) {
//         return normalizeImageInfo(value[0] ?? null);
//       }

//       if (typeof value === 'string') {
//         const text = value.trim();
//         if (!text) {
//           return null;
//         }

//         return {
//           status: null,
//           imageUrl: text
//         };
//       }

//       const info = value as Record<string, unknown>;
//       const imageUrl = typeof info['imageUrl'] === 'string'
//         ? info['imageUrl']
//         : typeof info['url'] === 'string'
//           ? info['url']
//           : typeof info['path'] === 'string'
//             ? info['path']
//             : '';

//       if (!imageUrl) {
//         return null;
//       }

//       return {
//         status:
//           typeof info['status'] === 'string' || typeof info['status'] === 'number'
//             ? String(info['status'])
//             : null,
//         imageUrl
//       };
//     };

//     const normalizeUrl = (path: string | null): string | null => {
//       if (!path) {
//         return null;
//       }

//       try {
//         return new URL(path, window.location.origin).toString();
//       } catch {
//         return path;
//       }
//     };

//     const buildSet = (
//       label: string,
//       beforeValue: unknown,
//       afterValue: unknown,
//       graphValue: unknown
//     ): ProcessImageSet | null => {
//       const beforeImage = normalizeImageInfo(beforeValue);
//       const afterImage = normalizeImageInfo(afterValue);
//       const graphImage = normalizeImageInfo(graphValue);

//       if (!beforeImage && !afterImage && !graphImage) {
//         return null;
//       }

//       return {
//         label,
//         beforeImageUrl: normalizeUrl(beforeImage?.imageUrl ?? null),
//         afterImageUrl: normalizeUrl(afterImage?.imageUrl ?? null),
//         graphImageUrl: normalizeUrl(graphImage?.imageUrl ?? null),
//         beforeImageStatus: beforeImage?.status ?? null,
//         afterImageStatus: afterImage?.status ?? null,
//         graphImageStatus: graphImage?.status ?? null,
//       };
//     };

//     const processImageMap = result['processImages'] as Record<string, BarcodeProcessImageGroup> | undefined;
//     const mapSets: ProcessImageSet[] = [];

//     if (processImageMap && typeof processImageMap === 'object') {
//       const entries = Object.entries(processImageMap);
//       entries.forEach(([key, group]) => {
//         const groupRecord = group as BarcodeProcessImageGroup;
//         const normalizedKey = key.toLowerCase().trim();
//         const label = normalizedKey.startsWith('p')
//           ? `Process ${normalizedKey.replace(/^p/, '')}`
//           : key.toUpperCase().replace(/_/g, ' ');

//         const set = buildSet(
//           label,
//           groupRecord?.beforeImage,
//           groupRecord?.afterImage,
//           groupRecord?.graphImage
//         );

//         if (set) {
//           mapSets.push(set);
//         }
//       });
//     }

//     for (let processNumber = 1; processNumber <= 2; processNumber++) {
//       const beforeKey = `p${processNumber}_beforeImage`;
//       const afterKey = `p${processNumber}_afterImage`;
//       const graphKey = `p${processNumber}_graphImage`;
//       const beforeValue = result[beforeKey];
//       const afterValue = result[afterKey];
//       const graphValue = result[graphKey];
//       const set = buildSet(
//         `Process ${processNumber}`,
//         beforeValue,
//         afterValue,
//         graphValue
//       );

//       if (set) {
//         sets.push(set);
//       }
//     }

//     if (!sets.length && mapSets.length) {
//       return mapSets.slice(0, 2);
//     }

//     if (sets.length) {
//       return sets.slice(0, 2);
//     }

//     const fallbackSet = buildSet(
//       'Process 1',
//       response.beforeImage,
//       response.afterImage,
//       response.graphImage
//     );

//     if (fallbackSet) {
//       sets.push(fallbackSet);
//     }

//     return sets.slice(0, 2);
//   }

//   /** Go back to previous view if provided, otherwise go to dashboard */
//   goBack(): void {
//     const navState: any = history.state || {};
//     if (navState && navState.from === 'view-reports' && navState.previous) {
//       this.router.navigate(['view-reports'], { state: { previous: navState.previous } });
//     } else {
//       this.router.navigate(['dashboard']);
//     }
//   }
// }


import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';

import {
  BarcodeSearchReportService,
  BarcodeSearchReportResponse
} from './barcode-search-report.service';

import { ProductionSummary } from '../../filtrex-api.service';

import {
  HeaderContentService,
  FilterConfig
} from '../../../../core/services/header-content.service';

import { ReportFullscreenService } from '../../../../core/services/report-fullscreen.service';
import {
  DomSanitizer,
  SafeResourceUrl
} from '@angular/platform-browser';

interface ProcessImageSet {

  label: string;

  beforeImageUrl: string;

  afterImageUrl: string;

  graphImageUrl: SafeResourceUrl;

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

  barcode = '';

  loading = false;

  errorMessage: string | null = null;

  productionData: ProductionSummary | null = null;

  processImageSets: ProcessImageSet[] = [];

  private destroy$ = new Subject<void>();

  private service = inject(BarcodeSearchReportService);

  private headerContentService = inject(HeaderContentService);

  private reportFullscreenService =
    inject(ReportFullscreenService);

  private cdr = inject(ChangeDetectorRef);

  private router = inject(Router);

  private sanitizer = inject(DomSanitizer);

  ngOnInit(): void {

    this.reportFullscreenService.setFullscreen(true);

    this.setupHeaderFilters();

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
        name: 'search',

        type: 'button',

        label: this.loading
          ? 'Searching...'
          : 'Search',

        disabled: this.loading,

        onChange: () => {

          this.searchBarcode();

        }

      }

    ];

    this.headerContentService.setFilters(filters);

  }

  private updateFilterButtons(): void {

    const filters =
      this.headerContentService
        .headerContent()
        .filters;

    if (!filters?.length) {

      return;

    }

    const searchButton =
      filters.find(f => f.name === 'search');

    if (!searchButton) {

      return;

    }

    searchButton.label =
      this.loading
        ? 'Searching...'
        : 'Search';

    searchButton.disabled =
      this.loading;

  }

  searchBarcode(): void {

  const barcodeValue = this.barcode.trim();

  if (!barcodeValue) {

    this.errorMessage =
      'Please enter a valid barcode.';

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

        // next: (response: BarcodeSearchReportResponse) => {

        //   this.productionData =
        //     response.productionData;

        //   this.processImageSets = [];

        //   // ------------------------
        //   // Process 1
        //   // ------------------------

        //   if (
        //     response.p1_beforeImage &&
        //     response.p1_afterImage &&
        //     response.p1_graphImage
        //   ) {

        //     this.processImageSets.push({

        //       label: 'Process P1',

        //       beforeImageUrl:
        //         response.p1_beforeImage.imageUrl,

        //       afterImageUrl:
        //         response.p1_afterImage.imageUrl,

        //       graphImageUrl:
        //         response.p1_graphImage.imageUrl,

        //       beforeImageStatus:
        //         response.p1_beforeImage.status,

        //       afterImageStatus:
        //         response.p1_afterImage.status,

        //       graphImageStatus:
        //         response.p1_graphImage.status

        //     });

        //   }

        //   // ------------------------
        //   // Process 2
        //   // ------------------------

        //   if (
        //     response.p2_beforeImage &&
        //     response.p2_afterImage &&
        //     response.p2_graphImage
        //   ) {

        //     this.processImageSets.push({

        //       label: 'Process P2',

        //       beforeImageUrl:
        //         response.p2_beforeImage.imageUrl,

        //       afterImageUrl:
        //         response.p2_afterImage.imageUrl,

        //       graphImageUrl:
        //         response.p2_graphImage.imageUrl,

        //       beforeImageStatus:
        //         response.p2_beforeImage.status,

        //       afterImageStatus:
        //         response.p2_afterImage.status,

        //       graphImageStatus:
        //         response.p2_graphImage.status

        //     });

        //   }
        //   console.log("processImageSets =", this.processImageSets);

        //   this.loading = false;

        //   this.errorMessage = null;

        //   this.updateFilterButtons();

        //   this.cdr.markForCheck();

        // },
        next: (response: BarcodeSearchReportResponse) => {

          this.productionData = response.productionData;

          this.processImageSets = [];

          if (response.p1_beforeImage) {

            this.processImageSets.push({

              label: 'Process P1',

              beforeImageUrl: this.toAbsoluteUrl(response.p1_beforeImage.imageUrl),

              afterImageUrl: this.toAbsoluteUrl(response.p1_afterImage?.imageUrl),

              // graphImageUrl: this.toAbsoluteUrl(response.p1_graphImage?.imageUrl),
              graphImageUrl:
                this.sanitizer.bypassSecurityTrustResourceUrl(
                    this.toAbsoluteUrl(
                        response.p1_graphImage?.imageUrl
                    )
                ),

              beforeImageStatus: response.p1_beforeImage.status ?? '',

              afterImageStatus: response.p1_afterImage?.status ?? '',

              graphImageStatus: response.p1_graphImage?.status ?? ''

            });

          }

          if (response.p2_beforeImage) {

            this.processImageSets.push({

              label: 'Process P2',

              beforeImageUrl: this.toAbsoluteUrl(response.p2_beforeImage.imageUrl),

              afterImageUrl: this.toAbsoluteUrl(response.p2_afterImage?.imageUrl),

              graphImageUrl:
                this.sanitizer.bypassSecurityTrustResourceUrl(
                    this.toAbsoluteUrl(
                        response.p2_graphImage?.imageUrl
                    )
                ),

              beforeImageStatus: response.p2_beforeImage.status ?? '',

              afterImageStatus: response.p2_afterImage?.status ?? '',

              graphImageStatus: response.p2_graphImage?.status ?? ''

            });

          }

          console.log(this.processImageSets);

          this.loading = false;

          this.errorMessage = null;

          this.updateFilterButtons();

          this.cdr.detectChanges();

        },
        error: (error) => {

          console.error(error);

          this.loading = false;

          this.productionData = null;

          this.processImageSets = [];

          this.errorMessage =
            error?.error?.message ??
            'Unable to load barcode report.';

          this.updateFilterButtons();

          this.cdr.markForCheck();

        }

      });

}


  private toAbsoluteUrl(url: string | null | undefined): string {

    if (!url) {
      return '';
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    return `${window.location.origin}${url}`;
  }


    goBack(): void {

  const navState: any = history.state || {};

  if (
    navState &&
    navState.from === 'view-reports' &&
    navState.previous
  ) {

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
