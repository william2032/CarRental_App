import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {SystemStats} from '../../shared/models/system-stats.interface';
import {AdminService} from '../../services/admin.service';
import {AuthService} from '../../services/auth.service';
import {HeaderComponent} from '../header/header.component';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  templateUrl: './admin.component.html',
  imports: [CommonModule, RouterModule, HeaderComponent],
})
export class AdminDashboardPage implements OnInit {
  currentUser: any = null;
  stats: SystemStats | null = null;
  loading = true;

  constructor(private adminService: AdminService, private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.currentUser = this.auth.getCurrentUser();

    if (
      !this.currentUser ||
      !['ADMIN', 'AGENT'].includes(this.currentUser.role)
    ) {
      this.router.navigate(['/login']);
      return;
    }

    this.adminService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch stats:', err);
        this.loading = false;
      },
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/home']);
  }
}
