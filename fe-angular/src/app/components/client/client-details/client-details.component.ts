import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface Client {
  id: number;
  fullName: string;
  displayName: string;
  email: string;
  details: string;
  active: boolean;
  location: string;
}

@Component({
  selector: 'app-client-details',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.css']
})
export class ClientDetailsComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Client,
    public dialogRef: MatDialogRef<ClientDetailsComponent>
  ) { }

  iso(country: string): string {
    const map: Record<string, string> = {
      'France': 'fr', 'Finland': 'fi', 'South Africa': 'za', 'Burkina Faso': 'bf'
    };
    return map[country] ?? 'xx';
  }

  close() { this.dialogRef.close(); }
}
