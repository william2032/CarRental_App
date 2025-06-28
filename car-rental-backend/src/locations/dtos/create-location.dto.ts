import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class CreateLocationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
export class LocationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  country: string;

  @ApiProperty({ default: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}