import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {SystemStats} from '../shared/models/system-stats.model';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}`;
  constructor(private http: HttpClient,private authService: AuthService) {}

  getStats(): Observable<SystemStats> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    })
    return this.http.get<SystemStats>(`${this.apiUrl}/admin/stats`, {headers});
  }
}
