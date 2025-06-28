import { CreateBookingDto } from './create-booking.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {}
