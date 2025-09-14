// ===== Angular / CDK =====
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

// ===== Angular Material =====
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';

// ===== App Types / Utils =====
import { Client } from '../client.component';
import { countriesList, isoFromName, Country } from '../../../utils/country.util';

// ===== Types =====
type ClientEditData = Partial<Client> & { isNew?: boolean };
type FormModel = {
  fullName: string;
  displayName: string;
  email: string;
  details: string;
  active: boolean;
  location: string;
  country: string;
};
type AddClientPayload = Omit<Client, 'id'>;

// ===== Consts =====
const LABELS: Record<keyof FormModel, string> = {
  fullName: 'Full name',
  displayName: 'Display name',
  email: 'Email',
  details: 'Details',
  active: 'Active',
  location: 'Location',
  country: 'Country',
};

@Component({
  selector: 'app-client-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './client-edit.component.html',
  styleUrls: ['./client-edit.component.css'],
})
export class ClientEditComponent {
  // ===== DI & API =====
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly http = inject(HttpClient);
  private readonly snack = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<ClientEditComponent, Client>);
  readonly data = inject<ClientEditData>(MAT_DIALOG_DATA);
  private readonly API = 'http://localhost:8080/api/v1/clients';

  // ===== Data for UI =====
  readonly countries: Country[] = countriesList();
  readonly iso = isoFromName;

  // ===== Form =====
  readonly form = this.fb.group({
    fullName: this.fb.control(this.data.fullName ?? '', [Validators.required, Validators.maxLength(128)]),
    displayName: this.fb.control(this.data.displayName ?? '', [Validators.required, Validators.maxLength(30)]),
    email: this.fb.control(this.data.email ?? '', [Validators.required, Validators.email, Validators.maxLength(254)]),
    details: this.fb.control(this.data.details ?? '', [Validators.maxLength(500)]),
    active: this.fb.control(this.data.active ?? false),
    location: this.fb.control(this.data.location ?? '', [Validators.maxLength(120)]),
    country: this.fb.control(this.data.country ?? '', [Validators.required]),
  });

  // ===== State =====
  submitting = false;

  // ===== Actions =====
  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const payload = this.form.getRawValue() as AddClientPayload;

    const req$ = this.data.isNew
      ? this.http.post<Client>(this.API, payload)
      : this.http.put<Client>(this.API, { id: this.data.id!, ...payload });

    req$.pipe(finalize(() => (this.submitting = false))).subscribe({
      next: (res) => this.dialogRef.close(res ?? ({ id: this.data.id!, ...payload } as Client)),
      error: (e) => this.snack.open(this.extractErr(e), 'Dismiss', { duration: 6000 }),
    });
  }

  // ===== Validation tooltip helpers =====
  getError(name: keyof FormModel): string {
    const c = this.form.get(name)!;
    if (!c || c.valid || !(c.dirty || c.touched)) return '';
    if (c.hasError('required')) return `${LABELS[name]} is required`;
    if (c.hasError('email')) return 'Enter a valid email';
    const max = c.getError('maxlength')?.requiredLength;
    return max ? `Max ${max} characters` : 'Invalid value';
  }

  onFieldChange(name: keyof FormModel, tip: MatTooltip): void {
    const msg = this.getError(name);
    tip.message = msg;
    msg ? tip.show() : tip.hide();
  }

  // ===== Errors =====
  private extractErr(e: any): string {
    const msg = e?.error?.message ?? e?.error ?? e?.message;
    return (typeof msg === 'string' && msg.trim()) ? msg : 'Unexpected error. Please try again.';
  }
}