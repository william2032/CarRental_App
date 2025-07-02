import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AdminDashboardComponent } from '../../components/admin-dashboard/admin-dashboard.component';
import { NgForOf, NgIf } from '@angular/common';
import {VehicleService} from '../../services/vehicle.service';

// Enums matching backend Prisma schema
enum VehicleType {
  SEDAN = 'SEDAN',
  SUV = 'SUV',
  SPORT = 'SPORT',
  CONVERTIBLE = 'CONVERTIBLE',
  LUXURY = 'LUXURY'
}

enum FuelType {
  PETROL = 'PETROL',
  DIESEL = 'DIESEL',
  HYBRID = 'HYBRID',
  ELECTRIC = 'ELECTRIC',
}

enum TransmissionType {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC',
  CVT = 'CVT',
}

enum VehicleCondition {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  POOR = 'POOR',
  FAIR = 'FAIR'
}

interface Category {
  id: string;
  name: string;
}

interface Location {
  id: string;
  name: string;
  city: string;
}

interface VehicleFormData {
  brand: string;
  model: string;
  year: number;
  dailyRate: number;
  category: string;
  transmission: string;
  fuelType: string;
  seatingCapacity: number;
  mileage?: number;
  locationId: string;
  condition: string;
  isAvailable: boolean;
  pricePerHour?: number;
  features: string[];
}

export interface CreateVehicle {
  make: string;
  model: string;
  year: number;
  fuelType: FuelType;
  seats: number;
  category: VehicleType;
  transmission: TransmissionType;
  pricePerDay: number;
  pricePerHour?: number;
  mileage?: number;
  features: string[];
  isAvailable: boolean;
  condition: VehicleCondition;
  locationId: string;
}

@Component({
  selector: 'app-vehicle',
  templateUrl: './vehicles-admin.component.html',
  imports: [
    ReactiveFormsModule,
    AdminDashboardComponent,
    NgIf,
    NgForOf
  ],
  styleUrls: ['./vehicles-admin.component.scss']
})
export class VehiclesAdminComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  vehicleForm!: FormGroup;
  uploading = false;
  uploadError = '';
  selectedFiles: File[] = [];
  previewUrls: string[] = []; // Store temporary preview URLs
  formSubmitted = false;
  generalError = '';
  formErrors: { [key: string]: string } = {};

  categories: Category[] = [
    { id: VehicleType.SEDAN, name: 'Sedan' },
    { id: VehicleType.SUV, name: 'SUV' },
    { id: VehicleType.SPORT, name: 'Sport' },
    { id: VehicleType.CONVERTIBLE, name: 'Convertible' },
    { id: VehicleType.LUXURY, name: 'Luxury' }
  ];

  locations: Location[] = [
    { id: 'nairobi-cbd', name: 'CBD', city: 'Nairobi' },
    { id: 'nairobi-westlands', name: 'Westlands', city: 'Nairobi' },
    { id: 'nairobi-karen', name: 'Karen', city: 'Nairobi' },
    { id: 'nairobi-airport', name: 'JKIA Airport', city: 'Nairobi' },
    { id: 'eldoret-cbd', name: 'CBD', city: 'Eldoret' }
  ];

  transmissionTypes: string[] = [
    TransmissionType.MANUAL,
    TransmissionType.AUTOMATIC,
    TransmissionType.CVT,
  ];

  fuelTypes: string[] = [
    FuelType.PETROL,
    FuelType.DIESEL,
    FuelType.HYBRID,
    FuelType.ELECTRIC,
  ];

  conditionTypes: string[] = [
    VehicleCondition.EXCELLENT,
    VehicleCondition.GOOD,
    VehicleCondition.FAIR
  ];

  availableFeatures: string[] = [
    'Air Conditioning',
    'Bluetooth',
    'GPS Navigation',
    'Leather Seats',
    'Sunroof',
    'Parking Sensors',
    'Backup Camera',
    'Heated Seats',
    'Cruise Control',
    'USB Ports',
    'Wifi Hotspot',
    'Premium Sound',
    'Keyless Entry',
    'Push Start',
    'Tinted Windows',
    'Alloy Wheels',
    'Fog Lights',
    'Power Windows',
    'Central Locking',
    'ABS Brakes'
  ];

  constructor(private fb: FormBuilder, private vehicleService:VehicleService, private http: HttpClient) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormValidation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Clean up preview URLs to prevent memory leaks
    this.previewUrls.forEach(url => URL.revokeObjectURL(url));
  }

  private initializeForm(): void {
    this.vehicleForm = this.fb.group({
      brand: ['', [Validators.required, Validators.minLength(2)]],
      model: ['', [Validators.required, Validators.minLength(1)]],
      year: ['', [Validators.required, Validators.min(1990), Validators.max(2026)]],
      dailyRate: ['', [Validators.required, Validators.min(1)]],
      category: ['', Validators.required],
      transmission: ['', Validators.required],
      fuelType: ['', Validators.required],
      seatingCapacity: ['', [Validators.required, Validators.min(2), Validators.max(15)]],
      mileage: ['', [Validators.min(0)]],
      locationId: ['', Validators.required],
      condition: ['', Validators.required],
      isAvailable: [true, Validators.required],
      pricePerHour: ['', [Validators.min(0), Validators.pattern(/^\d+(\.\d{1,2})?$|^$/)]],
      features: this.fb.array([])
    });
  }

  private setupFormValidation(): void {
    this.vehicleForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.validateForm();
      });
  }

  private validateForm(): void {
    this.formErrors = {};

    Object.keys(this.vehicleForm.controls).forEach(key => {
      const control = this.vehicleForm.get(key);
      if (control && !control.valid && (control.dirty || control.touched || this.formSubmitted)) {
        this.formErrors[key] = this.getErrorMessage(key, control.errors);
      }
    });

    if (this.selectedFiles.length === 0 && this.formSubmitted) {
      this.formErrors['files'] = 'At least one image is required';
    }
  }

  private getErrorMessage(fieldName: string, errors: any): string {
    if (!errors) return '';

    if (errors['required']) {
      return `${this.getFieldDisplayName(fieldName)} is required`;
    }
    if (errors['minlength']) {
      return `${this.getFieldDisplayName(fieldName)} must be at least ${errors['minlength'].requiredLength} characters`;
    }
    if (errors['min']) {
      return `${this.getFieldDisplayName(fieldName)} must be at least ${errors['min'].min}`;
    }
    if (errors['max']) {
      return `${this.getFieldDisplayName(fieldName)} cannot exceed ${errors['max'].max}`;
    }
    if (errors['pattern']) {
      return `${this.getFieldDisplayName(fieldName)} must be a number with up to 2 decimal places or empty`;
    }

    return `${this.getFieldDisplayName(fieldName)} is invalid`;
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      brand: 'Brand',
      model: 'Model',
      year: 'Year',
      dailyRate: 'Daily Rate',
      category: 'Category',
      transmission: 'Transmission',
      fuelType: 'Fuel Type',
      seatingCapacity: 'Seating Capacity',
      mileage: 'Mileage',
      locationId: 'Location',
      condition: 'Condition',
      isAvailable: 'Availability',
      pricePerHour: 'Price Per Hour',
      files: 'Images'
    };
    return displayNames[fieldName] || fieldName;
  }

  get isFormValid(): boolean {
    return this.vehicleForm.valid && this.selectedFiles.length > 0;
  }

  get canSubmit(): boolean {
    return this.isFormValid && !this.uploading;
  }

  async onImageSelected(event: any): Promise<void> {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    const maxFiles = 10;
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (this.selectedFiles.length + files.length > maxFiles) {
      this.uploadError = `Maximum ${maxFiles} images allowed. You can upload ${maxFiles - this.selectedFiles.length} more.`;
      return;
    }

    const validFiles: File[] = [];
    this.uploadError = '';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!allowedTypes.includes(file.type)) {
        this.uploadError = `Invalid file type: ${file.name}. Only JPEG, PNG, and WebP are allowed.`;
        return;
      }

      if (file.size > maxSize) {
        this.uploadError = `File too large: ${file.name}. Maximum size is 5MB.`;
        return;
      }

      validFiles.push(file);
    }

    // Generate preview URLs using FileReader
    const previewPromises = validFiles.map(file => {
      return new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    // Wait for all previews to resolve
    const newPreviewUrls = await Promise.all(previewPromises);

    // Update selectedFiles and previewUrls
    this.selectedFiles = [...this.selectedFiles, ...validFiles];
    this.previewUrls = [...this.previewUrls, ...newPreviewUrls];
    this.validateForm();
    event.target.value = '';
  }

  removeImage(index: number): void {
    if (index >= 0 && index < this.selectedFiles.length) {
      // Revoke the object URL to prevent memory leaks
      URL.revokeObjectURL(this.previewUrls[index]);
      this.selectedFiles.splice(index, 1);
      this.previewUrls.splice(index, 1);
      this.validateForm();
    }
  }

  trackByFile(index: number, file: File): string {
    return file.name;
  }

  get featuresFormArray(): FormArray {
    return this.vehicleForm.get('features') as FormArray;
  }

  isFeatureSelected(feature: string): boolean {
    const features = this.vehicleForm.get('features')?.value || [];
    return features.includes(feature);
  }

  toggleFeature(feature: string): void {
    const featuresArray = this.featuresFormArray;
    const index = featuresArray.value.indexOf(feature);

    if (index > -1) {
      featuresArray.removeAt(index);
    } else {
      featuresArray.push(new FormControl(feature));
    }
  }

  trackByFeature(index: number, feature: string): string {
    return feature;
  }

  trackByIndex(index: number, item: any): any {
    return item.id || item || index;
  }

  trackByUrl(index: number, url: string): string {
    return url;
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.generalError = '';

    this.validateForm();

    if (!this.canSubmit) {
      this.generalError = 'Please fix all errors before submitting';
      return;
    }

    this.uploading = true;

    const formData: VehicleFormData = this.vehicleForm.value;

    const payload: CreateVehicle = {
      make: formData.brand,
      model: formData.model,
      year: formData.year,
      fuelType: formData.fuelType as FuelType,
      seats: formData.seatingCapacity,
      category: formData.category as VehicleType,
      transmission: formData.transmission as TransmissionType,
      pricePerDay: parseFloat(formData.dailyRate.toFixed(2)),
      pricePerHour: formData.pricePerHour ? parseFloat(formData.pricePerHour.toFixed(2)) : undefined,
      mileage: formData.mileage,
      features: formData.features,
      isAvailable: formData.isAvailable,
      condition: formData.condition as VehicleCondition,
      locationId: formData.locationId
    };

    const formDataToSend = new FormData();
    formDataToSend.append('createVehicleDto', JSON.stringify(payload));

    this.selectedFiles.forEach((file) => {
      formDataToSend.append('files[]', file);
    });

    this.vehicleService.addVehicle(formDataToSend)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.uploading = false;
          this.generalError = '';
          alert('Vehicle added successfully!');
          console.log('Vehicle created:', response);
          this.resetForm();
        },
        error: (error) => {
          this.uploading = false;
          this.generalError = error.error?.message?.join(', ') || 'Failed to add vehicle. Please try again.';
          console.error('Error submitting vehicle:', error);
        }
      });
  }

  resetForm(): void {
    this.vehicleForm.reset();
    this.selectedFiles.forEach((_, index) => URL.revokeObjectURL(this.previewUrls[index]));
    this.selectedFiles = [];
    this.previewUrls = [];
    this.formErrors = {};
    this.formSubmitted = false;
    this.generalError = '';
    this.uploadError = '';
    this.initializeForm();
  }
}
