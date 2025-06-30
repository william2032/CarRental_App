import { Routes } from '@angular/router';
import {LandingPageComponent} from './components/landing-page/landing-page.component';
import {AuthComponent} from "./components/auth/auth.component";
import {VehicleDetailsComponent} from './components/vehicle-details/vehicle-details.component';
import {MyBookingsComponent} from './components/my-booking/my-booking.component';
import {AboutUsComponent} from './components/about-us/about-us.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'vehicles/:id', component: VehicleDetailsComponent },
  { path: 'bookings', component: MyBookingsComponent },
  { path: 'about-us', component: AboutUsComponent },


  { path: 'login', component: AuthComponent, data: { mode: 'login' } },
  { path: 'register', component: AuthComponent, data: { mode: 'register' } },
  { path: 'forgot-password', component: AuthComponent, data: { mode: 'forgot-password' } },
  { path: 'reset-password', component: AuthComponent, data: { mode: 'reset-password' } },
  { path: '**', redirectTo: '' }

];
