import {Location} from './location.model';

export interface VehicleImage {
  id: string;
  url: string;
  isPrimary: boolean;
  vehicleId: string;
}

export interface Vehicle {
  id: string;
  make: string;
  seats: number;
  model: string;
  year: number;
  fuelType: string;
  category: string;
  transmission: string;
  pricePerDay: number;
  pricePerHour?: number;
  mileage?: number;
  features: string[];
  images: VehicleImage[];
  isAvailable: boolean;
  condition: string;
  location: Location,
  createdAt: string;
  updatedAt: string;
}

export interface DisplayVehicle {
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
