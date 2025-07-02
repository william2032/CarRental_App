import {Vehicle} from './vehicle.model';

export interface CreateBookingDto {
  userId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  baseAmount: number;
  status: 'PENDING';
  totalAmount: number;
  discountAmount: number;
  pickupLocation: string;
  returnLocation: string;
}

export interface Booking {
  id: string;
  userId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  pickupLocation: string;
  returnLocation: string;
  baseAmount: number;
  totalAmount: number;
  discountAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'ACTIVE' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  vehicle?: Vehicle;
}

export enum BookingStatus {
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  CONFIRMED = 'CONFIRMED',
  ACTIVE =     'ACTIVE',

}




