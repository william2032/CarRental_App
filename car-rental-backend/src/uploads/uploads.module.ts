import { Module } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UploadsController } from './uploads.controller';

@Module({
  providers: [CloudinaryService],
  controllers: [UploadsController],
})
export class UploadsModule {}
