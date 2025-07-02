import {Component, OnInit} from '@angular/core';
import {HeaderComponent} from '../header/header.component';
import {FooterComponent} from '../footer/footer.component';
import {Booking} from '../../shared/models/booking.model';
import {BookingService} from '../../services/booking.service';
import {Vehicle} from '../../shared/models/vehicle.model';
import {RouterLink} from '@angular/router';
import {NgClass, NgForOf, NgIf, TitleCasePipe} from '@angular/common';

@Component({
  selector: 'app-my-booking',
  standalone: true,
  imports: [
    HeaderComponent,
    FooterComponent,
    RouterLink,
    NgIf,
    NgForOf,
    NgClass,
    TitleCasePipe
  ],
  templateUrl: './my-booking.component.html',
  styleUrl: './my-booking.component.scss'
})
export class MyBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  loading = true;
  error: string | null = null;

  constructor(private bookingService: BookingService) {
  }

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.loading = true;
    this.error = null;

    this.bookingService.getAllBookings().subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Failed to load bookings';
        this.loading = false;
      }
    });
  }

  getCarDisplayName(vehicle: Vehicle | undefined): string {
    if (!vehicle) return 'Vehicle Details Unavailable';
    return `${vehicle.make} ${vehicle.model} `;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  }

  cancelBooking(bookingId: string) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.bookingService.cancelBooking(bookingId).subscribe({
        next: () => {
          this.loadBookings(); // Reload bookings to show updated status
        },
        error: (error) => {
          alert('Failed to cancel booking: ' + error.message);
        }
      });
    }
  }

  viewBookingDetails(bookingId: string) {
    // Navigate to booking details page or show modal
    console.log('View booking details:', bookingId);
    // You can implement navigation to a details page here
    // this.router.navigate(['/bookings', bookingId]);
  }
}
