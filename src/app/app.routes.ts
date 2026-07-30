import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { Dashboard } from './features/filtrex/dashboard/dashboard';
import { Admin } from './features/admin/admin';
import { User } from './features/filtrex/user/user';
import { LayoutComponent } from './core/layout/layout/layout';
import { authGuard } from './auth/auth.guard';
import { roleGuard } from './auth/role.guard';
import { RealtimeDataComponent } from './features/filtrex/realtime-data/realtime-data.component';
import { ViewReportComponent } from './features/filtrex/reports/view-report/view-report.component';
import { ViewGraphicalReport } from './features/filtrex/reports/view-graphical-report/view-graphical-report';
import { ProductionReportComponent } from './features/filtrex/reports/production-summary-report/production-summary-report.component';
import { ProductionTotalsReportsComponent } from './features/filtrex/reports/production-totals-reports/production-totals-reports.component';
import { ProductionQualityChartComponent } from './features/filtrex/reports/production-quality-chart/production-quality-chart.component';
import { ProductionTrendChartComponent } from './features/filtrex/reports/production-trend-chart/production-trend-chart.component';
import { RejectionGraphComponent } from './features/filtrex/reports/rejection-graph/rejection-graph.component';
import { BarcodeSearchReportComponent } from './features/filtrex/reports/barcode-search-report/barcode-search-report.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent, canActivate: [authGuard, roleGuard('ADMIN')] },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard, data: { title: 'Dashboard' } },
      { path: 'realtimedata', component: RealtimeDataComponent, data: { title: 'Realtime Data' } },
      { path: 'view-reports', component: ViewReportComponent, data: { title: 'Parameter Reports' } },
      { path: 'production-report', component: ProductionReportComponent, data: { title: 'Production Summary Report' } },
      { path: 'graphical-reports', component: ViewGraphicalReport, data: { title: 'Graphical Reports' } },
      { path: 'admin', component: Admin, canActivate: [roleGuard('ADMIN')], data: { title: 'Admin' } },
      { path: 'user', component: User, canActivate: [roleGuard('USER')], data: { title: 'User' } },
      { path: 'production-totals-report', component: ProductionTotalsReportsComponent, data: { title: 'Production Totals' } },
      { path: 'production-quality-chart', component: ProductionQualityChartComponent, data: { title: 'Production Quality' } },
      { path: 'production-trend-chart', component: ProductionTrendChartComponent, data: { title: 'Production Trend' } },
      { path: 'rejection-graph', component: RejectionGraphComponent, data: { title: 'Rejection Graph' } },
      { path: 'barcode-search-report', component: BarcodeSearchReportComponent, data: { title: 'Barcode Search Report' } }

    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
