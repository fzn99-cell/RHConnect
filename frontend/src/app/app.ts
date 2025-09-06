import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class App implements OnInit {
  protected readonly title = signal('angular-standalone-app');

  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    this.authService.loadUser().subscribe((user) => {
      if (user) {
        const role = user.role;
        this.router.navigate([`/${role}-dashboard`]);
      }
    });
  }
}
