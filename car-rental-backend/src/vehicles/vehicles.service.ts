import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehiclesDto, UpdateVehiclesDto } from './dtos';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import {
  transformVehicle,
  transformVehicles,
  VehicleWithParsedImages,
} from './types/vehicle.type';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class VehiclesService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createVehicleDto: CreateVehiclesDto,
    files?: Express.Multer.File[],
  ): Promise<VehicleWithParsedImages> {
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

    let images: Array<{ url: string; publicId: string }> = [];

    if (files && files.length > 0) {
      try {
        const uploadResults: UploadApiResponse[] = await Promise.all(
          files.map((file) => this.cloudinaryService.uploadFile(file)),
        );
        images = uploadResults.map((res) => ({
          url: res.secure_url,
          publicId: res.public_id,
        }));
      } catch (error) {
        throw new BadRequestException(
          `Failed to upload images: ${error.message}`,
        );
      }
    }

    const newVehicle = await this.prisma.vehicle.create({
      data: {
        ...createVehicleDto,
        locationId,
        isAvailable: createVehicleDto.isAvailable ?? true,
        images: {
          create: images.map((image) => ({
            url: image.url,
            publicId: image.publicId,
          })),
        },
      },
      include: {
        images: true,
        location: true,
      },
    });

    return transformVehicle(newVehicle);
  }

  async findOne(id: string): Promise<VehicleWithParsedImages> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { images: true, location: true },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    return transformVehicle(vehicle);
  }

  async findAll(): Promise<{ vehicles: VehicleWithParsedImages[] }> {
    const vehicles = await this.prisma.vehicle.findMany({
      include: { images: true, location: true },
    });

    return { vehicles: transformVehicles(vehicles) };
  }

  async update(
    id: string,
    updateVehicleDto: UpdateVehiclesDto,
    files?: Express.Multer.File[],
  ): Promise<VehicleWithParsedImages> {
    const existingVehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!existingVehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    let images: Array<{ url: string; publicId: string }> = [];

    if (files && files.length > 0) {
      try {
        const uploadResults: UploadApiResponse[] = await Promise.all(
          files.map((file) => this.cloudinaryService.uploadFile(file)),
        );
        images = uploadResults.map((res) => ({
          url: res.secure_url,
          publicId: res.public_id,
        }));

        // Delete old images from Cloudinary and database
        if (existingVehicle.images.length > 0) {
          await Promise.all(
            existingVehicle.images.map((img) =>
              this.cloudinaryService.deleteFile(img.publicId),
            ),
          );
          await this.prisma.image.deleteMany({ where: { vehicleId: id } });
        }
      } catch (error) {
        throw new BadRequestException(
          `Failed to upload images: ${error.message}`,
        );
      }
    } else {
      images = existingVehicle.images.map((img) => ({
        url: img.url,
        publicId: img.publicId,
      }));
    }

    const updatedVehicle = await this.prisma.vehicle.update({
      where: { id },
      data: {
        ...updateVehicleDto,
        images: {
          create: images.map((image) => ({
            url: image.url,
            publicId: image.publicId,
          })),
        },
      },
      include: { images: true, location: true },
    });

    return transformVehicle(updatedVehicle);
  }

  async remove(id: string): Promise<void> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    // Delete images from Cloudinary
    if (vehicle.images.length > 0) {
      await Promise.all(
        vehicle.images.map((img) =>
          this.cloudinaryService.deleteFile(img.publicId),
        ),
      );
    }

    // Delete vehicle and related images
    await this.prisma.vehicle.delete({ where: { id } });
  }
}
