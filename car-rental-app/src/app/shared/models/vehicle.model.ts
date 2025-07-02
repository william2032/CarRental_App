import {Location} from './location.model';

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
  pricePerHour: number;
  mileage?: number;
  features: string[];
  images: string[];
  isAvailable: boolean;
  condition: string;
  locationId: string;
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
  locationId: string;
  gasoline: string;
  available: boolean;
}

export interface CreateVehicle {
  make: string;
  model: string;
  year: number;
  fuelType: string;
  seats: number;
  category: string;
  transmission: string;
  pricePerDay: number;
  pricePerHour: number;
  description:string;
  mileage?: number;
  features: string[];
  images: string[];
  isAvailable: boolean;
  condition: string;
  locationId: string;
}
