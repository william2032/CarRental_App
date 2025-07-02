import { Component } from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {AdminService} from '../../services/admin.service';
import {AuthService} from '../../services/auth.service';
import {SystemStats} from '../../shared/models/system-stats.model';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    NgIf,
    RouterLinkActive
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
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
