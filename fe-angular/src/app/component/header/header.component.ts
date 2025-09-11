import { Component, OnInit } from '@angular/core';
import { TopNavComponent } from '../top-nav/top-nav.component';
import { SecondNavComponent } from '../second-nav/second-nav.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [TopNavComponent, SecondNavComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
