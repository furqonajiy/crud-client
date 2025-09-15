import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import * as XLSX from 'xlsx';

/* ===== Types ===== */
type NewClient = {
  fullName: string;
  displayName: string;
  email: string;
  details?: string;
  active: boolean;
  location?: string;
  country: string;
};

/* ===== Constants ===== */
const CLIENTS_API = 'http://localhost:8080/api/v1/clients';
const TEMPLATE_PATH = '/assets/xlsx/client-upload-template.xlsx';
const REQUIRED_HEADERS = ['Full Name', 'Display Name', 'Email', 'Active', 'Country'] as const;

/* ===== Component ===== */
@Component({
  selector: 'app-client-upload',
  standalone: true,
  imports: [
    CommonModule, HttpClientModule,
    MatDialogModule, MatButtonModule, MatSnackBarModule, MatIconModule,
  ],
  templateUrl: './client-upload.component.html',
  styleUrls: ['./client-upload.component.css'],
})
export class ClientUploadComponent {
  /* ===== DI ===== */
  private readonly http = inject(HttpClient);
  private readonly snack = inject(MatSnackBar);
  private readonly ref = inject(MatDialogRef<ClientUploadComponent>);

  /* ===== State (signals) ===== */
  readonly fileName = signal<string>('');
  readonly rows = signal<NewClient[]>([]);
  readonly loading = signal(false);
  readonly imported = signal(0);

  // Small preview for the table
  readonly preview = computed(() => this.rows().slice(0, 5));
  // Enable Import when we have rows and not loading
  readonly canImport = computed(() => !this.loading() && this.rows().length > 0);

  /* ===== Events (template) ===== */
  onPickFile(input: HTMLInputElement) {
    input.click();
    // ensure the Upload button doesn't look "pressed"
    queueMicrotask(() => (document.activeElement as HTMLElement | null)?.blur());
  }

  async onFile(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.fileName.set(file.name);

    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];

      // Validate headers from the first row
      const headers = (XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: '' })[0] ?? [])
        .map(h => String(h).trim());
      const missing = this.missingRequiredHeaders(headers);
      if (missing.length) {
        this.rows.set([]);
        this.toast(`Missing columns: ${missing.join(', ')}`);
        return;
      }

      // Parse rows using sheet header names
      const raw = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });
      const mapped = raw.map(this.mapRow).filter(Boolean) as NewClient[];

      this.rows.set(mapped);
      this.imported.set(0);
      this.toast(`Parsed ${mapped.length} rows`, 2500);
    } catch (err) {
      console.error(err);
      this.rows.set([]);
      this.toast('Failed to read Excel file');
    }
  }

  /* ===== Excel parsing ===== */
  private missingRequiredHeaders(headers: string[]): string[] {
    const set = new Set(headers);
    return REQUIRED_HEADERS.filter(h => !set.has(h));
  }

  private toBool(v: unknown): boolean {
    const s = String(v ?? '').trim().toLowerCase();
    return s === '1' || s === 'true' || s === 'yes' || s === 'y';
  }

  private mapRow = (r: Record<string, any>): NewClient | null => {
    const get = (h: string) => String(r[h] ?? '').trim();
    const obj: NewClient = {
      fullName: get('Full Name'),
      displayName: get('Display Name'),
      email: get('Email'),
      details: get('Details'),
      active: this.toBool(r['Active']),
      location: get('Location'),
      country: get('Country'),
    };
    return (obj.fullName && obj.displayName && obj.email && obj.country) ? obj : null;
  };

  /* ===== Template download (local /assets) ===== */
  async downloadTemplateFile() {
    try {
      const blob = await firstValueFrom(
        this.http.get(TEMPLATE_PATH, { responseType: 'blob' })
      );

      // XLSX is a ZIP (must start with "PK")
      const head = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
      if (!(head[0] === 0x50 && head[1] === 0x4B)) {
        this.toast('Template not found or invalid. Check assets path.');
        return;
      }

      const url = URL.createObjectURL(blob);
      try {
        const a = document.createElement('a');
        a.href = url;
        a.download = 'client-upload-template.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch {
      this.toast('Failed to download template. Is it in /assets/xlsx/?');
    }
  }

  /* ===== Import API ===== */
  async importNow() {
    if (!this.canImport()) return;

    this.loading.set(true);
    const data = this.rows();

    // 1) Try bulk
    try {
      await firstValueFrom(this.http.post(`${CLIENTS_API}/bulk`, data));
      this.imported.set(data.length);
      this.toast(`Imported ${data.length} clients (bulk)`, 3000);
      this.ref.close(true);
      return;
    } catch {
      // 2) Fallback: sequential create
      try {
        let done = 0;
        for (const row of data) {
          await firstValueFrom(this.http.post(CLIENTS_API, row));
          this.imported.set(++done);
        }
        this.toast(`Imported ${this.imported()} clients`, 3000);
        this.ref.close(true);
      } catch (err) {
        console.error(err);
        this.toast('Import failed. Please check your data.');
      } finally {
        this.loading.set(false);
      }
    } finally {
      this.loading.set(false);
    }
  }

  /* ===== Utils ===== */
  private toast(message: string, duration = 4000) {
    this.snack.open(message, 'OK', { duration });
  }

  close() {
    this.ref.close(false);
  }
}
