import {Component} from '@angular/core';
import {Vehicle} from '../../shared/models/vehicle.model';
import {VehicleService} from '../../services/vehicle.service';
import {ActivatedRoute, Router} from '@angular/router';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {HeaderComponent} from '../header/header.component';
import {FooterComponent} from '../footer/footer.component';
import {CreateBookingDto} from '../../shared/models/booking.model';
import {BookingService} from '../../services/booking.service';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-vehicle-details',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    NgForOf,
    HeaderComponent,
    FooterComponent,
    FormsModule
  ],
  templateUrl: './vehicle-details.component.html',
  styleUrl: './vehicle-details.component.scss'
})
export class VehicleDetailsComponent {
  vehicle: Vehicle | null = null;
  vehicleId: string = '';
  isBooking = false;
  errorMessage = '';
  successMessage = '';

  bookingForm = {
    startDate: '',
    endDate: '',
    pickupLocation: 'Chuka Town',
    returnLocation: 'Ndangani Office'
  };

  constructor(
    private vehicleService: VehicleService,
    private router: Router,
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.vehicleId = params['id'];
      this.loadVehicleDetails();
    });

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.bookingForm.startDate = today.toISOString().split('T')[0];
    this.bookingForm.endDate = tomorrow.toISOString().split('T')[0];
  }

  calculateDays(): number {
    if (!this.bookingForm.startDate || !this.bookingForm.endDate) {
      return 1;
    }

    const start = new Date(this.bookingForm.startDate);
    const end = new Date(this.bookingForm.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays || 1;
  }

  loadVehicleDetails(): void {
    this.vehicleService.getVehicleById(this.vehicleId).subscribe(vehicle => {
      this.vehicle = vehicle;
    });
  }

  calculateTotalPrice(): number {
    if (!this.vehicle) return 0;
    return this.calculateDays() * this.vehicle.pricePerDay;
  }

  isFormValid(): boolean {
    return !!(
      this.bookingForm.startDate &&
      this.bookingForm.endDate &&
      this.bookingForm.pickupLocation &&
      this.bookingForm.returnLocation &&
      new Date(this.bookingForm.endDate) > new Date(this.bookingForm.startDate)
    );
  }

  bookCar() {
    if (!this.isFormValid()) {
      this.errorMessage = 'Please fill in all required fields and ensure end date is after start date.';
      return;
    }

    if (!this.vehicle) {
      this.errorMessage = 'Vehicle information not available.';
      return;
    }
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.errorMessage = 'Sign In or Create an Account';
      return;
    }
    this.isBooking = true;
    this.errorMessage = '';
    this.successMessage = '';

    const totalPrice = this.calculateTotalPrice();

    const bookingData: CreateBookingDto = {
      userId: user.id,
      vehicleId: this.vehicle.id,
      startDate: new Date(this.bookingForm.startDate).toISOString(),
      endDate: new Date(this.bookingForm.endDate).toISOString(),
      pickupLocation: this.bookingForm.pickupLocation,
      returnLocation: this.bookingForm.returnLocation,
      baseAmount: totalPrice,
      discountAmount: 0,
      totalAmount: totalPrice,
      status: 'PENDING'
    };

    this.bookingService.createBooking(bookingData).subscribe({
      next: (booking) => {
        this.isBooking = false;
        this.successMessage = 'Booking created successfully! You will be redirected to your bookings page.';
        setTimeout(() => {
          this.router.navigate(['/bookings']);
        }, 1500);
      },
      error: (error) => {
        this.isBooking = false;
        const serverMessage = error?.error?.message || error.message || 'Unknown error';

        if (serverMessage === 'User not authenticated') {
          this.errorMessage = 'Please log in to make a booking. You will be redirected to the login page.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        } else if (serverMessage === 'Vehicle is not available for booking') {
          this.errorMessage = 'Sorry already booked!';
        }
        else {
          this.errorMessage = error.message || 'Failed to create booking. Please try again.';
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
