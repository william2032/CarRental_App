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
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { Vehicle } from './interfaces/vehicle.interface';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import {CreateVehiclesDto, UpdateVehiclesDto, VehicleResponseDto} from './dtos';

function UpdateVehicleDto() {}

@ApiTags('Vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Create a new vehicle' })
  @ApiBody({ type: CreateVehiclesDto })
  @ApiResponse({
    status: 201,
    description: 'Vehicle created successfully',
    type: VehicleResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() createVehicleDto: CreateVehiclesDto): Promise<Vehicle> {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all vehicles' })
  @ApiResponse({
    status: 200,
    description: 'List of all vehicles',
    type: [CreateVehiclesDto],
  })
  findAll(): Promise<Vehicle[]> {
    return this.vehiclesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a vehicle by ID' })
  @ApiParam({ name: 'id', description: 'Vehicle ID', type: String })
  @ApiResponse({ status: 200, description: 'Vehicle found', type: VehicleResponseDto })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  findOne(@Param('id') id: string): Promise<Vehicle> {
    return this.vehiclesService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Update a vehicle by ID' })
  @ApiParam({ name: 'id', description: 'Vehicle ID', type: String })
  @ApiBody({ type: UpdateVehicleDto })
  @ApiResponse({
    status: 200,
    description: 'Vehicle updated successfully',
    type: VehicleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  update(
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehiclesDto,
  ): Promise<Vehicle> {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a vehicle by ID' })
  @ApiParam({ name: 'id', description: 'Vehicle ID', type: String })
  @ApiResponse({ status: 204, description: 'Vehicle deleted successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.vehiclesService.remove(id);
  }
}
