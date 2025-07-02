import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {HttpBackend, HttpClient} from '@angular/common/http';
import {CategoryService} from '../../../services/category.service';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-vehicles-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicles.page.html',
})
export class VehiclesPage implements OnInit {
  categories: any[] = [];
  brand = '';
  model = '';
  year!: number;
  dailyRate!: number;
  category: string | null = null;
  fuelType = '';
  transmission = '';
  seatingCapacity!: number;
  location = '';
  description = '';
  imageUrls: string[] = [];

  fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
  transmissions = ['Automatic', 'Manual'];

  uploading = false;
  uploadError = '';
  cloudName = 'dbiutl8lv';
  uploadPreset = 'car_rental_Uploads';

  formError: string | null = null;
  private rawHttp: HttpClient;

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private handler: HttpBackend,
    private http: HttpClient //
  ) {
    this.rawHttp = new HttpClient(this.handler);
  }


  onImageSelected(event: any) {
    const files: FileList = event.target.files;
    if (!files.length) return;

    this.uploading = true;
    this.uploadError = '';
    this.imageUrls = [];

    Array.from(files).forEach((file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);

      this.rawHttp
        .post(
          `https://api.cloudinary.com/v1_1/${this.cloudName}/upload`,
          formData
        )
        .subscribe({
          next: (res: any) => {
            this.imageUrls.push(res.secure_url);
            if (this.imageUrls.length === files.length) {
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

  ngOnInit() {
    this.categoryService.getCategories().subscribe({
      next: (data: any) => {
        this.categories = data;
      },
      error: () => {
        this.formError = 'Failed to load categories.';
      },
    });
  }

  submitVehicle() {

    if (!this.category) {
      this.formError = 'Please select a category.';
      return;
    }
    if (!this.brand || !this.model || !this.year || !this.dailyRate || !this.seatingCapacity || !this.location || !this.fuelType || !this.transmission) {
      this.formError = 'Please fill in all required fields.';
      return;
    }

    const payload = {
      title: `${this.brand} ${this.model}`,
      brand: this.brand,
      model: this.model,
      year: this.year,
      dailyRate: this.dailyRate,
      hourlyRate: this.dailyRate / 5,
      categoryId: this.category,
      transmission: this.transmission.toUpperCase(),
      fuelType: this.fuelType.toUpperCase(),
      seatingCapacity: this.seatingCapacity,
      location: this.location,
      description: this.description,
      imageUrls: this.imageUrls,
    };

    this.http
      .post(`${environment.apiUrl}/vehicles`, payload)
      .subscribe({
        next: () => {
          alert('Vehicle listed successfully!');
          this.router.navigate(['/dashboard/manage-cars']);
        },
        error: (err) => {
          this.formError = err.error.message || 'Failed to list vehicle.';
        },
      });
  }
}
