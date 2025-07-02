// location.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {environment} from '../../environments/environment';

export interface Location {
  id: string;
  name: string;
  city: string;
  country: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly apiUrl = `${environment.apiUrl}/locations`;

  constructor(private http: HttpClient) {}

  // Get all locations
  getLocations(): Observable<Location[]> {
    return this.http.get<{ data: Location[] }>(this.apiUrl).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Get a single location by ID
  getLocation(id: string): Observable<Location> {
    return this.http.get<{ data: Location }>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Create a new location
  createLocation(location: Partial<Location>): Observable<Location> {
    return this.http.post<{ data: Location }>(this.apiUrl, location).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Update an existing location
  updateLocation(id: string, location: Partial<Location>): Observable<Location> {
    return this.http.put<{ data: Location }>(`${this.apiUrl}/${id}`, location).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Delete a location
  deleteLocation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Error handling
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred while processing your request';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = error.error.message || 'Invalid request data';
          break;
        case 401:
          errorMessage = 'Unauthorized access. Please log in again.';
          break;
        case 404:
          errorMessage = 'Location not found';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
