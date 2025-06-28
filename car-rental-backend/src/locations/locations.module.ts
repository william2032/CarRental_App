import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [LocationsService, PrismaService],
  controllers: [LocationsController],
})
export class LocationsModule {}
