import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseEnumPipe,
} from '@nestjs/common';
import { VehicleCategoryService } from './vehicle-category.service';
import { $Enums } from '../../generated/prisma';
import VehicleType = $Enums.VehicleType;
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import UserRole = $Enums.UserRole;
import { Roles } from '../auth/decorators/role-decorator';

@Controller('vehicle-categories')
export class VehicleCategoryController {
  constructor(private service: VehicleCategoryService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  // Get available categories that have vehicles
  @Get('available')
  getAvailableCategories() {
    return this.service.getAvailableCategories();
  }

  // Get vehicles by category - Public endpoint
  @Get(':category/vehicles')
  findVehiclesByCategory(
    @Param('category', new ParseEnumPipe(VehicleType)) category: VehicleType,
  ) {
    return this.service.findVehiclesByCategory(category);
  }

  // Admin only endpoints
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT, UserRole.ADMIN)
  getCategoryStats() {
    return this.service.getCategoryStats();
  }

  @Get(':category/usage')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT, UserRole.ADMIN)
  checkCategoryUsage(
    @Param('category', new ParseEnumPipe(VehicleType)) category: VehicleType,
  ) {
    return this.service.checkCategoryUsage(category);
  }

  // These endpoints now return appropriate error messages
  @Get('create-info')
  getCreateInfo() {
    return {
      message: 'Vehicle categories are predefined enum values',
      availableCategories: Object.values(VehicleType),
      note: 'Categories cannot be created, updated, or deleted dynamically',
    };
  }
}
