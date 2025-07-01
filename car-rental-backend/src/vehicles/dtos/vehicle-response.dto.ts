import { ApiProperty } from '@nestjs/swagger';
import { $Enums, Prisma, VehicleType } from '../../../generated/prisma';
import FuelType = $Enums.FuelType;
import TransmissionType = $Enums.TransmissionType;
import Decimal = Prisma.Decimal;
import VehicleCondition = $Enums.VehicleCondition;
import { IsArray, IsOptional } from 'class-validator';

export class VehicleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  make: string;

  @ApiProperty()
  model: string;

  @ApiProperty()
  year: number;

  @ApiProperty({ enum: FuelType })
  fuelType: FuelType;

  @ApiProperty({ enum: VehicleType })
  category: VehicleType;

  @ApiProperty({ enum: TransmissionType })
  transmission: TransmissionType;

  @ApiProperty({ type: Number, nullable: true })
  pricePerDay: Decimal | null;

  @ApiProperty({ type: Number, required: false, nullable: true })
  pricePerHour?: Decimal | null;

  @ApiProperty({ type: Number, required: false, nullable: true })
  mileage?: number | null;

  @ApiProperty({ type: [String] })
  features: string[];

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        public_id: { type: 'string' },
      },
    },
  })
  images: { url: string; public_id: string }[];

  @ApiProperty()
  isAvailable: boolean;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiProperty({ enum: VehicleCondition })
  condition: VehicleCondition;

  @ApiProperty()
  locationId: string;
}
