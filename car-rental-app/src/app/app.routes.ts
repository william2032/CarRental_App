import { Routes } from '@angular/router';
import {LandingPageComponent} from './components/landing-page/landing-page.component';
import {AuthComponent} from "./components/auth/auth.component";
import {VehicleDetailsComponent} from './components/vehicle-details/vehicle-details.component';
import {MyBookingsComponent} from './components/my-booking/my-booking.component';
import {AboutUsComponent} from './components/about-us/about-us.component';
import {AdminDashboardPage} from './components/admin/admin.component';
import {VehiclesPage} from './components/admin/vehicles/vehicle.page';
import {AuthInterceptor} from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'vehicles/:id', component: VehicleDetailsComponent },
  { path: 'bookings', component: MyBookingsComponent },
  { path: 'about-us', component: AboutUsComponent },
  {
    path: 'admin',
    data: { roles: ['ADMIN', 'AGENT'] },
    component: AdminDashboardPage, // contains <router-outlet>
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'overview',
        loadComponent: () =>
          import('./components/admin/overview/admin-overview.component').then(
            (m) => m.AdminOverviewComponent
          ),
      },
      {
        path: 'add-vehicles',
        loadComponent: () =>
          import('./components/admin/vehicles/vehicle.page').then(
            (m) => m.VehiclesPage
          ),
      },
      // Add other child routes here
    ],
  },


  { path: 'login', component: AuthComponent, data: { mode: 'login' } },
  { path: 'register', component: AuthComponent, data: { mode: 'register' } },
  { path: 'forgot-password', component: AuthComponent, data: { mode: 'forgot-password' } },
  { path: 'reset-password', component: AuthComponent, data: { mode: 'reset-password' } },
  { path: '**', redirectTo: '' }

];
