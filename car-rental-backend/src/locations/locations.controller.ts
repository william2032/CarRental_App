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
import { LocationsService } from './locations.service';
import { Location } from './interfaces/location.interface';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import {CreateLocationDto, UpdateLocationDto} from "./dtos";
import {LocationResponseDto} from "./dtos/create-location.dto";

@ApiTags('Locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Create a new location' })
  @ApiBody({ type: CreateLocationDto })
  @ApiResponse({
    status: 201,
    description: 'Location created successfully',
    type: LocationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() createLocationDto: CreateLocationDto): Promise<Location> {
    return this.locationsService.create(createLocationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all locations' })
  @ApiResponse({
    status: 200,
    description: 'List of all locations',
    type: [LocationResponseDto],
  })
  findAll(): Promise<Location[]> {
    return this.locationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a location by ID' })
  @ApiParam({ name: 'id', description: 'Location ID', type: String })
  @ApiResponse({ status: 200, description: 'Location found', type: LocationResponseDto })
  @ApiResponse({ status: 404, description: 'Location not found' })
  findOne(@Param('id') id: string): Promise<Location> {
    return this.locationsService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Update a location by ID' })
  @ApiParam({ name: 'id', description: 'Location ID', type: String })
  @ApiBody({ type: UpdateLocationDto })
  @ApiResponse({
    status: 200,
    description: 'Location updated successfully',
    type: LocationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Location not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    return this.locationsService.update(id, updateLocationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a location by ID' })
  @ApiParam({ name: 'id', description: 'Location ID', type: String })
  @ApiResponse({ status: 204, description: 'Location deleted successfully' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.locationsService.remove(id);
  }
}
