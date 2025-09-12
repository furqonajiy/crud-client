import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { Client } from '../client.component';
import { getNames } from 'country-list';

import wc from 'world-countries';
type CountryOption = { code: string; name: string };

@Component({
  selector: 'app-client-edit',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule
  ],
  templateUrl: './client-edit.component.html',
  styleUrls: ['./client-edit.component.css']
})
export class ClientEditComponent {
  private fb = inject(NonNullableFormBuilder);
  private dialogRef = inject(MatDialogRef<ClientEditComponent, Client>);
  data = inject<Client>(MAT_DIALOG_DATA);

  countries: CountryOption[] = wc
    .map(c => ({ code: c.cca2, name: c.name.common })) // e.g. "NL" -> "Netherlands"
    .sort((a, b) => a.name.localeCompare(b.name));


  // Edit all values EXCEPT id (we keep id outside the form)
  form = this.fb.group({
    fullName: this.fb.control(this.data.fullName, { validators: [Validators.required, Validators.maxLength(120)] }),
    displayName: this.fb.control(this.data.displayName, { validators: [Validators.required, Validators.maxLength(80)] }),
    email: this.fb.control(this.data.email, { validators: [Validators.required, Validators.email] }),
    details: this.fb.control(this.data.details ?? ''),
    active: this.fb.control(this.data.active),
    country: this.fb.control(this.data.country, { validators: [Validators.required] })
  });

  cancel() { this.dialogRef.close(); }

  save() {
    if (this.form.invalid) return;
    const values = this.form.getRawValue(); // types are now string/boolean, not nullable
    const updated: Client = { ...this.data, ...values }; // ✅ compiles
    this.dialogRef.close(updated);
  }
}
