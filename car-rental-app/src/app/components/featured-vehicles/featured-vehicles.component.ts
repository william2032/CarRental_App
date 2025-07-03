import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {VehicleService} from '../../services/vehicle.service';
import {DisplayVehicle, Vehicle} from '../../shared/models/vehicle.model';

@Component({
  selector: 'app-featured-vehicles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './featured-vehicles.component.html',
  styleUrls: ['./featured-vehicles.component.scss'],
})
export class FeaturedVehiclesComponent implements OnInit {
  vehicles: DisplayVehicle[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private vehicleService: VehicleService, private router: Router) {}

  navigateToVehicleDetails(vehicleId: string): void {
    this.router.navigate(['/vehicles', vehicleId]);
  }

  navigateToAllVehicles(): void {
    this.router.navigate(['/all-vehicles']);
  }

  ngOnInit(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (vehicles) => {
        // Map all vehicles first
        const allVehicles = vehicles.map((v: Vehicle) => {
          const primaryImage = v.images?.find(img => img.isPrimary)?.url || '';
          return {
            id: v.id,
            name: `${v.make} ${v.model}`,
            seats: v.seats,
            category: v.category,
            price: v.pricePerDay,
            image: primaryImage,
            transmission: v.transmission,
            location: v.location?.name,
            year: v.year,
            gasoline: v.fuelType,
            available: v.isAvailable,
          };
        });

        // Filter to show only 6 cars (preferably available ones first)
        this.vehicles = allVehicles
          .sort((a, b) => {
            // Sort by availability first (available cars first)
            if (a.available && !b.available) return -1;
            if (!a.available && b.available) return 1;
            return 0;
          })
          .slice(0, 6);

        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message;
      },
    });
  }
}
