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
import { countriesList, isoFromName, Country } from '../../../utils/country.util'

type ClientEditData = Partial<Client> & { isNew?: boolean };

@Component({
  selector: 'app-client-edit',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatCheckboxModule,
    MatButtonModule, MatSelectModule, MatOptionModule
  ],
  templateUrl: './client-edit.component.html',
  styleUrls: ['./client-edit.component.css']
})
export class ClientEditComponent {
  private fb = inject(NonNullableFormBuilder);
  private dialogRef = inject(MatDialogRef<ClientEditComponent, Partial<Client>>);

  data = inject<ClientEditData>(MAT_DIALOG_DATA);
  isNew = !!this.data.isNew;

  countries: Country[] = countriesList();
  iso(name?: string) { return isoFromName(name); }

  form = this.fb.group({
    fullName: this.fb.control(this.data.fullName ?? '', { validators: [Validators.required, Validators.maxLength(120)] }),
    displayName: this.fb.control(this.data.displayName ?? '', { validators: [Validators.required, Validators.maxLength(80)] }),
    email: this.fb.control(this.data.email ?? '', { validators: [Validators.required, Validators.email] }),
    details: this.fb.control(this.data.details ?? '', { validators: [Validators.maxLength(500)] }),
    active: this.fb.control(this.data.active ?? false),
    country: this.fb.control(this.data.country ?? '', { validators: [Validators.required] })
  });

  cancel() { this.dialogRef.close(); }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const payload: Partial<Client> = { ...this.form.getRawValue() };

    // Keep id when editing, omit when creating (backend will set it)
    if (!this.isNew && this.data.id != null) {
      payload.id = this.data.id;
    }

    this.dialogRef.close(payload);
  }
}
