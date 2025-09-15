// src/app/components/header/second-nav/second-nav.component.ts
import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserLoginComponent } from '../../user/user-login/user-login.component';

@Component({
  selector: 'app-second-nav',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    RouterLink,          // 👈 required for [routerLink]
    RouterLinkActive     // 👈 required for routerLinkActive + routerLinkActiveOptions
  ],
  templateUrl: './second-nav.component.html',
  styleUrls: ['./second-nav.component.css']
})
export class SecondNavComponent {
  private dialog = inject(MatDialog);
  openLogin() {
    this.dialog.open(UserLoginComponent, { panelClass: 'client-edit-light', autoFocus: false });
  }
}
