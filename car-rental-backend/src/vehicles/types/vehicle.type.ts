import { Vehicle as PrismaVehicle } from '../../../generated/prisma';
import { stringsToImages } from '../../utils/vehicle-image';

export type VehicleWithParsedImages = Omit<PrismaVehicle, 'images'> & {
  images: { url: string; public_id: string }[];
};

// Helper function to transform Prisma Vehicle to VehicleWithParsedImages
export function transformVehicle(
  vehicle: PrismaVehicle,
): VehicleWithParsedImages {
  return {
    ...vehicle,
    images: stringsToImages(vehicle.images as string[]),
  };
}

export function transformVehicles(
  vehicles: PrismaVehicle[],
): VehicleWithParsedImages[] {
  return vehicles.map(transformVehicle);
}
