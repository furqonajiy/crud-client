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

// Countries with common names like "Netherlands"
import wc from 'world-countries';
type CountryOption = { code: string; name: string };

@Component({
  selector: 'app-client-edit',
  standalone: true,
  // keep default encapsulation (no ViewEncapsulation.None)
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
    .map(c => ({ code: c.cca2.toLowerCase(), name: c.name.common }))
    .sort((a, b) => a.name.localeCompare(b.name));
  private codeByName = new Map(this.countries.map(c => [c.name, c.code]));

  iso(name: string | null | undefined): string {
    return name ? (this.codeByName.get(name) ?? '') : '';
  }

  form = this.fb.group({
    fullName: this.fb.control(this.data.fullName, { validators: [Validators.required, Validators.maxLength(120)] }),
    displayName: this.fb.control(this.data.displayName, { validators: [Validators.required, Validators.maxLength(80)] }),
    email: this.fb.control(this.data.email, { validators: [Validators.required, Validators.email] }),
    details: this.fb.control(this.data.details ?? '', { validators: [Validators.maxLength(500)] }),
    active: this.fb.control(this.data.active),
    country: this.fb.control(this.data.country ?? '', { validators: [Validators.required] })
  });

  cancel() { this.dialogRef.close(); }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const updated: Client = { ...this.data, ...this.form.getRawValue() };
    this.dialogRef.close(updated);
  }
}
