import {Component} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-about-us',
  imports: [
    RouterLink
  ],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss'
})
export class AboutUsComponent {
  constructor(
    private router: Router,
    private route: ActivatedRoute) {}

  goBack(): void {
    this.router.navigate(['/']);
  }
}
