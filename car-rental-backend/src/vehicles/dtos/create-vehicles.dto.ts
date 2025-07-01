import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { $Enums } from '../../../generated/prisma';
import FuelType = $Enums.FuelType;
import VehicleType = $Enums.VehicleType;
import TransmissionType = $Enums.TransmissionType;
import VehicleCondition = $Enums.VehicleCondition;
import { Transform } from 'class-transformer';

export class CreateVehiclesDto {
  @IsNotEmpty()
  @IsString()
  make: string;

  @IsNotEmpty()
  @IsString()
  model: string;

  @IsNotEmpty()
  @IsInt()
  year: number;

  @IsNotEmpty()
  @IsEnum(FuelType)
  fuelType: FuelType;

  @IsNotEmpty()
  @IsEnum(VehicleType)
  category: VehicleType;

  @IsNotEmpty()
  @IsEnum(TransmissionType)
  transmission: TransmissionType;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'pricePerDay must be a number with up to 2 decimal places' },
  )
  pricePerDay: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'pricePerHour must be a number with up to 2 decimal places' },
  )
  pricePerHour?: number;

  @IsOptional()
  @IsInt()
  mileage?: number;

  @IsNotEmpty()
  @IsInt()
  seats: number;
  @IsArray()
  @IsString({ each: true })
  features: string[];

  @IsOptional()
  @IsArray()
  images?: Array<{ url: string; public_id: string }>;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsNotEmpty()
  @IsEnum(VehicleCondition)
  condition: VehicleCondition;

  @IsOptional()
  @IsString()
  locationId: string;
}
