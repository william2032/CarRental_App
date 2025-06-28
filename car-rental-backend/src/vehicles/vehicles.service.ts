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
    let locationId = createVehicleDto.locationId;

    // If not provided, fetch the first available active location
    if (!locationId) {
      const defaultLocation = await this.prisma.location.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      });

      if (!defaultLocation) {
        throw new BadRequestException(
          'No active locations available to assign to this vehicle.',
        );
      }

      locationId = defaultLocation.id;
    }

    return this.prisma.vehicle.create({
      data: {
        ...createVehicleDto,
        locationId,
        isAvailable: createVehicleDto.isAvailable ?? true,
      },
    });
  }

  async findAll(): Promise<Vehicle[]> {
    return this.prisma.vehicle.findMany({
      include: { location: true },
    });
  }

  async findOne(id: string): Promise<Vehicle> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { location: true },
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
    return this.prisma.vehicle.update({
      where: { id },
      data: updateVehicleDto,
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
