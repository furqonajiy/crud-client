import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Client } from '../client.component';
import { isoFromName } from '../../../utils/country.util'; // path from client-details/

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
    return isoFromName(country);
  }

  close() { this.dialogRef.close(); }
}
