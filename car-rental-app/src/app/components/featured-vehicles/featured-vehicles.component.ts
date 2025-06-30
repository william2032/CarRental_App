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


  constructor(private vehicleService: VehicleService,private router: Router) {}
  navigateToVehicleDetails(vehicleId: string): void {
    this.router.navigate(['/vehicles', vehicleId]);
  }
  ngOnInit(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (vehicles) => {
        this.vehicles = vehicles.map((v: Vehicle) => ({
          id: v.id,
          name: `${v.make} ${v.model}`,
          seats: v.seats,
          category: v.category,
          price: v.pricePerDay,
          image: v.images[0] ,
          transmission: v.transmission,
          location: v.location?.name,
          year: v.year,
          gasoline: v.fuelType,
          available: v.isAvailable,
        }));
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message;
      },
    });
  }
}
