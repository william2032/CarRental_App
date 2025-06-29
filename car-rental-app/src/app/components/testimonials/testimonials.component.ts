import { Component } from '@angular/core';
import {CommonModule} from '@angular/common';

interface Testimonial {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  review: string;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss'
})
export class TestimonialsComponent {
  testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Emma Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b6b2c28d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      rating: 5,
      review: "I've used many booking platforms before, but none compare to the personalized experience and seamless service provided."
    },
    {
      id: 2,
      name: 'Emma Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      rating: 5,
      review: "I've used many booking platforms before, but none compare to the personalized experience and seamless service provided."
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      rating: 5,
      review: "I've used many booking platforms before, but none compare to the personalized experience and seamless service provided."
    }
  ];
  getStarArray(rating: number): number[] {
    return Array(rating).fill(0);
  }
}
