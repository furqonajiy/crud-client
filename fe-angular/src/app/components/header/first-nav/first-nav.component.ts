import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon'

@Component({
  selector: 'app-first-nav',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './first-nav.component.html',
  styleUrl: './first-nav.component.css'
})
export class FirstNavComponent {

}
