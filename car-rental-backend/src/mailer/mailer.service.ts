import { Injectable, Logger } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Decimal } from 'generated/prisma/runtime/library';

export interface BookingEmailData {
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  vehicleName: string;
  vehicleModel?: string;
  startDate: Date;
  endDate: Date;
  totalAmount: Decimal;
  locationName?: string;
  bookingId: string;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(
    private readonly mailerService: NestMailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Welcome to SafariRentals AGENCY!',
        template: 'welcome-user',
        context: {
          name,
          appName: 'SafariRentals AGENCY',
          loginUrl: this.configService.get<string>('FRONTEND_LOGIN_URL'),
        },
      });
      this.logger.log(`Welcome email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${to}`, error.stack);
      throw error;
    }
  }

  async sendVerificationEmail(
    to: string,
    name: string,
    resetToken: string,
    expiresIn: number,
  ): Promise<void> {
    try {
      const resetUrl = `${this.configService.get<string>('FRONTEND_RESET_URL')}?token=${resetToken}`;

      await this.mailerService.sendMail({
        to,
        subject: 'Reset Your SafariRentals Account Password',
        template: 'reset-password',
        context: {
          name,
          resetUrl,
          expiresIn,
        },
      });
      this.logger.log(`Verification email sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${to}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Send booking confirmation email to customer
   */
  async sendBookingConfirmationEmail(
    bookingData: BookingEmailData,
  ): Promise<void> {
    try {
      const bookingUrl = `${this.configService.get<string>('FRONTEND_URL')}/bookings/${bookingData.bookingId}`;

      await this.mailerService.sendMail({
        to: bookingData.customerEmail,
        subject: `Booking Confirmation - ${bookingData.bookingNumber}`,
        template: 'booking-confirmation',
        context: {
          customerName: bookingData.customerName,
          bookingNumber: bookingData.bookingNumber,
          vehicleName: bookingData.vehicleName,
          vehicleModel: bookingData.vehicleModel,
          startDate: this.formatDate(bookingData.startDate),
          endDate: this.formatDate(bookingData.endDate),
          totalAmount: this.formatCurrency(bookingData.totalAmount),
          locationName: bookingData.locationName,
          bookingUrl,
          supportEmail: this.configService.get<string>('SUPPORT_EMAIL'),
        },
      });

      this.logger.log(
        `Booking confirmation email sent to ${bookingData.customerEmail} for booking ${bookingData.bookingNumber}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send booking confirmation email for booking ${bookingData.bookingNumber}`,
        error.stack,
      );
      // Don't throw error to prevent blocking the booking process
    }
  }

  /**
   * Send booking approval email to customer
   */
  async sendBookingApprovedEmail(bookingData: BookingEmailData): Promise<void> {
    try {
      const bookingUrl = `${this.configService.get<string>('FRONTEND_URL')}/bookings/${bookingData.bookingId}`;

      await this.mailerService.sendMail({
        to: bookingData.customerEmail,
        subject: `Booking Approved - ${bookingData.bookingNumber}`,
        template: 'booking-approved',
        context: {
          customerName: bookingData.customerName,
          bookingNumber: bookingData.bookingNumber,
          vehicleName: bookingData.vehicleName,
          vehicleModel: bookingData.vehicleModel,
          startDate: this.formatDate(bookingData.startDate),
          endDate: this.formatDate(bookingData.endDate),
          totalAmount: this.formatCurrency(bookingData.totalAmount),
          locationName: bookingData.locationName,
          bookingUrl,
          supportEmail: this.configService.get<string>('SUPPORT_EMAIL'),
          paymentUrl: `${this.configService.get<string>('FRONTEND_URL')}/payment/${bookingData.bookingId}`,
        },
      });

      this.logger.log(
        `Booking approval email sent to ${bookingData.customerEmail} for booking ${bookingData.bookingNumber}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send booking approval email for booking ${bookingData.bookingNumber}`,
        error.stack,
      );
    }
  }

  /**
   * Send booking rejection email to customer
   */
  async sendBookingRejectedEmail(
    bookingData: BookingEmailData,
    rejectionReason?: string,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: bookingData.customerEmail,
        subject: `Booking Rejected - ${bookingData.bookingNumber}`,
        template: 'booking-rejected',
        context: {
          customerName: bookingData.customerName,
          bookingNumber: bookingData.bookingNumber,
          vehicleName: bookingData.vehicleName,
          vehicleModel: bookingData.vehicleModel,
          startDate: this.formatDate(bookingData.startDate),
          endDate: this.formatDate(bookingData.endDate),
          rejectionReason: rejectionReason || 'Could not approve your booking',
          supportEmail: this.configService.get<string>('SUPPORT_EMAIL'),
          searchUrl: `${this.configService.get<string>('FRONTEND_URL')}/vehicles`,
        },
      });

      this.logger.log(
        `Booking rejection email sent to ${bookingData.customerEmail} for booking ${bookingData.bookingNumber}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send booking rejection email for booking ${bookingData.bookingNumber}`,
        error.stack,
      );
    }
  }

  /**
   * Send booking cancellation email to customer
   */
  async sendBookingCancelledEmail(
    bookingData: BookingEmailData,
    cancellationReason?: string,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: bookingData.customerEmail,
        subject: `Booking Cancelled - ${bookingData.bookingNumber}`,
        template: 'booking-cancelled',
        context: {
          customerName: bookingData.customerName,
          bookingNumber: bookingData.bookingNumber,
          vehicleName: bookingData.vehicleName,
          vehicleModel: bookingData.vehicleModel,
          startDate: this.formatDate(bookingData.startDate),
          endDate: this.formatDate(bookingData.endDate),
          cancellationReason: cancellationReason || 'Cancelled by user',
          supportEmail: this.configService.get<string>('SUPPORT_EMAIL'),
          refundInfo: 'Refund processing may take 3-5 business days',
        },
      });

      this.logger.log(
        `Booking cancellation email sent to ${bookingData.customerEmail} for booking ${bookingData.bookingNumber}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send booking cancellation email for booking ${bookingData.bookingNumber}`,
        error.stack,
      );
    }
  }

  /**
   * Send new booking notification to admin/agent
   */
  async sendNewBookingNotificationToAdmin(
    bookingData: BookingEmailData,
  ): Promise<void> {
    try {
      const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
      const adminPanelUrl = `${this.configService.get<string>('ADMIN_PANEL_URL')}/bookings/${bookingData.bookingId}`;

      if (!adminEmail) {
        this.logger.warn(
          'Admin email not configured, skipping admin notification',
        );
        return;
      }

      await this.mailerService.sendMail({
        to: adminEmail,
        subject: `New Booking Received - ${bookingData.bookingNumber}`,
        template: 'new-booking-admin',
        context: {
          bookingNumber: bookingData.bookingNumber,
          customerName: bookingData.customerName,
          customerEmail: bookingData.customerEmail,
          vehicleName: bookingData.vehicleName,
          vehicleModel: bookingData.vehicleModel,
          startDate: this.formatDate(bookingData.startDate),
          endDate: this.formatDate(bookingData.endDate),
          totalAmount: this.formatCurrency(bookingData.totalAmount),
          locationName: bookingData.locationName,
          adminPanelUrl,
        },
      });

      this.logger.log(
        `Admin notification sent for new booking ${bookingData.bookingNumber}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send admin notification for booking ${bookingData.bookingNumber}`,
        error.stack,
      );
    }
  }

  /**
   * Helper method to format dates for email templates
   */
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  /**
   * Helper method to format currency for email templates
   */
  private formatCurrency(amount: Decimal.Value): string {
    const decimalAmount = new Decimal(amount);
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(decimalAmount.toNumber());
  }
}
