//production-report models
export interface ProductionReportRow {
  date: string;        // yyyy-MM-dd
  sku: number;
  shift: number;
  totalCount: number;
  okCount: number;
  notOkCount: number;
}
//view report models
export interface ProductionReportViewRow {
  key: string;         // day | week | month label
  sku: number;
  shift: number;
  totalCount: number;
  okCount: number;
  notOkCount: number;
}
//summary report models
export interface SummaryDateBlock {
  date: string;
  total: number;
  ok: number;
  notOk: number;

  skus: SummarySkuRow[];
}
// sku row in summary report
export interface SummarySkuRow {
  sku: number;
  shifts: {
    [shift: number]: {
      total: number;
      ok: number;
      notOk: number;
    };
  };
}

//production-totals-reports models
export interface ProductionTotalsRow {
  periodKey: string;
  fromDate: string;
  toDate: string;
  sku: number;
  shift: number;
  totalCount: number;
  okCount: number;
  notOkCount: number;
}
export type ViewMode = 'DAY' | 'WEEK' | 'MONTH';
