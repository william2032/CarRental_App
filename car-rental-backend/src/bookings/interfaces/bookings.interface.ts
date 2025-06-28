import { $Enums } from '../../../generated/prisma';
import BookingStatus = $Enums.BookingStatus;

export interface Booking {
  id: string;
  bookingNumber: string;
  userId: string;
  vehicleId: string;
  startDate: Date;
  endDate: Date;
  baseAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
  locationId?: string;
}
