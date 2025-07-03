import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, NgForm} from '@angular/forms';
import {Router} from '@angular/router';
import {HttpBackend, HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {CategoryService} from '../../../services/category.service';

@Component({
  selector: 'app-vehicles-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicle.component.html',
})
export class VehiclesPage implements OnInit {
  categories: any[] = [];
  locations: any[] = [];

  // Form fields matching backend DTO
  make = '';
  model = '';
  year!: number;
  pricePerDay!: number;
  pricePerHour?: number;
  category = '';
  fuelType = '';
  transmission = '';
  seats!: number;
  locationId = '';
  mileage?: number;
  condition = 'EXCELLENT';
  features: string[] = [];
  images: string[] = [];

  // Options for dropdowns
  fuelTypes = ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID'];
  transmissions = ['AUTOMATIC', 'MANUAL', 'CVT'];
  conditions = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'];
  availableFeatures = ['GPS', 'Bluetooth', 'Air Conditioning', 'Sunroof', 'Leather Seats', 'Backup Camera'];

  uploading = false;
  uploadError = '';
  cloudName = 'dbiutl8lv';
  uploadPreset = 'car_rental_Uploads';
  formError: string | null = null;

  private rawHttp: HttpClient;

  constructor(
    private categoryService: CategoryService,
    private http: HttpClient,
    private router: Router,
    private handler: HttpBackend
  ) {
    this.rawHttp = new HttpClient(handler);
  }

  ngOnInit() {
    // Load categories
    this.categoryService.getCategories().subscribe({
      next: (data: any) => {
        this.categories = data;
      },
      error: () => {
        this.formError = 'Failed to load categories.';
      },
    });

    // Load locations - assuming you have a similar service
    this.http.get(`${environment.apiUrl}/locations`).subscribe({
      next: (data: any) => {
        this.locations = data;
      },
      error: () => {
        console.log('Failed to load locations');
      },
    });
  }

  onImageSelected(event: any) {
    const files: FileList = event.target.files;
    if (!files.length) return;

    this.uploading = true;
    this.uploadError = '';
    this.images = [];

    Array.from(files).forEach((file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);

      this.rawHttp
        .post(`https://api.cloudinary.com/v1_1/${this.cloudName}/upload`, formData)
        .subscribe({
          next: (res: any) => {
            this.images.push(res.secure_url);
            if (this.images.length === files.length) {
              this.uploading = false;
            }
          },
          error: () => {
            this.uploading = false;
            this.uploadError = 'Image upload failed.';
          },
        });
    });
  }

  onFeatureChange(feature: string, event: any) {
    if (event.target.checked) {
      this.features.push(feature);
    } else {
      this.features = this.features.filter(f => f !== feature);
    }
  }

  calculateHourlyRate() {
    if (this.pricePerDay) {
      this.pricePerHour = Math.round((this.pricePerDay / 8) * 100) / 100; // 8 hours per day
    }
  }

  submitVehicle(form: NgForm) {
    // Validation
    if (!this.category || this.category === '') {
      this.formError = 'Please select a category.';
      return;
    }

    if (!this.make || !this.model || !this.year || !this.pricePerDay || !this.category ||
      !this.seats || !this.locationId || !this.fuelType || !this.transmission) {
      this.formError = 'Please fill in all required fields.';
      return;
    }

    // Calculate hourly rate if not set
    if (!this.pricePerHour) {
      this.calculateHourlyRate();
    }

    // Prepare payload matching backend DTO
    const payload = {
      make: this.make,
      model: this.model,
      year: this.year,
      fuelType: this.fuelType,
      category: this.category,
      transmission: this.transmission,
      pricePerDay: this.pricePerDay,
      pricePerHour: this.pricePerHour,
      seats: this.seats,
      features: this.features,
      images: this.images,
      condition: this.condition,
      locationId: this.locationId,
      mileage: this.mileage,
      isAvailable: true
    };

    this.http.post(`${environment.apiUrl}/vehicles`, payload).subscribe({
      next: () => {
        alert('Vehicle listed successfully!');
        form.resetForm({condition: 'EXCELLENT'});
        this.features = [];
        this.images = [];
        this.formError = '';
        this.router.navigate(['/admin/manage-cars']);
      },
      error: (err) => {
        this.formError = err.error.message || 'Failed to list vehicle.';
      },
    });
  }
}
