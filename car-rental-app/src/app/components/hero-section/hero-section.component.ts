import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';

interface HeroImage {
  url: string;
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss'
})
export class HeroSectionComponent implements OnInit, OnDestroy {
  @ViewChild('heroSection', {static: true}) heroSection!: ElementRef;

  constructor( private router: Router) {}
  currentImageIndex = 0;
  scrollProgress = 0;
  heroImages: HeroImage[] = [
    {
      url: 'https://images.unsplash.com/photo-1550355191-aa8a80b41353?w=1920&h=1080&fit=crop',
      title: 'Luxury Sports Cars',
      subtitle: 'Experience the thrill of premium vehicles'
    },
    {
      url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1920&h=1080&fit=crop',
      title: 'Classic Collection',
      subtitle: 'Timeless elegance meets modern comfort'
    },
    {
      url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1920&h=1080&fit=crop',
      title: 'Adventure Vehicles',
      subtitle: 'Ready for your next journey'
    },
    {
      url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1920&h=1080&fit=crop',
      title: 'Urban Mobility',
      subtitle: 'Perfect for city exploration'
    },
    {
      url: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=1920&h=1080&fit=crop',
      title: 'Electric Future',
      subtitle: 'Sustainable luxury transportation'
    }
  ];

  private scrollListener!: () => void;

  ngOnInit() {
    this.initScrollListener();
  }

  ngOnDestroy() {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
    document.body.style.scrollBehavior = 'auto';
  }

  private initScrollListener() {
    let ticking = false;

    this.scrollListener = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', this.scrollListener);
    this.handleScroll(); // Initial call
  }

  private handleScroll() {
    if (!this.heroSection?.nativeElement) return;

    const element = this.heroSection.nativeElement;
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Calculate scroll progress when hero is in viewport
    if (rect.top <= windowHeight && rect.bottom >= 0) {
      const totalScrollable = windowHeight + rect.height;
      const scrolled = windowHeight - rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalScrollable));

      this.scrollProgress = progress;

      // Change image based on scroll progress
      const imageIndex = Math.floor(progress * (this.heroImages.length - 1));
      this.currentImageIndex = Math.min(imageIndex, this.heroImages.length - 1);

      // Slow down scrolling when over hero
      if (progress > 0 && progress < 1) {
        document.body.style.scrollBehavior = 'smooth';
      }
    }
  }

  getImageTransform(index: number): string {
    const isActive = index === this.currentImageIndex;
    const isPrev = index < this.currentImageIndex;
    const isNext = index > this.currentImageIndex;

    if (isActive) {
      return 'translateX(0) scale(1)';
    } else if (isPrev) {
      return 'translateX(-100%) scale(0.9)';
    } else {
      return 'translateX(100%) scale(0.9)';
    }
  }

  getImageOpacity(index: number): number {
    return index === this.currentImageIndex ? 1 : 0;
  }

  getContentTransform(): number {
    return this.scrollProgress * 20 - 10;
  }

  getContentOpacity(): number {
    return Math.max(0.7, 1 - this.scrollProgress * 0.3);
  }
  navigateToAllVehicles(): void {
    this.router.navigate(['/all-vehicles']);
  }
}
