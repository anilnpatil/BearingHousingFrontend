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
import { BarcodeSearchReportComponent } from './features/sfl/reports/barcode-search-report/barcode-search-report.component';
import { ProductionReportComponent } from './features/sfl/reports/production-summary-report/production-summary-report.component';

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
      { path: 'admin', component: Admin, canActivate: [roleGuard('ADMIN')], data: { title: 'Admin' } },
      { path: 'user', component: User, canActivate: [roleGuard('USER')], data: { title: 'User' } },      
      { path: 'barcode-search-report', component: BarcodeSearchReportComponent, data: { title: 'Barcode Search Report' } },
      { path: 'production-summary-report', component: ProductionReportComponent, data: { title: 'Production Summary Report' } }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
