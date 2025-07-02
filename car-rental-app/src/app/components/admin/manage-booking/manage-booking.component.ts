import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {Booking, BookingStatus} from '../../../shared/models/booking.model';
import {BookingService} from '../../../services/booking.service';
import {Vehicle} from '../../../shared/models/vehicle.model';

@Component({
  standalone: true,
  selector: 'app-manage-bookings',
  templateUrl: 'manage-booking.component.html',
  imports: [CommonModule, RouterModule, FormsModule],
})
export class ManageBookingsComponent implements OnInit {
  statuses = Object.values(BookingStatus);
  bookings: Booking[] = [];
  pendingBookings: Booking[] = [];

  loading = true;
  selectedTab = 'all'; // 'all' or 'pending'

  constructor(private bookingService: BookingService) {
  }

  ngOnInit() {
    this.loadBookings();
  }

  getTotalBookings(): number {
    return this.bookings.length;
  }

  getBookingCountByStatus(status: string): number {
    return this.bookings.filter(booking => booking.status === status).length;
  }

  loadBookings() {
    this.loading = true;

    // Load all bookings
    this.bookingService.getAllBookings().subscribe({
      next: (data) => {
        this.bookings = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch bookings:', err);
        this.loading = false;
      },
    });

    // Load pending bookings
    this.bookingService.getPendingBookings().subscribe({
      next: (data) => {
        this.pendingBookings = data;
      },
      error: (err) => {
        console.error('Failed to fetch pending bookings:', err);
      },
    });
  }

  getCarDisplayName(vehicle: Vehicle | undefined): string {
    if (!vehicle) return 'Vehicle Details Unavailable';
    return `${vehicle.make} ${vehicle.model}`;
  }

  getStatusLabel(status: string): string {
    const map: { [key: string]: string } = {
      PENDING: 'Pending',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      CONFIRMED: 'Confirmed',
      CANCELLED: 'Cancelled',
    };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  // Update booking status using the generic update method
  updateStatus(id: string, newStatus: string) {
    this.bookingService.updateBookingStatus(id, newStatus).subscribe({
      next: () => {
        const booking = this.bookings.find((b) => b.id === id);
        if (booking) {
          booking.status = newStatus as any;
        }
        // Refresh pending bookings if status changed
        if (newStatus !== 'PENDING') {
          this.pendingBookings = this.pendingBookings.filter(b => b.id !== id);
        }
      },
      error: (err) => {
        console.error('Failed to update status:', err);
        alert('Failed to update booking status');
      },
    });
  }

  // Approve booking using the specific approve method
  approveBooking(id: string) {
    this.bookingService.approveBooking(id).subscribe({
      next: (updatedBooking) => {
        const booking = this.bookings.find((b) => b.id === id);
        if (booking) {
          booking.status = updatedBooking.status;
        }
        // Remove from pending bookings
        this.pendingBookings = this.pendingBookings.filter(b => b.id !== id);
      },
      error: (err) => {
        console.error('Failed to approve booking:', err);
        alert('Failed to approve booking');
      },
    });
  }

  // Reject booking using the specific reject method
  rejectBooking(id: string) {
    this.bookingService.rejectBooking(id).subscribe({
      next: (updatedBooking) => {
        const booking = this.bookings.find((b) => b.id === id);
        if (booking) {
          booking.status = updatedBooking.status;
        }
        // Remove from pending bookings
        this.pendingBookings = this.pendingBookings.filter(b => b.id !== id);
      },
      error: (err) => {
        console.error('Failed to reject booking:', err);
        alert('Failed to reject booking');
      },
    });
  }

  // Cancel booking using the specific cancel method
  cancelBooking(id: string) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.bookingService.cancelBooking(id).subscribe({
        next: (updatedBooking) => {
          const booking = this.bookings.find((b) => b.id === id);
          if (booking) {
            booking.status = updatedBooking.status;
          }
          // Remove from pending bookings if it was there
          this.pendingBookings = this.pendingBookings.filter(b => b.id !== id);
        },
        error: (err) => {
          console.error('Failed to cancel booking:', err);
          alert('Failed to cancel booking');
        },
      });
    }
  }

  // Delete booking permanently
  deleteBooking(id: string) {
    if (confirm('Are you sure you want to permanently delete this booking? This action cannot be undone.')) {
      this.bookingService.deleteBooking(id).subscribe({
        next: () => {
          // Remove from both arrays
          this.bookings = this.bookings.filter(b => b.id !== id);
          this.pendingBookings = this.pendingBookings.filter(b => b.id !== id);
        },
        error: (err) => {
          console.error('Failed to delete booking:', err);
          alert('Failed to delete booking');
        },
      });
    }
  }

  // Get booking details by ID (for viewing full details)
  viewBookingDetails(id: string) {
    this.bookingService.getBookingById(id).subscribe({
      next: (booking) => {
        // You can implement a modal or navigate to a details page
        console.log('Booking details:', booking);
        alert(`Booking Details:\nID: ${booking.id}\nStatus: ${booking.status}\nTotal: ${booking.totalAmount}`);
      },
      error: (err) => {
        console.error('Failed to fetch booking details:', err);
        alert('Failed to fetch booking details');
      },
    });
  }

  // Switch between tabs
  switchTab(tab: string) {
    this.selectedTab = tab;
  }

  // Get current bookings based on selected tab
  getCurrentBookings(): Booking[] {
    return this.selectedTab === 'pending' ? this.pendingBookings : this.bookings;
  }

  // Check if booking can be cancelled
  canCancelBooking(booking: Booking): boolean {
    return booking.status !== 'CANCELLED' && booking.status !== 'REJECTED';
  }

  // Check if booking can be approved/rejected
  canApproveReject(booking: Booking): boolean {
    return booking.status === 'PENDING';
  }
}
