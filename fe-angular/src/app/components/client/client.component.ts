import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

export interface Client {
  id: number;
  fullName: string;
  displayName: string;
  email: string;
  details: string;
  active: boolean;
  location: string;
}

const CLIENTS: Client[] = [
  { id: 1, fullName: 'Yolando Luczki', displayName: 'Yolando', email: 'yolando@acme.io', details: 'VIP account. Likes monthly summary.', active: true, location: 'France' },
  { id: 2, fullName: 'Roxane Campain', displayName: 'Rox', email: 'roxane@acme.io', details: 'Prefers email over phone.', active: false, location: 'France' },
  { id: 3, fullName: 'Penney Weight', displayName: 'P. Weight', email: 'penney@acme.io', details: 'Q2 renewal candidate.', active: true, location: 'South Africa' },
  { id: 4, fullName: 'Nelida Sawchuk', displayName: 'Nel', email: 'nelida@acme.io', details: 'High NPS; upsell potential.', active: true, location: 'South Africa' },
  { id: 5, fullName: 'Micaela Rhymes', displayName: 'Mica', email: 'micaela@acme.io', details: 'Wants sandbox access.', active: true, location: 'France' },
  { id: 6, fullName: 'Melodie Knipp', displayName: 'Mel', email: 'melodie@acme.io', details: 'Onboarding in progress.', active: false, location: 'Finland' },
  { id: 7, fullName: 'Layla Springe', displayName: 'Layla', email: 'layla@acme.io', details: 'Negotiation stage.', active: false, location: 'South Africa' },
  { id: 8, fullName: 'Laticia Merced', displayName: 'Ticia', email: 'laticia@acme.io', details: 'Legacy plan; consider migration.', active: false, location: 'Burkina Faso' }
];

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatFormField, MatIcon],
  templateUrl: './client.component.html',
  styleUrl: './client.component.css'
})
export class ClientComponent implements OnInit {
  displayedColumns: (keyof Client)[] = [
    'id', 'fullName', 'displayName', 'email', 'details', 'active', 'location'
  ];
  data: Client[] = CLIENTS;

  ngOnInit(): void {
    this.getAllClients()
  }

  getAllClients() {
    console.log('Get All Client')
    this.data = CLIENTS;
  }
}
