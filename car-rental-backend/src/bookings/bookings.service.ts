import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dtos/create-booking.dto';
import { $Enums, Booking, Prisma } from '../../generated/prisma';
import UserRole = $Enums.UserRole;
import BookingStatus = $Enums.BookingStatus;
import { UpdateBookingDto } from './dtos/update-bookings.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createBookingDto: CreateBookingDto,
    userId: string,
    userRole: UserRole,
  ): Promise<Booking> {
    // Validate user permissions
    this.validateCustomerPermissions(userRole, createBookingDto.userId, userId);

    // Validate related entities exist
    await this.validateEntitiesExist(createBookingDto);

    // Check vehicle availability for the requested dates
    await this.validateVehicleAvailability(
      createBookingDto.vehicleId,
      new Date(createBookingDto.startDate),
      new Date(createBookingDto.endDate),
    );

    const bookingData = {
      ...createBookingDto,
      bookingNumber: this.generateBookingNumber(),
      status: createBookingDto.status ?? BookingStatus.PENDING,
      discountAmount: createBookingDto.discountAmount ?? 0,
    };

    const booking = await this.prisma.booking.create({
      data: bookingData,
      include: this.getBookingIncludes(),
    });

    // Record status history
    await this.createStatusHistory(
      booking.id,
      booking.status,
      userId,
      'Booking created',
    );

    return booking;
  }

  async findAll(userId: string, userRole: UserRole): Promise<Booking[]> {
    const whereClause = this.buildWhereClause(userRole, userId);

    return this.prisma.booking.findMany({
      where: whereClause,
      include: this.getBookingIncludes(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<Booking> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: this.getBookingIncludes(),
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    // Validate access permissions
    this.validateBookingAccess(booking, userId, userRole);

    return booking;
  }

  async update(
    id: string,
    updateBookingDto: UpdateBookingDto,
    userId: string,
    userRole: UserRole,
  ): Promise<Booking> {
    const existingBooking = await this.findBookingById(id);

    // Validate update permissions
    this.validateUpdatePermissions(
      existingBooking,
      userId,
      userRole,
      updateBookingDto,
    );

    // If vehicle is being changed, validate availability
    if (
      updateBookingDto.vehicleId &&
      updateBookingDto.vehicleId !== existingBooking.vehicleId
    ) {
      await this.validateVehicleAvailability(
        updateBookingDto.vehicleId,
        updateBookingDto.startDate ?? existingBooking.startDate,
        updateBookingDto.endDate ?? existingBooking.endDate,
        id, // Exclude current booking from availability check
      );
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: updateBookingDto,
      include: this.getBookingIncludes(),
    });

    // Record status change if status was updated
    if (
      updateBookingDto.status &&
      updateBookingDto.status !== existingBooking.status
    ) {
      await this.createStatusHistory(
        id,
        updateBookingDto.status,
        userId,
        'Booking status updated',
      );
    }

    return updatedBooking;
  }

  async remove(id: string, userId: string, userRole: UserRole): Promise<void> {
    const booking = await this.findBookingById(id);

    // Validate deletion permissions
    this.validateDeletionPermissions(booking, userId, userRole);

    await this.prisma.booking.delete({
      where: { id },
    });
  }

  async cancelBooking(
    id: string,
    userId: string,
    userRole: UserRole,
    reason?: string,
  ): Promise<Booking> {
    const booking = await this.findBookingById(id);

    // Validate cancellation permissions
    this.validateBookingAccess(booking, userId, userRole);

    // Check if booking can be cancelled
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    if (booking.status === BookingStatus.ACTIVE) {
      throw new BadRequestException('Cannot cancel an active booking');
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
      include: this.getBookingIncludes(),
    });

    // Record cancellation in status history
    await this.createStatusHistory(
      id,
      BookingStatus.CANCELLED,
      userId,
      reason || 'Booking cancelled by user',
    );

    return updatedBooking;
  }

  // Private helper methods
  private validateCustomerPermissions(
    userRole: UserRole,
    targetUserId: string,
    currentUserId: string,
  ): void {
    if (userRole === UserRole.CUSTOMER && targetUserId !== currentUserId) {
      throw new ForbiddenException(
        'Customers can only create bookings for themselves',
      );
    }
  }

  private async validateEntitiesExist(
    createBookingDto: CreateBookingDto,
  ): Promise<void> {
    // Validate vehicle exists and is available
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: createBookingDto.vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException(
        `Vehicle with ID ${createBookingDto.vehicleId} not found`,
      );
    }

    if (!vehicle.isAvailable) {
      throw new BadRequestException('Vehicle is not available for booking');
    }

    // Validate location if provided
    if (createBookingDto.locationId) {
      const location = await this.prisma.location.findUnique({
        where: { id: createBookingDto.locationId },
      });

      if (!location) {
        throw new NotFoundException(
          `Location with ID ${createBookingDto.locationId} not found`,
        );
      }

      if (!location.isActive) {
        throw new BadRequestException('Location is not active');
      }
    }
  }

  private async validateVehicleAvailability(
    vehicleId: string,
    startDate: Date,
    endDate: Date,
    excludeBookingId?: string,
  ): Promise<void> {
    const conflictingBookings = await this.prisma.booking.findMany({
      where: {
        vehicleId,
        id: excludeBookingId ? { not: excludeBookingId } : undefined,
        status: {
          in: [
            BookingStatus.CONFIRMED,
            BookingStatus.ACTIVE,
            BookingStatus.PENDING,
          ],
        },
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
    });

    if (conflictingBookings.length > 0) {
      throw new BadRequestException(
        'Vehicle is not available for the selected dates',
      );
    }
  }

  private buildWhereClause(userRole: UserRole, userId: string) {
    return userRole === UserRole.CUSTOMER ? { userId } : {};
  }

  private validateBookingAccess(
    booking: any,
    userId: string,
    userRole: UserRole,
  ): void {
    if (userRole === UserRole.CUSTOMER && booking.userId !== userId) {
      throw new ForbiddenException('You can only access your own bookings');
    }
  }

  private validateUpdatePermissions(
    booking: any,
    userId: string,
    userRole: UserRole,
    updateDto: UpdateBookingDto,
  ): void {
    if (userRole === UserRole.CUSTOMER) {
      if (booking.userId !== userId) {
        throw new ForbiddenException('You can only update your own bookings');
      }

      // Customers can only update limited fields
      const allowedFields = ['startDate', 'endDate'];
      const attemptedFields = Object.keys(updateDto);
      const restrictedFields = attemptedFields.filter(
        (field) => !allowedFields.includes(field),
      );

      if (restrictedFields.length > 0) {
        throw new ForbiddenException(
          `Customers cannot update the following fields: ${restrictedFields.join(', ')}`,
        );
      }

      // Customers cannot update confirmed or active bookings
      if (
        [BookingStatus.CONFIRMED, BookingStatus.ACTIVE].includes(booking.status)
      ) {
        throw new ForbiddenException(
          'Cannot update confirmed or active bookings',
        );
      }
    }
  }

  private validateDeletionPermissions(
    booking: any,
    userId: string,
    userRole: UserRole,
  ): void {
    if (userRole === UserRole.CUSTOMER) {
      if (booking.userId !== userId) {
        throw new ForbiddenException('You can only delete your own bookings');
      }

      if (booking.status !== BookingStatus.PENDING) {
        throw new ForbiddenException('Only pending bookings can be deleted');
      }
    }
  }

  private async findBookingById(id: string): Promise<any> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: this.getBookingIncludes(),
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  private getBookingIncludes() {
    return {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      vehicle: true,
      Location: true,
      bookingStatusHistory: {
        orderBy: { createdAt: Prisma.SortOrder.desc },
      },
      payment: true,
    };
  }

  private generateBookingNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `BOOK-${timestamp}-${random}`;
  }

  private async createStatusHistory(
    bookingId: string,
    status: BookingStatus,
    changedBy: string,
    reason: string,
  ): Promise<void> {
    await this.prisma.bookingStatusHistory.create({
      data: {
        bookingId,
        status,
        changedBy,
        reason,
      },
    });
  }
}
