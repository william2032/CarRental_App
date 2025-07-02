import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import { AuthService } from './app/services/auth.service';
import {provideRouter} from '@angular/router';
import {routes} from './app/app.routes';
import {authInterceptor} from './app/interceptors/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),
    AuthService
  ]
}).catch(err => console.error(err));
