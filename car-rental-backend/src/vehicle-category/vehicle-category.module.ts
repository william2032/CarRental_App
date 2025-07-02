import { Module } from '@nestjs/common';
import { VehicleCategoryController } from './vehicle-category.controller';
import { VehicleCategoryService } from './vehicle-category.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [VehicleCategoryController],
  providers: [VehicleCategoryService, PrismaService],
  exports: [VehicleCategoryService],
})
export class VehicleCategoryModule {}
