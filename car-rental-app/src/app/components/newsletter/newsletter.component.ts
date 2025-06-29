import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [
    FormsModule, CommonModule],
  templateUrl: './newsletter.component.html',
  styleUrl: './newsletter.component.scss'
})
export class NewsletterComponent {
  email: string = '';

  onSubmit() {
    if (this.email) {
      console.log('Newsletter subscription:', this.email);
      // Handle newsletter subscription
      this.email = '';
    }
  }
}
