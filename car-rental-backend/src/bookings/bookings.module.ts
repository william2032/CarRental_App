import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  providers: [BookingsService, PrismaService, MailerService, CloudinaryService],
  controllers: [BookingsController],
})
export class BookingsModule {}
