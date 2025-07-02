import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { $Enums } from '../../../generated/prisma';
import UserRole = $Enums.UserRole;

export class CreateAgentDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  phone?: string;

  readonly role: UserRole = UserRole.AGENT;
}
