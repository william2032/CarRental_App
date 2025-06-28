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
  Request,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Booking } from './interfaces/booking.interface';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserRole } from 'generated/prisma';
import { BookingResponse } from './interfaces';
import {RolesGuard} from "../auth/guards/roles.guard";
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {Roles} from "../auth/decorators/role-decorator";

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({
    status: 201,
    description: 'Booking created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Vehicle or Location not found' })
  @UsePipes(new ValidationPipe())
  create(
    @Body() createBookingDto: CreateBookingDto,
    @Request() req,
  ): Promise<Booking> {
    return this.bookingsService.create(
      createBookingDto,
      req.user.id,
      req.user.role,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieve all bookings (filtered by role)' })
  @ApiResponse({
    status: 200,
    description: 'List of bookings',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll(@Request() req): Promise<Booking[]> {
    return this.bookingsService.findAll(req.user.id, req.user.role);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieve a booking by ID' })
  @ApiParam({ name: 'id', description: 'Booking ID', type: String })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  findOne(@Param('id') id: string, @Request() req): Promise<Booking> {
    return this.bookingsService.findOne(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a booking by ID' })
  @ApiParam({ name: 'id', description: 'Booking ID', type: String })
  @ApiBody({ type: UpdateBookingDto })
  @ApiResponse({
    status: 200,
    description: 'Booking updated successfully',
    type: BookingResponse,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @UsePipes(new ValidationPipe())
  update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @Request() req,
  ): Promise<Booking> {
    return this.bookingsService.update(
      id,
      updateBookingDto,
      req.user.id,
      req.user.role,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a booking by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Booking ID', type: String })
  @ApiResponse({ status: 204, description: 'Booking deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.bookingsService.remove(id);
  }
}
