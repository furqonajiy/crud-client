// ===== Angular / CDK =====
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// ===== Angular Material =====
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

// ===== App Types / Utils =====
import { Client } from '../client.component';
import { isoFromName } from '../../../utils/country.util';

@Component({
  selector: 'app-client-details',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.css'],
})
export class ClientDetailsComponent {
  // injected dialog data
  readonly data = inject<Client>(MAT_DIALOG_DATA);

  // expose the util directly for the template
  readonly iso = isoFromName;
}
