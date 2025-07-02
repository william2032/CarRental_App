// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import {Booking, BookingStatus} from '../../../shared/models/booking.model';
// import {BookingService} from '../../../services/booking.service';
//
// @Component({
//   standalone: true,
//   selector: 'app-manage-bookings',
//   templateUrl: './manage-booking.component.html',
//   imports: [CommonModule, RouterModule, FormsModule],
// })
// export class ManageBookingsComponent implements OnInit {
//   statuses = Object.values(BookingStatus);
//   bookings: Booking[] = [];
//   loading = true;
//
//   constructor(private bookingService: BookingService) {}
//
//   ngOnInit() {
//     this.bookingService.getAllBookings().subscribe({
//       next: (data) => {
//         this.bookings = data;
//         this.loading = false;
//       },
//       error: (err) => {
//         console.error('Failed to fetch bookings:', err);
//         this.loading = false;
//       },
//     });
//   }
//
//   getStatusLabel(status: string): string {
//     const map: { [key: string]: string } = {
//       PENDING: 'Pending',
//       APPROVED: 'Approved',
//       REJECTED: 'Rejected',
//       CONFIRMED: 'Confirmed',
//       CANCELLED: 'Cancelled',
//     };
//     return map[status] || status;
//   }
//
//   updateStatus(id: string, newStatus: string) {
//     this.bookingService.updateBooking(id, newStatus).subscribe({
//       next: () => {
//         const booking = this.bookings.find((b) => b.id === id);
//         if (booking) booking.status = newStatus as any;
//       },
//       error: (err) => console.error('Failed to update status:', err),
//     });
//   }
//
//   cancelBooking(id: string) {
//     this.bookingService.cancelBooking(id).subscribe({
//       next: () => {
//         const booking = this.bookings.find((b) => b.id === id);
//         if (booking) booking.status = 'CANCELLED';
//       },
//       error: (err) => console.error('Failed to cancel booking:', err),
//     });
//   }
// }
