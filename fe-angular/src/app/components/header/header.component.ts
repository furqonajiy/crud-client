import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FirstNavComponent } from './first-nav/first-nav.component';
import { SecondNavComponent } from './second-nav/second-nav.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FirstNavComponent, SecondNavComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

}
