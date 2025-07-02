import { Module } from '@nestjs/common';
import { VehicleCategoryService } from './vehicle-category.service';
import { VehicleCategoryController } from './vehicle-category.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [VehicleCategoryService, PrismaService],
  controllers: [VehicleCategoryController],
  exports: [VehicleCategoryService],
})
export class VehicleCategoryModule {}
