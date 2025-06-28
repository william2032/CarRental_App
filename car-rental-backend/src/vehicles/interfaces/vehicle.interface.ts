import { $Enums } from '../../../generated/prisma';
import FuelType = $Enums.FuelType;
import VehicleType = $Enums.VehicleType;
import TransmissionType = $Enums.TransmissionType;
import VehicleCondition = $Enums.VehicleCondition;
import { Decimal } from 'generated/prisma/runtime/index-browser';

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  fuelType: FuelType;
  category: VehicleType;
  transmission: TransmissionType;
  pricePerDay: Decimal | null;
  pricePerHour?: Decimal | null;
  mileage?: number | null;
  features: string[];
  images: string[];
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  condition: VehicleCondition;
  locationId: string;
}
