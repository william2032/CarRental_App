import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AdminService} from '../../../services/admin.service';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-overview.component.html',
})
export class AdminOverviewComponent implements OnInit {
  stats: any = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getStats().subscribe(data => {
      this.stats = data;
    });
  }
}
