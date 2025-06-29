import { Component } from '@angular/core';
import {Vehicle} from '../../shared/models/vehicle.model';
import {VehicleService} from '../../services/vehicle.service';
import {ActivatedRoute, Router} from '@angular/router';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {HeaderComponent} from '../header/header.component';
import {FooterComponent} from '../footer/footer.component';

@Component({
  selector: 'app-vehicle-details',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    NgForOf,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './vehicle-details.component.html',
  styleUrl: './vehicle-details.component.scss'
})
export class VehicleDetailsComponent {
  vehicle: Vehicle | null = null;
  vehicleId: string = '';
  constructor(private vehicleService: VehicleService,  private router: Router,private route: ActivatedRoute,) {}
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.vehicleId = params['id'];
      this.loadVehicleDetails();
    });
  }
  loadVehicleDetails(): void {
    this.vehicleService.getVehicle(this.vehicleId).subscribe(vehicle => {
      this.vehicle = vehicle;
    });
    }
  goBack(): void {
    this.router.navigate(['/']);
  }
}
