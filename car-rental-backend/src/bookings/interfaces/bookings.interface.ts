import { $Enums } from '../../../generated/prisma';
import BookingStatus = $Enums.BookingStatus;
import { Decimal } from 'generated/prisma/runtime/library';

export interface Booking {
  id: string;
  bookingNumber: string;
  userId: string;
  vehicleId: string;
  startDate: Date;
  endDate: Date;
  baseAmount: Decimal;
  discountAmount: Decimal;
  totalAmount: Decimal;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
  locationId?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  vehicle?: any;
  Location?: any;
  bookingStatusHistory?: any[];
  payment?: any;
}
