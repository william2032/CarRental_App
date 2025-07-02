import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { $Enums } from '../../generated/prisma';
import VehicleType = $Enums.VehicleType;

@Injectable()
export class VehicleCategoryService {
  constructor(private prisma: PrismaService) {}

  // Get all available vehicle categories (enum values)
  findAll() {
    return Object.values(VehicleType).map((category) => ({
      name: category,
      displayName: this.formatCategoryName(category),
    }));
  }

  // Get vehicles by category
  async findVehiclesByCategory(category: VehicleType) {
    if (!Object.values(VehicleType).includes(category)) {
      throw new BadRequestException('Invalid vehicle category');
    }

    return this.prisma.vehicle.findMany({
      where: {
        category: category,
        isAvailable: true,
      },
      include: {
        images: true,
        location: true,
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                profilePicture: true,
              },
            },
          },
        },
      },
    });
  }

  // Get category statistics
  async getCategoryStats() {
    const stats = await this.prisma.vehicle.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
      where: {
        isAvailable: true,
      },
    });

    return stats.map((stat) => ({
      category: stat.category,
      displayName: this.formatCategoryName(stat.category),
      vehicleCount: stat._count.category,
    }));
  }

  // Check if a category has vehicles before any deletion logic
  async checkCategoryUsage(category: VehicleType) {
    if (!Object.values(VehicleType).includes(category)) {
      throw new BadRequestException('Invalid vehicle category');
    }

    const vehicleCount = await this.prisma.vehicle.count({
      where: { category: category },
    });

    return {
      category: category,
      displayName: this.formatCategoryName(category),
      vehicleCount: vehicleCount,
      hasVehicles: vehicleCount > 0,
    };
  }

  // Helper method to format category names for display
  private formatCategoryName(category: VehicleType): string {
    return category
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  // Get available categories (categories that have vehicles)
  async getAvailableCategories() {
    const categories = await this.prisma.vehicle.findMany({
      where: {
        isAvailable: true,
      },
      select: {
        category: true,
      },
      distinct: ['category'],
    });

    return categories.map((item) => ({
      name: item.category,
      displayName: this.formatCategoryName(item.category),
    }));
  }

  // Since categories are now enum values, we can't create/update/delete them
  // These methods are no longer applicable, but I'll leave them here with appropriate responses

  // create() {
  //   throw new BadRequestException(
  //     'Vehicle categories are predefined enum values and cannot be created dynamically. Available categories: ' +
  //       Object.values(VehicleType).join(', '),
  //   );
  // }
  //
  // update() {
  //   throw new BadRequestException(
  //     'Vehicle categories are predefined enum values and cannot be updated. Available categories: ' +
  //       Object.values(VehicleType).join(', '),
  //   );
  // }
  //
  // delete() {
  //   throw new BadRequestException(
  //     'Vehicle categories are predefined enum values and cannot be deleted. Available categories: ' +
  //       Object.values(VehicleType).join(', '),
  //   );
  // }
}
