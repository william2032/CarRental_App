import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Vehicle } from './interfaces/vehicle.interface';
import { CreateVehiclesDto, UpdateVehiclesDto } from './dtos';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async create(createVehicleDto: CreateVehiclesDto): Promise<Vehicle> {
    const {
      images,
      locationId: providedLocationId,
      isAvailable = true,
      ...vehicleData
    } = createVehicleDto;

    let finalLocationId = providedLocationId;

    // If not provided, fetch the first available active location
    if (!finalLocationId) {
      const defaultLocation = await this.prisma.location.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      });

      if (!defaultLocation) {
        throw new BadRequestException(
          'No active locations available to assign to this vehicle.',
        );
      }
      finalLocationId = defaultLocation.id;
    }

    return this.prisma.vehicle.create({
      data: {
        ...vehicleData,
        isAvailable,
        locationId: finalLocationId,
        images:
          images && images.length > 0
            ? {
                create: images.map((url, index) => ({
                  url,
                  isPrimary: index === 0,
                })),
              }
            : undefined,
      },
    });
  }

  async findAll(): Promise<Vehicle[]> {
    return this.prisma.vehicle.findMany({
      include: { location: true, images: true },
    });
  }

  async updateAvailability(id: string, isAvailable: boolean) {
    return this.prisma.vehicle.update({
      where: { id },
      data: { isAvailable },
    });
  }

  async findOne(id: string): Promise<Vehicle> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { location: true, images: true },
    });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }
    return vehicle;
  }

  async update(
    id: string,
    updateVehicleDto: UpdateVehiclesDto,
  ): Promise<Vehicle> {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }
    const { images, ...updateData } = updateVehicleDto;
    return this.prisma.vehicle.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string): Promise<void> {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }
    await this.prisma.vehicle.delete({ where: { id } });
  }
}
