import { $Enums } from '../../../generated/prisma';
import BookingStatus = $Enums.BookingStatus;

export interface BookingResponse {
  id: string;
  userId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  baseAmount: number;
  discountAmount?: number;
  totalAmount: number;
  status: BookingStatus;
  locationId?: string;
  createdAt: string;
  updatedAt: string;
}
