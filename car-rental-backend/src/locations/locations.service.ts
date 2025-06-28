import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Location } from './interfaces/location.interface';
import {CreateLocationDto, UpdateLocationDto} from "./dtos";

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    return this.prisma.location.create({
      data: {
        ...createLocationDto,
        isActive: createLocationDto.isActive ?? true,
      },
    });
  }

  async findAll(): Promise<Location[]> {
    return this.prisma.location.findMany();
  }

  async findOne(id: string): Promise<Location> {
    const location = await this.prisma.location.findUnique({
      where: { id },
      include: { vehicles: true, bookings: true },
    });
    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }
    return location;
  }

  async update(
    id: string,
    updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    const location = await this.prisma.location.findUnique({ where: { id } });
    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }
    return this.prisma.location.update({
      where: { id },
      data: updateLocationDto,
    });
  }

  async remove(id: string): Promise<void> {
    const location = await this.prisma.location.findUnique({ where: { id } });
    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }
    await this.prisma.location.delete({ where: { id } });
  }
}
