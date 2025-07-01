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
      name: 'Joy Mwende',
      avatar: "https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/roberta-casas.png",
      rating: 5,
      review: "I've used many booking platforms before, but none compare to the personalized experience and seamless service provided."
    },
    {
      id: 2,
      name: 'Goodman William',
      avatar: "https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/jese-leos.png",
      rating: 5,
      review: "I've used many booking platforms before, but none compare to the personalized experience and seamless service provided."
    },
    {
      id: 3,
      name: 'Earl Monalisa',
      avatar: 'https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/joseph-mcfall.png',
      rating: 5,
      review: "I've used many booking platforms before, but none compare to the personalized experience and seamless service provided."
    }
  ];
  getStarArray(rating: number): number[] {
    return Array(rating).fill(0);
  }
}
