import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {VehicleService} from '../../services/vehicle.service';
import {Vehicle} from '../../shared/models/vehicle.model';

interface DisplayVehicle {
  id: string;
  name: string;
  seats: number;
  category: string;
  price: number;
  image: string;
  year: number;
  transmission: string;
  location: string;
  gasoline: string;
  available: boolean;
}

@Component({
  selector: 'app-featured-vehicles',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './featured-vehicles.component.html',
  styleUrls: ['./featured-vehicles.component.scss'],
})
export class FeaturedVehiclesComponent implements OnInit {
  vehicles: DisplayVehicle[] = [];
  isLoading = true;
  errorMessage = '';


  constructor(private vehicleService: VehicleService) {}

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
