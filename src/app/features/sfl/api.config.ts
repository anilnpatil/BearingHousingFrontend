// src/app/core/config/api.config.ts
export const API_CONFIG = {
  FILTREX: {
    LIVE_DATA: '/api/filtrexdata/live',
    PRODUCTION_SUMMARY_SHIFT: '/api/production-data/shift',
    PRODUCTION_LATEST: '/api/production-data/latest',
    REPORT_BY_DATE_RANGE: '/api/production-data/daterange',
    BARCODE_SEARCH_REPORT: '/api/bearing-housing/report',
    SKU_OPTIONS: '/api/sku-options'
  }
} as const;
