import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { Vehicle } from './interfaces/vehicle.interface';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CreateVehiclesDto,
  UpdateVehiclesDto,
  VehicleResponseDto,
} from './dtos';
import { Roles } from '../auth/decorators/role-decorator';
import { $Enums } from '../../generated/prisma';
import UserRole = $Enums.UserRole;
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { VehicleWithParsedImages } from './types/vehicle.type';
import { vehicleUploadConfig } from '../utils/multer.config';
import { FilesInterceptor } from '@nestjs/platform-express';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

@ApiTags('Vehicles')
@ApiBearerAuth()
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT, UserRole.ADMIN)
  @UseInterceptors(FilesInterceptor('files[]', 10, vehicleUploadConfig))
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Create a new vehicle with images' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        createVehicleDto: {
          type: 'string',
          description: 'JSON string of CreateVehiclesDto',
        },
        'files[]': {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Vehicle created successfully',
    type: VehicleResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data or file type' })
  async create(
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<Vehicle> {
    try {
      // Log the body to debug
      console.log('Received body:', body);
      console.log('Files received:', files?.length || 0);

      let vehicleDto: CreateVehiclesDto;

      // Handle different ways the data might come in
      if (typeof body.createVehicleDto === 'string') {
        vehicleDto = JSON.parse(body.createVehicleDto);
      } else if (
        body.createVehicleDto &&
        typeof body.createVehicleDto === 'object'
      ) {
        vehicleDto = body.createVehicleDto;
      } else if (typeof body === 'string') {
        // Sometimes the entire body might be a JSON string
        const parsedBody = JSON.parse(body);
        vehicleDto = parsedBody.createVehicleDto || parsedBody;
      } else {
        throw new BadRequestException(
          'createVehicleDto not found in request body',
        );
      }

      // Validate the DTO using class-transformer and class-validator
      const vehicleDtoInstance = plainToClass(CreateVehiclesDto, vehicleDto);
      const errors = await validate(vehicleDtoInstance);

      if (errors.length > 0) {
        throw new BadRequestException(
          'Validation failed: ' +
            errors
              .map((e) => Object.values(e.constraints || {}))
              .flat()
              .join(', '),
        );
      }

      return this.vehiclesService.create(vehicleDtoInstance, files || []);
    } catch (error) {
      console.error('Error creating vehicle:', error);

      if (error instanceof SyntaxError) {
        throw new BadRequestException(
          'Invalid JSON format in createVehicleDto: ' + error.message,
        );
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        'Failed to create vehicle: ' + error.message,
      );
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT, UserRole.ADMIN)
  @UseInterceptors(FilesInterceptor('files[]', 10, vehicleUploadConfig))
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Update a vehicle by ID with optional images' })
  @ApiParam({ name: 'id', description: 'Vehicle ID', type: String })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        updateVehicleDto: {
          type: 'string',
          description: 'JSON string of UpdateVehiclesDto',
        },
        'files[]': {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          nullable: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Vehicle updated successfully',
    type: VehicleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data or file type' })
  async update(
    @Param('id') id: string,
    @Body('updateVehicleDto') updateVehicleDto: string,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ): Promise<Vehicle> {
    const vehicleDto: UpdateVehiclesDto = updateVehicleDto
      ? JSON.parse(updateVehicleDto)
      : {};
    return this.vehiclesService.update(id, vehicleDto, files);
  }

  @Get()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.CUSTOMER, UserRole.AGENT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Retrieve all vehicles' })
  @ApiResponse({
    status: 200,
    description: 'List of all vehicles',
    type: [VehicleResponseDto],
  })
  async findAll(): Promise<{
    vehicles: { vehicles: VehicleWithParsedImages[] };
  }> {
    const vehicles = await this.vehiclesService.findAll();
    return { vehicles };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a vehicle by ID' })
  @ApiParam({ name: 'id', description: 'Vehicle ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Vehicle found',
    type: VehicleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  findOne(@Param('id') id: string): Promise<Vehicle> {
    return this.vehiclesService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a vehicle by ID' })
  @ApiParam({ name: 'id', description: 'Vehicle ID', type: String })
  @ApiResponse({ status: 204, description: 'Vehicle deleted successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.vehiclesService.remove(id);
  }
}
