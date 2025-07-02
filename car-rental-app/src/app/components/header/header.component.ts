import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {AuthService} from "../../services/auth.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {

  private userSubscription?: Subscription;
  userEmail: string | null = null;
  isLoggedIn: boolean = false;
  showLogoutModal = false;


  constructor(
    private router: Router,
    private authService: AuthService) {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.userEmail = user?.email || null;
      this.isLoggedIn = !!user && this.authService.isLoggedIn();
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
  navigateToAdmin(): void {
    this.router.navigate(['/admin']);
  }
  navigateToAboutUs():void {
    this.router.navigate(['/home/about-us']);
  }

  logout(): void {
    this.showLogoutModal = true;
    setTimeout(() => {
      this.authService.logout();
      this.showLogoutModal = false;
      this.router.navigate(['/']);
    }, 1500)
  }

}
