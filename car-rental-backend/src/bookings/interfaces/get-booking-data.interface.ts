import { $Enums, Prisma } from '../../../generated/prisma';

import PaymentStatus = $Enums.PaymentStatus;
import BookingStatus = $Enums.BookingStatus;
import BookingType = $Enums.BookingType;
import FuelType = $Enums.FuelType;
import VehicleType = $Enums.VehicleType;
import TransmissionType = $Enums.TransmissionType;
import VehicleCondition = $Enums.VehicleCondition;
import UserRole = $Enums.UserRole;
import Decimal = Prisma.Decimal;
import PaymentMethodType = $Enums.PaymentMethodType;

export interface BookingWithRelations {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  bookingNumber: string;
  userId: string;
  vehicleId: string;
  pickupLocation: string;
  returnLocation: string;
  startDate: Date;
  endDate: Date;
  totalAmount: Decimal;
  discountAmount: Decimal;
  baseAmount: Decimal;
  status: BookingStatus;
  type: BookingType;
  locationId?: string | null;
  user: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    password: string;
    role: UserRole;
    name: string;
    phone: string | null;
    profilePicture: string | null;
    city: string | null;
    country: string | null;
  };
  vehicle: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    locationId: string;
    make: string;
    model: string;
    year: number;
    fuelType: FuelType;
    category: VehicleType;
    transmission: TransmissionType;
    pricePerDay: Decimal | null;
    pricePerHour?: Decimal | null;
    mileage: number | null;
    condition: VehicleCondition;
    features: string[];
    isAvailable: boolean;
  };
  location: {
    id: string;
    name: string;
    address: string;
    city: string;
    country: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  bookingStatusHistory: Array<{
    id: string;
    bookingId: string;
    status: BookingStatus;
    createdAt: Date;
    changedBy: string | null;
    reason: string | null;
  }>;
  payment: {
    id: string;
    bookingId: string;
    amount: Decimal;
    status: PaymentStatus;
    type: PaymentMethodType;
    transactionId: string | null;
    paidAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
}
