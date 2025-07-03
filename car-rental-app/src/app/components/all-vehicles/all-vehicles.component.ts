import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VehicleService } from '../../services/vehicle.service';
import { DisplayVehicle, Vehicle } from '../../shared/models/vehicle.model';
import {HeaderComponent} from '../header/header.component';
import {FooterComponent} from '../footer/footer.component';

@Component({
  selector: 'app-all-vehicles',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './all-vehicles.component.html',
  styleUrls: ['./all-vehicles.component.scss'],
})
export class AllVehiclesComponent implements OnInit {
  vehicles: DisplayVehicle[] = [];
  filteredVehicles: DisplayVehicle[] = [];
  isLoading = true;
  errorMessage = '';
  searchTerm = '';
  selectedCategory = '';
  selectedTransmission = '';
  selectedLocation = '';
  minPrice = '';
  maxPrice = '';
  showAvailableOnly = false;

  // Filter options
  categories: string[] = [];
  transmissionTypes: string[] = [];
  locations: string[] = [];

  constructor(private vehicleService: VehicleService, private router: Router) {}

  navigateToVehicleDetails(vehicleId: string): void {
    this.router.navigate(['/vehicles', vehicleId]);
  }

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (vehicles) => {
        this.vehicles = vehicles.map((v: Vehicle) => {
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

        // Extract filter options
        this.categories = [...new Set(this.vehicles.map(v => v.category))].filter(Boolean);
        this.transmissionTypes = [...new Set(this.vehicles.map(v => v.transmission))].filter(Boolean);
        this.locations = [...new Set(this.vehicles.map(v => v.location))].filter(Boolean);

        this.filteredVehicles = [...this.vehicles];
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message;
      },
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredVehicles = this.vehicles.filter(vehicle => {
      // Search term filter
      const matchesSearch = !this.searchTerm ||
        vehicle.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        vehicle.category.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        vehicle.location?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        vehicle.transmission.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        vehicle.gasoline.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Category filter
      const matchesCategory = !this.selectedCategory || vehicle.category === this.selectedCategory;

      // Transmission filter
      const matchesTransmission = !this.selectedTransmission || vehicle.transmission === this.selectedTransmission;

      // Location filter
      const matchesLocation = !this.selectedLocation || vehicle.location === this.selectedLocation;

      // Price filter
      const matchesMinPrice = !this.minPrice || vehicle.price >= parseInt(this.minPrice);
      const matchesMaxPrice = !this.maxPrice || vehicle.price <= parseInt(this.maxPrice);

      // Availability filter
      const matchesAvailability = !this.showAvailableOnly || vehicle.available;

      return matchesSearch && matchesCategory && matchesTransmission &&
        matchesLocation && matchesMinPrice && matchesMaxPrice && matchesAvailability;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedTransmission = '';
    this.selectedLocation = '';
    this.minPrice = '';
    this.maxPrice = '';
    this.showAvailableOnly = false;
    this.filteredVehicles = [...this.vehicles];
  }

  get totalResults(): number {
    return this.filteredVehicles.length;
  }
}
