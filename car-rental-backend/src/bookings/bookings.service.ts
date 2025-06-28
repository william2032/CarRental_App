import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingEmailData, MailerService } from '../mailer/mailer.service';
import { CreateBookingDto } from './dtos/create-booking.dto';
import { $Enums, Prisma } from '../../generated/prisma';
import UserRole = $Enums.UserRole;
import BookingStatus = $Enums.BookingStatus;
import { UpdateBookingDto } from './dtos/update-bookings.dto';
import { BookingWithRelations } from './interfaces';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  async create(
    createBookingDto: CreateBookingDto,
    userId: string,
    userRole: UserRole,
  ): Promise<BookingWithRelations> {
    this.validateCustomerPermissions(userRole, userId, userId);

    await this.validateEntitiesExist(createBookingDto);

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

    // Send confirmation email to customer
    await this.sendBookingConfirmationEmail(booking);

    // Send notification email to admin
    await this.sendNewBookingNotificationToAdmin(booking);

    return booking as BookingWithRelations;
  }

  async findAll(
    userId: string,
    userRole: UserRole,
  ): Promise<BookingWithRelations[]> {
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
  ): Promise<BookingWithRelations> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: this.getBookingIncludes(),
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    // Validate access permissions
    this.validateBookingAccess(booking, userId, userRole);

    return booking as BookingWithRelations;
  }

  async findPendingBookings(
    userId: string,
    userRole: UserRole,
  ): Promise<BookingWithRelations[]> {
    const whereClause = {
      ...this.buildWhereClause(userRole, userId),
      status: BookingStatus.PENDING,
    };

    return this.prisma.booking.findMany({
      where: whereClause,
      include: this.getBookingIncludes(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(
    id: string,
    updateBookingDto: UpdateBookingDto,
    userId: string,
    userRole: UserRole,
  ): Promise<BookingWithRelations> {
    const existingBooking = await this.findBookingById(id);
    const previousStatus = existingBooking.status;

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
        new Date(updateBookingDto.startDate ?? existingBooking.startDate),
        new Date(updateBookingDto.endDate ?? existingBooking.endDate),
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

      // Send appropriate email based on status change
      await this.handleStatusChangeEmail(
        updatedBooking,
        previousStatus,
        updateBookingDto.status,
      );
    }

    return updatedBooking as BookingWithRelations;
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
  ): Promise<BookingWithRelations> {
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

    // Send cancellation email
    await this.sendBookingCancellationEmail(updatedBooking, reason);

    return updatedBooking as BookingWithRelations;
  }

  /**
   * Approve a booking (admin/agent only)
   */
  async approveBooking(
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<BookingWithRelations> {
    if (userRole === UserRole.CUSTOMER) {
      throw new ForbiddenException('Only admin/agents can approve bookings');
    }

    const booking = await this.findBookingById(id);

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be approved');
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CONFIRMED },
      include: this.getBookingIncludes(),
    });

    // Record approval in status history
    await this.createStatusHistory(
      id,
      BookingStatus.CONFIRMED,
      userId,
      'Booking approved by admin/agent',
    );

    // Send approval email
    await this.sendBookingApprovalEmail(updatedBooking);

    return updatedBooking as BookingWithRelations;
  }

  /**
   * Reject a booking (admin/agent only)
   */
  async rejectBooking(
    id: string,
    userId: string,
    userRole: UserRole,
    reason?: string,
  ): Promise<BookingWithRelations> {
    if (userRole === UserRole.CUSTOMER) {
      throw new ForbiddenException('Only admin/agents can reject bookings');
    }

    const booking = await this.findBookingById(id);

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be rejected');
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED }, // or you could have a REJECTED status
      include: this.getBookingIncludes(),
    });

    // Record rejection in status history
    await this.createStatusHistory(
      id,
      BookingStatus.CANCELLED,
      userId,
      reason || 'Booking rejected by admin/agent',
    );

    // Send rejection email
    await this.sendBookingRejectionEmail(updatedBooking, reason);

    return updatedBooking as BookingWithRelations;
  }

  // Email sending methods
  private async sendBookingConfirmationEmail(
    booking: BookingWithRelations,
  ): Promise<void> {
    try {
      const emailData = this.mapBookingToEmailData(booking);
      await this.mailerService.sendBookingConfirmationEmail(emailData);
    } catch (error) {
      this.logger.error(
        `Failed to send booking confirmation email for booking ${booking.bookingNumber}`,
        error.stack,
      );
    }
  }

  private async sendNewBookingNotificationToAdmin(
    booking: BookingWithRelations,
  ): Promise<void> {
    try {
      const emailData = this.mapBookingToEmailData(booking);
      await this.mailerService.sendNewBookingNotificationToAdmin(emailData);
    } catch (error) {
      this.logger.error(
        `Failed to send admin notification for booking ${booking.bookingNumber}`,
        error.stack,
      );
    }
  }

  private async sendBookingApprovalEmail(
    booking: BookingWithRelations,
  ): Promise<void> {
    try {
      const emailData = this.mapBookingToEmailData(booking);
      await this.mailerService.sendBookingApprovedEmail(emailData);
    } catch (error) {
      this.logger.error(
        `Failed to send booking approval email for booking ${booking.bookingNumber}`,
        error.stack,
      );
    }
  }

  private async sendBookingRejectionEmail(
    booking: BookingWithRelations,
    reason?: string,
  ): Promise<void> {
    try {
      const emailData = this.mapBookingToEmailData(booking);
      await this.mailerService.sendBookingRejectedEmail(emailData, reason);
    } catch (error) {
      this.logger.error(
        `Failed to send booking rejection email for booking ${booking.bookingNumber}`,
        error.stack,
      );
    }
  }

  private async sendBookingCancellationEmail(
    booking: BookingWithRelations,
    reason?: string,
  ): Promise<void> {
    try {
      const emailData = this.mapBookingToEmailData(booking);
      await this.mailerService.sendBookingCancelledEmail(emailData, reason);
    } catch (error) {
      this.logger.error(
        `Failed to send booking cancellation email for booking ${booking.bookingNumber}`,
        error.stack,
      );
    }
  }

  private async handleStatusChangeEmail(
    booking: BookingWithRelations,
    previousStatus: BookingStatus,
    newStatus: BookingStatus,
  ): Promise<void> {
    // Only send emails for specific status changes
    if (
      newStatus === BookingStatus.CONFIRMED &&
      previousStatus === BookingStatus.PENDING
    ) {
      await this.sendBookingApprovalEmail(booking);
    } else if (
      newStatus === BookingStatus.CANCELLED &&
      previousStatus === BookingStatus.PENDING
    ) {
      await this.sendBookingRejectionEmail(
        booking,
        'Booking status changed to cancelled',
      );
    } else if (newStatus === BookingStatus.CANCELLED) {
      await this.sendBookingCancellationEmail(
        booking,
        'Booking status changed to cancelled',
      );
    }
  }

  private mapBookingToEmailData(
    booking: BookingWithRelations,
  ): BookingEmailData {
    return {
      bookingNumber: booking.bookingNumber,
      customerName: booking.user.name,
      customerEmail: booking.user.email,
      vehicleName: booking.vehicle.make,
      vehicleModel: booking.vehicle.model,
      startDate: booking.startDate,
      endDate: booking.endDate,
      totalAmount: booking.totalAmount,
      locationName: booking.Location?.name,
      bookingId: booking.id,
    };
  }

  // Helper methods
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
    booking: BookingWithRelations,
    userId: string,
    userRole: UserRole,
  ): void {
    if (userRole === UserRole.CUSTOMER && booking.userId !== userId) {
      throw new ForbiddenException('You can only access your own bookings');
    }
  }

  private validateUpdatePermissions(
    booking: BookingWithRelations,
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
        [
          BookingStatus.CONFIRMED,
          BookingStatus.ACTIVE,
          BookingStatus.PENDING,
          BookingStatus.CANCELLED,
          BookingStatus.REJECTED,
        ].includes(booking.status)
      ) {
        throw new ForbiddenException(
          'Cannot update confirmed or active bookings',
        );
      }
    }
  }

  private validateDeletionPermissions(
    booking: BookingWithRelations,
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

  private async findBookingById(id: string): Promise<BookingWithRelations> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: this.getBookingIncludes(),
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking as BookingWithRelations;
  }

  private getBookingIncludes() {
    return {
      user: {
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          email: true,
          password: true,
          role: true,
          name: true,
          phone: true,
          profilePicture: true,
          address: true,
          city: true,
          country: true,
        },
      },
      vehicle: {
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          locationId: true,
          make: true,
          model: true,
          year: true,
          fuelType: true,
          category: true,
          transmission: true,
          pricePerDay: true,
          pricePerHour: true,
          mileage: true,
          features: true,
          images: true,
          isAvailable: true,
          condition: true,
        },
      },
      Location: true,
      bookingStatusHistory: true,
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
