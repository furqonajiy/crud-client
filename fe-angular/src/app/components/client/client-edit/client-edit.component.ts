// ===== Angular / CDK =====
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// ===== Angular Material =====
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

// ===== App Types / Utils =====
import { Client } from '../client.component';
import { countriesList, isoFromName, Country } from '../../../utils/country.util';

type ClientEditData = Partial<Client> & { isNew?: boolean };

type FormModel = {
  fullName: string;
  displayName: string;
  email: string;
  details: string;
  active: boolean;
  country: string;
};

@Component({
  selector: 'app-client-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    // Material
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
  ],
  templateUrl: './client-edit.component.html',
  styleUrls: ['./client-edit.component.css'],
})
export class ClientEditComponent {
  // ===== DI =====
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ClientEditComponent, Partial<Client>>);
  readonly data = inject<ClientEditData>(MAT_DIALOG_DATA);

  // ===== Data for UI =====
  readonly countries: Country[] = countriesList();
  readonly iso = isoFromName;

  // ===== Form =====
  private readonly initial: FormModel = {
    fullName: this.data.fullName ?? '',
    displayName: this.data.displayName ?? '',
    email: this.data.email ?? '',
    details: this.data.details ?? '',
    active: this.data.active ?? false,
    country: this.data.country ?? '',
  };

  readonly form = this.fb.group({
    fullName: this.fb.control(this.initial.fullName, [Validators.required, Validators.maxLength(120)]),
    displayName: this.fb.control(this.initial.displayName, [Validators.required, Validators.maxLength(80)]),
    email: this.fb.control(this.initial.email, [Validators.required, Validators.email]),
    details: this.fb.control(this.initial.details, [Validators.maxLength(500)]),
    active: this.fb.control(this.initial.active),
    country: this.fb.control(this.initial.country, [Validators.required]),
  });

  // ===== Actions =====
  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // include id only when editing
    const result: Partial<Client> = {
      ...(this.data.id != null ? { id: this.data.id } : {}),
      ...this.form.getRawValue(),
    };

    this.dialogRef.close(result);
  }
}
