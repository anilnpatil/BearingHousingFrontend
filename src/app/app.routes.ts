import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { Dashboard } from './features/sfl/dashboard/dashboard';
import { Admin } from './features/admin/admin';
import { User } from './features/sfl/user/user';
import { LayoutComponent } from './core/layout/layout/layout';
import { authGuard } from './auth/auth.guard';
import { roleGuard } from './auth/role.guard';
import { ViewReportComponent } from './features/sfl/reports/view-report/view-report.component';
import { ViewGraphicalReport } from './features/sfl/reports/view-graphical-report/view-graphical-report';
import { ProductionReportComponent } from './features/sfl/reports/production-summary-report/production-summary-report.component';
import { ProductionTotalsReportsComponent } from './features/sfl/reports/production-totals-reports/production-totals-reports.component';
import { ProductionQualityChartComponent } from './features/sfl/reports/production-quality-chart/production-quality-chart.component';
import { ProductionTrendChartComponent } from './features/sfl/reports/production-trend-chart/production-trend-chart.component';
import { RejectionGraphComponent } from './features/sfl/reports/rejection-graph/rejection-graph.component';
import { BarcodeSearchReportComponent } from './features/sfl/reports/barcode-search-report/barcode-search-report.component';

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
