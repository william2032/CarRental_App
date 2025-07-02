import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {SystemStats} from '../shared/models/system-stats.interface';
import {environment} from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<SystemStats> {
    return this.http.get<SystemStats>(`${this.apiUrl}/admin/stats`);
  }
}
