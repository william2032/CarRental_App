import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';
import {$Enums} from "../../../generated/prisma";
import BookingStatus = $Enums.BookingStatus;

export class CreateBookingDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  vehicleId: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @IsNotEmpty()
  @IsNumber()
  baseAmount: number;

  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @IsNotEmpty()
  @IsNumber()
  totalAmount: number;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsString()
  locationId?: string;
}
