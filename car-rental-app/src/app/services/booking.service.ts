import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Router} from '@angular/router';
import {Observable, switchMap, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {Booking, CreateBookingDto} from '../shared/models/booking.model';
import {environment} from '../../environments/environment';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  private isAuthenticated(): boolean {
    return this.authService.isLoggedIn();
  }

  createBooking(bookingData: CreateBookingDto): Observable<Booking | string> {
    // Check authentication before making request
    if (!this.isAuthenticated()) {
      return throwError(() => new Error('User not authenticated'));
    }

    // First, check for existing bookings
    const params = new HttpParams()
      .set('userId', bookingData.userId)
      .set('vehicleId', bookingData.vehicleId);

    return this.http.get<Booking[]>(`${this.apiUrl}/bookings`, {
      headers: this.getAuthHeaders(),
      params,
    }).pipe(
      switchMap((bookings) => {
        const hasExistingBooking = bookings.some(booking =>
          (booking.status !== 'CANCELLED' && booking.status !== 'REJECTED') &&
          booking.vehicleId === bookingData.vehicleId &&
          booking.userId === bookingData.userId
        );

        if (hasExistingBooking) {
          setTimeout(() => this.router.navigate(['/bookings']),1500)
          return throwError(() => new Error('Sorry! We have already received your request!'));

        } else {
          return this.http.post<Booking>(`${this.apiUrl}/bookings`, bookingData, {
            headers: this.getAuthHeaders()
          }).pipe(
            tap(() => {
              // Redirect to bookings page after successful booking
              this.router.navigate(['/bookings']);
            }),
            catchError((error) => {
              if (error.status === 401) {
                // Token might be expired or invalid
                localStorage.removeItem('access_token');
                this.router.navigate(['/login']);
              }
              return throwError(() => error);
            })
          );
        }
      })
    );
  }


  getAllBookings(): Observable<Booking[]> {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']);
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<Booking[]>(
      `${this.apiUrl}/bookings`,
      {headers: this.getAuthHeaders()}
    ).pipe(
      catchError((error) => {
        if (error.status === 401) {
          localStorage.removeItem('access_token');
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  getBookingById(id: string): Observable<Booking> {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']);
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<Booking>(
      `${this.apiUrl}/bookings/${id}`,
      {headers: this.getAuthHeaders()}
    ).pipe(
      catchError((error) => {
        if (error.status === 401) {
          localStorage.removeItem('access_token');
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  updateBooking(id: string, updateData: Partial<CreateBookingDto>): Observable<Booking> {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']);
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.patch<Booking>(
      `${this.apiUrl}/bookings/${id}`,
      updateData,
      {headers: this.getAuthHeaders()}
    ).pipe(
      catchError((error) => {
        if (error.status === 401) {
          localStorage.removeItem(<string>this.authService.getToken());
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  cancelBooking(id: string): Observable<Booking> {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']);
      return throwError(() => new Error('User not authenticated'));
    }
    return this.http.patch<Booking>(`${this.apiUrl}/bookings/${id}/cancel`, {},
      {headers: this.getAuthHeaders()}
    ).pipe(
      catchError((error) => {
        if (error.status === 401) {
          localStorage.removeItem('access_token');
          this.router.navigate(['/auth']);
        }
        return throwError(() => error);
      })
    );
  }

  deleteBooking(id: string): Observable<void> {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']);
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.delete<void>(
      `${this.apiUrl}/bookings/${id}`,
      {headers: this.getAuthHeaders()}
    ).pipe(
      catchError((error) => {
        if (error.status === 401) {
          localStorage.removeItem(<string>this.authService.getToken());
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  approveBooking(id: string): Observable<Booking> {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']);
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.post<Booking>(
      `${this.apiUrl}/bookings/${id}/approve`,
      {},
      {headers: this.getAuthHeaders()}
    ).pipe(
      catchError((error) => {
        if (error.status === 401) {
          localStorage.removeItem(<string>this.authService.getToken());
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  rejectBooking(id: string): Observable<Booking> {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']);
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.post<Booking>(
      `${this.apiUrl}/bookings/${id}/reject`,
      {},
      {headers: this.getAuthHeaders()}
    ).pipe(
      catchError((error) => {
        if (error.status === 401) {
          localStorage.removeItem(<string>this.authService.getToken());
          this.router.navigate(['/auth']);
        }
        return throwError(() => error);
      })
    );
  }

  getPendingBookings(): Observable<Booking[]> {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/auth']);
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<Booking[]>(
      `${this.apiUrl}/bookings/status/pending`,
      {headers: this.getAuthHeaders()}
    ).pipe(
      catchError((error) => {
        if (error.status === 401) {
          localStorage.removeItem(<string>this.authService.getToken());
          this.router.navigate(['/auth']);
        }
        return throwError(() => error);
      })
    );
  }
}
