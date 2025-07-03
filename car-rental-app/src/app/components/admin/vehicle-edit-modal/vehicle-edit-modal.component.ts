import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Vehicle} from '../../../shared/models/vehicle.model';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-vehicle-edit-modal',
  imports: [],
  templateUrl: './vehicle-edit-modal.component.html',
  styleUrl: './vehicle-edit-modal.component.scss'
})
export class VehicleEditModalComponent {
  @Input() vehicle!: Vehicle;
  @Output() update = new EventEmitter<Partial<Vehicle>>();
  @Output() close = new EventEmitter<void>();

  vehicleForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.vehicleForm = this.fb.group({
      make: ['', Validators.required],
      model: ['', Validators.required],
      year: ['', Validators.required],
      fuelType: ['', Validators.required],
      category: ['', Validators.required],
      transmission: ['', Validators.required],
      pricePerDay: ['', Validators.required],
      pricePerHour: ['', Validators.required],
      seat:['', Validators.required],
      features:['', Validators.required] ,
      images:['', Validators.required],
      condition: ['', Validators.required],
      locationId: ['', Validators.required],
      mileage:['', Validators.required],
      isAvailable: true    });
  }

  ngOnChanges(): void {
    if (this.vehicle) {
      this.vehicleForm.patchValue(this.vehicle);
    }
  }

  submitForm(): void {
    if (this.vehicleForm.valid) {
      this.update.emit({ ...this.vehicleForm.value, id: this.vehicle.id });
    }
  }

  closeModal(): void {
    this.close.emit();
  }
}
