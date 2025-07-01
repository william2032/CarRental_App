// src/vehicles/vehicles.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Vehicle } from './interfaces/vehicle.interface';
import { CreateVehiclesDto, UpdateVehiclesDto } from './dtos';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { imagesToStrings, stringsToImages } from '../utils/vehicle-image';
import {
  transformVehicle,
  transformVehicles,
  VehicleWithParsedImages,
} from './types/vehicle.type';

@Injectable()
export class VehiclesService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createVehicleDto: CreateVehiclesDto,
    files?: Express.Multer.File[],
  ): Promise<Vehicle> {
    let locationId = createVehicleDto.locationId;

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

    let images: Array<{ url: string; public_id: string }> = [];

    if (files && files.length > 0) {
      try {
        const uploadResults = await Promise.all(
          files.map((file) => this.cloudinaryService.uploadFile(file)),
        );

        images = uploadResults.map((res) => ({
          url: res.secure_url,
          public_id: res.public_id,
        }));
      } catch (error) {
        throw new BadRequestException(
          `Failed to upload images: ${error.message}`,
        );
      }
    }

    // Convert images to strings for database storage
    const imageStrings = imagesToStrings(images);

    const newVehicle = await this.prisma.vehicle.create({
      data: {
        ...createVehicleDto,
        locationId,
        isAvailable: createVehicleDto.isAvailable ?? true,
        images: imageStrings, // Store as string array
      },
    });

    // Convert back to objects for the response
    return {
      ...newVehicle,
      images: stringsToImages(newVehicle.images), // Convert back to objects
    };
  }

  async findOne(id: string): Promise<VehicleWithParsedImages> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { location: true },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    return transformVehicle(vehicle);
  }

  async findAll(): Promise<{ vehicles: VehicleWithParsedImages[] }> {
    const vehicles = await this.prisma.vehicle.findMany({
      include: { location: true },
    });

    return { vehicles: transformVehicles(vehicles) };
  }

  async update(
    id: string,
    updateVehicleDto: UpdateVehiclesDto,
    files?: Express.Multer.File[],
  ): Promise<VehicleWithParsedImages> {
    // Changed from Vehicle to VehicleWithParsedImages
    const existingVehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!existingVehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    let images: Array<{ url: string; public_id: string }> = [];

    // If new files are uploaded, process them
    if (files && files.length > 0) {
      try {
        const uploadResults = await Promise.all(
          files.map((file) => this.cloudinaryService.uploadFile(file)),
        );

        images = uploadResults.map((res) => ({
          url: res.secure_url,
          public_id: res.public_id,
        }));

        // Delete old images from Cloudinary if needed
        const oldImages = stringsToImages(existingVehicle.images); // Add type cast
        if (oldImages.length > 0) {
          await Promise.all(
            oldImages.map((img) =>
              this.cloudinaryService.deleteFile(img.public_id),
            ),
          );
        }
      } catch (error) {
        throw new BadRequestException(
          `Failed to upload images: ${error.message}`,
        );
      }
    } else {
      // Keep existing images if no new files uploaded
      images = stringsToImages(existingVehicle.images); // Add type cast
    }

    // Convert images to strings for database storage
    const imageStrings = imagesToStrings(images);

    const updatedVehicle = await this.prisma.vehicle.update({
      where: { id },
      data: {
        ...updateVehicleDto,
        images: imageStrings,
      },
    });

    return transformVehicle(updatedVehicle);
  }

  async remove(id: string): Promise<void> {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }
    const parsedImages = stringsToImages(vehicle.images);

    const deletePromises = parsedImages.map((img) =>
      this.cloudinaryService.deleteFile(img.public_id),
    );
    await Promise.all(deletePromises);

    await this.prisma.vehicle.delete({ where: { id } });
  }
}
