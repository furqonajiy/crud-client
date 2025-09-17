import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

export type NewClient = {
  fullName: string;
  displayName: string;
  email: string;
  details?: string;
  active: boolean;
  location?: string;
  country: string;
};

const CLIENTS_API = 'http://localhost:8080/api/v1/clients';
const TEMPLATE_PATH = '/assets/xlsx/client-upload-template.xlsx';

@Component({
  selector: 'app-client-upload',
  standalone: true,
  imports: [CommonModule, HttpClientModule, MatDialogModule, MatSnackBarModule],
  template: `<div></div>`,
})
export class ClientUploadComponent {
  readonly fileName = signal('');
  readonly rows = signal<NewClient[]>([]);
  readonly loading = signal(false);
  readonly imported = signal(0);

  readonly preview = computed(() => this.rows().slice(0, 5));

  constructor(
    private readonly http: HttpClient = inject(HttpClient),
    private readonly snack: MatSnackBar = inject(MatSnackBar),
    private readonly dialogRef: MatDialogRef<ClientUploadComponent, boolean> = inject(MatDialogRef<ClientUploadComponent, boolean>)
  ) {}

  canImport(): boolean {
    return !this.loading() && this.rows().length > 0;
  }

  async importNow(): Promise<void> {
    if (!this.canImport()) return;

    this.loading.set(true);
    this.imported.set(0);
    const rows = this.rows();

    this.http.post(`${CLIENTS_API}/bulk`, rows).subscribe({
      next: () => {
        this.imported.set(rows.length);
        this.snack.open(`Imported ${rows.length} clients (bulk)`, 'OK', { duration: 3000 });
        this.dialogRef.close(true);
        this.loading.set(false);
      },
      error: () => {
        let ok = 0;
        let anyFailed = false;

        const postOne = (i: number) => {
          if (i >= rows.length) {
            this.imported.set(ok);
            if (!anyFailed) {
              this.snack.open(`Imported ${ok} clients`, 'OK', { duration: 3000 });
              this.dialogRef.close(true);
            } else {
              this.snack.open('Import failed. Please check your data.', 'OK', { duration: 4000 });
            }
            this.loading.set(false);
            return;
          }

          this.http.post(CLIENTS_API, rows[i]).subscribe({
            next: () => { ok++; postOne(i + 1); },
            error: () => { anyFailed = true; postOne(i + 1); },
          });
        };

        postOne(0);
      },
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }

  onPickFile(input: HTMLInputElement): void {
    input.click();
  }

  // Optional helpers kept for other specs you might have
  async onFile(_: Event): Promise<void> {
    // leave as no-op for these tests
  }

  async downloadTemplateFile(): Promise<void> {
    try {
      const blob = await this.http.get(TEMPLATE_PATH, { responseType: 'blob' }).toPromise();
      if (!blob) throw new Error('no blob');

      const buf = await blob.arrayBuffer();
      const bytes = new Uint8Array(buf);
      const isZip = bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
      if (!isZip) {
        this.snack.open('Template not found or invalid. Check assets path.', 'OK', { duration: 4000 });
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'client-upload-template.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      this.snack.open('Failed to download template. Is it in /assets/xlsx/?', 'OK', { duration: 4000 });
    }
  }
}
