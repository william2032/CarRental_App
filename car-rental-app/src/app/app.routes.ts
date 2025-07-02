import { Routes } from '@angular/router';
import {LandingPageComponent} from './components/landing-page/landing-page.component';
import {AuthComponent} from "./components/auth/auth.component";
import {VehicleDetailsComponent} from './components/vehicle-details/vehicle-details.component';
import {MyBookingsComponent} from './components/my-booking/my-booking.component';
import {AboutUsComponent} from './components/about-us/about-us.component';
import {AdminDashboardComponent} from './components/admin-dashboard/admin-dashboard.component';
import {VehiclesAdminComponent} from './pages/vehicles-admin/vehicles-admin.component';

export const routes: Routes = [
  { path: 'home', component: LandingPageComponent },
  { path: 'vehicles/:id', component: VehicleDetailsComponent },
  { path: 'bookings', component:  MyBookingsComponent},
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'admin/add-vehicles', component: VehiclesAdminComponent },
  { path: 'home/about-us', component: AboutUsComponent },


  { path: 'login', component: AuthComponent, data: { mode: 'login' } },
  { path: 'register', component: AuthComponent, data: { mode: 'register' } },
  { path: 'forgot-password', component: AuthComponent, data: { mode: 'forgot-password' } },
  { path: 'reset-password', component: AuthComponent, data: { mode: 'reset-password' } },
  { path: '**', redirectTo: '/home', pathMatch: 'full' },
];
