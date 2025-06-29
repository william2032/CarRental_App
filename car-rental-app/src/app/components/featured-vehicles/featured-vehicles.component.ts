import { Component } from '@angular/core';
import {CommonModule} from '@angular/common';

interface Vehicle {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  transmission: string;
  location: string;
  gasoline: boolean;
  available: boolean;
}

@Component({
  selector: 'app-featured-vehicles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './featured-vehicles.component.html',
  styleUrl: './featured-vehicles.component.scss'
})
export class FeaturedVehiclesComponent {
  vehicles: Vehicle[] = [
    {
      id: 1,
      name: 'BMW X5',
      category: 'SUV',
      price: 500,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      transmission: 'Automatic',
      location: 'Los Angeles',
      gasoline: true,
      available: true
    },
    {
      id: 2,
      name: 'BMW X5',
      category: 'Coupe',
      price: 500,
      image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2126&q=80',
      transmission: 'Automatic',
      location: 'Los Angeles',
      gasoline: true,
      available: true
    },
    {
      id: 3,
      name: 'BMW X5',
      category: 'Sports',
      price: 600,
      image: 'https://images.unsplash.com/photo-1610768764270-790fbec18178?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1984&q=80',
      transmission: 'Automatic',
      location: 'Los Angeles',
      gasoline: false,
      available: true
    }
  ];
}
