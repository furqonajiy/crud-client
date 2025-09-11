import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule} from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-second-nav',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatFormField, MatInputModule, MatButtonModule, FormsModule],
  templateUrl: './second-nav.component.html',
  styleUrl: './second-nav.component.css'
})
export class SecondNavComponent {
  q ='';

    onSearch() {
    // hook up later
    console.log('Search:', this.q);
  }
}
