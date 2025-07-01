import { Vehicle as PrismaVehicle } from '../../../generated/prisma';

export type VehicleWithParsedImages = Omit<PrismaVehicle, 'images'> & {
  images: { url: string; public_id: string }[];
};

// Transform Prisma Image model to { url: string; public_id: string }[]
export function transformImages(
  images: { url: string; publicId: string }[],
): { url: string; public_id: string }[] {
  return images.map((image) => ({
    url: image.url,
    public_id: image.publicId,
  }));
}

// Transform Prisma Vehicle to VehicleWithParsedImages
export function transformVehicle(
  vehicle: PrismaVehicle & { images: { url: string; publicId: string }[] },
): VehicleWithParsedImages {
  return {
    ...vehicle,
    images: transformImages(vehicle.images),
  };
}

export function transformVehicles(
  vehicles: (PrismaVehicle & { images: { url: string; publicId: string }[] })[],
): VehicleWithParsedImages[] {
  return vehicles.map(transformVehicle);
}
