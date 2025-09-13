// ===== Angular / CDK =====
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';

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
  location: string;
  country: string;
};

type AddClientPayload = Omit<Client, 'id'>;
type UpdateClientPayload = Client;

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
  ],
  templateUrl: './client-edit.component.html',
  styleUrls: ['./client-edit.component.css'],
})
export class ClientEditComponent {
  // ===== DI =====
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly http = inject(HttpClient);
  private readonly dialogRef = inject(MatDialogRef<ClientEditComponent, Client>);
  readonly data = inject<ClientEditData>(MAT_DIALOG_DATA);
  private readonly snackBar = inject(MatSnackBar);

  // ===== Data for UI =====
  readonly countries: Country[] = countriesList();
  readonly iso = isoFromName;

  // ===== API =====
  private readonly API = 'http://localhost:8080/api/v1/clients';

  // ===== Form =====
  private readonly initial: FormModel = {
    fullName: this.data.fullName ?? '',
    displayName: this.data.displayName ?? '',
    email: this.data.email ?? '',
    details: this.data.details ?? '',
    active: this.data.active ?? false,
    location: this.data.location ?? '', // ✅ fixed
    country: this.data.country ?? '',
  };

  readonly form = this.fb.group({
    fullName: this.fb.control(this.initial.fullName, [Validators.required, Validators.maxLength(120)]),
    displayName: this.fb.control(this.initial.displayName, [Validators.required, Validators.maxLength(80)]),
    email: this.fb.control(this.initial.email, [Validators.required, Validators.email]),
    details: this.fb.control(this.initial.details, [Validators.maxLength(500)]),
    active: this.fb.control(this.initial.active),
    location: this.fb.control(this.initial.location, [Validators.maxLength(120)]),
    country: this.fb.control(this.initial.country, [Validators.required]),
  });

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

    const bodyNoId: AddClientPayload = this.form.getRawValue() as AddClientPayload;

    if (this.data.isNew) {
      // POST /api/v1/clients
      this.http.post<Client>(this.API, bodyNoId)
        .pipe(finalize(() => (this.submitting = false)))
        .subscribe({
          next: (created) => this.dialogRef.close(created),
          error: (err) => this.showError(err),
        });
    } else {
      // PUT /api/v1/clients
      const bodyWithId: Client = { id: this.data.id!, ...bodyNoId };

      this.http.put<Client>(this.API, bodyWithId)
        .pipe(finalize(() => (this.submitting = false)))
        .subscribe({
          next: (updated) => this.dialogRef.close(updated),
          error: (err) => this.showError(err),
        });
    }
  }

  private getErrorMessage(err: unknown): string {
    const http = err as HttpErrorResponse;
    if (http?.error) {
      if (typeof http.error === 'string') return http.error;
      if (typeof http.error?.message === 'string') return http.error.message;
    }
    if (typeof http?.message === 'string') return http.message;
    return 'Unexpected error. Please try again.';
  }

  private showError(err: unknown): void {
    this.snackBar.open(this.getErrorMessage(err), 'Dismiss', { duration: 6000 });
  }
}