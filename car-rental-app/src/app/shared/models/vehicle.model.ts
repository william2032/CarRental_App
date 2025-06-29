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
  pricePerHour?: number;
  mileage?: number;
  features: string[];
  images: string[];
  isAvailable: boolean;
  condition: string;
  location: Location,
  createdAt: string;
  updatedAt: string;
}
