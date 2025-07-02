import { FilesInterceptor } from '@nestjs/platform-express';
import { BadRequestException } from '@nestjs/common';

export const vehicleUploadConfig = {
  storage: undefined, // This will use memory storage by default
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new BadRequestException(
          'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
        ),
        false,
      );
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10,
  },
};

// Factory function to create the interceptor
export const createVehicleFilesInterceptor = () =>
  FilesInterceptor('files[]', 10, vehicleUploadConfig);
