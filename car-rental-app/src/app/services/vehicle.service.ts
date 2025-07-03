import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehicle } from '../shared/models/vehicle.model';
import {environment} from '../../environments/environment';
import {AuthService} from './auth.service';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private apiUrl = `${environment.apiUrl}/vehicles`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
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
  deleteVehicle(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  toggleAvailability(id: string, isAvailable: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/availability`, {
      isAvailable,
    }, { headers: this.getHeaders() });
  }

  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}`, { headers: this.getHeaders() });
  }

  getVehicleById(id: string): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
  editVehicle(id: string, updatedData: Partial<Vehicle>): Observable<Vehicle> {
    return this.http.patch<Vehicle>(`${this.apiUrl}/${id}`, updatedData, {
      headers: this.getHeaders(),
    });
  }
}
