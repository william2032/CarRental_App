import { Component } from '@angular/core';
import {HeaderComponent} from '../header/header.component';
import {HeroSectionComponent} from '../hero-section/hero-section.component';
import {FeaturedVehiclesComponent} from '../featured-vehicles/featured-vehicles.component';
import {OwnerSectionComponent} from '../owner-section/owner-section.component';
import {TestimonialsComponent} from '../testimonials/testimonials.component';
import {NewsletterComponent} from '../newsletter/newsletter.component';
import {FooterComponent} from '../footer/footer.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    HeaderComponent,
    HeroSectionComponent,
    FeaturedVehiclesComponent,
    OwnerSectionComponent,
    TestimonialsComponent,
    NewsletterComponent,
    FooterComponent
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {

}
