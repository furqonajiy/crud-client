// Standalone dialog: import clients from your Excel template
// npm i xlsx
import { CommonModule } from '@angular/common';
import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import * as XLSX from 'xlsx';

type NewClient = {
  fullName: string;
  displayName: string;
  email: string;
  details?: string;
  active: boolean;
  location?: string;
  country: string;
};

const CLIENTS_API = 'http://localhost:8080/api/v1/clients';

// Your template headers (exact text + order)
const TEMPLATE_HEADERS = [
  'ID', 'Full Name', 'Display Name', 'Email', 'Details', 'Active', 'Location', 'Country'
] as const;

// Map from template headers -> API fields (ID is ignored)
const HEADER_TO_FIELD: Record<string, keyof NewClient | null> = {
  'ID': null,
  'Full Name': 'fullName',
  'Display Name': 'displayName',
  'Email': 'email',
  'Details': 'details',
  'Active': 'active',
  'Location': 'location',
  'Country': 'country',
};

const REQUIRED_HEADERS = ['Full Name', 'Display Name', 'Email', 'Active', 'Country'];

@Component({
  selector: 'app-client-upload',
  standalone: true,
  imports: [CommonModule, HttpClientModule, MatDialogModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './client-upload.component.html',
  styleUrls: ['./client-upload.component.css'],
})
export class ClientUploadComponent {
  private readonly http = inject(HttpClient);
  private readonly snack = inject(MatSnackBar);
  private readonly ref = inject(MatDialogRef<ClientUploadComponent>);

  fileName = signal<string>('');
  rows = signal<NewClient[]>([]);
  loading = signal(false);
  imported = signal(0);
  preview = computed(() => this.rows().slice(0, 5));
  canImport = computed(() => !this.loading() && this.rows().length > 0);

  onPickFile(input: HTMLInputElement) { input.click(); }

  async onFile(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]; if (!file) return;
    this.fileName.set(file.name);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];

      // Grab header row exactly as in the sheet
      const rows2d = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: '' }) as any[][];
      const headers = (rows2d[0] ?? []).map((h: any) => String(h).trim());

      // Validate required
      const missing = REQUIRED_HEADERS.filter(h => !headers.includes(h));
      if (missing.length) {
        this.rows.set([]);
        this.snack.open(`Missing columns: ${missing.join(', ')}`, 'OK', { duration: 5000 });
        return;
      }

      // Read records and map using your headers
      const raw = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });
      const mapped: NewClient[] = raw.map(r => this.mapRow(r)).filter(Boolean) as NewClient[];

      this.rows.set(mapped);
      this.imported.set(0);
      this.snack.open(`Parsed ${mapped.length} rows`, undefined, { duration: 2500 });
    } catch (err) {
      console.error(err);
      this.rows.set([]);
      this.snack.open('Failed to read Excel file', 'OK', { duration: 4000 });
    }
  }

  private toBool(v: any): boolean {
    const s = String(v).trim().toLowerCase();
    return s === '1' || s === 'true' || s === 'yes' || s === 'y';
  }

  private mapRow(r: Record<string, any>): NewClient | null {
    const get = (h: string) => r[h] ?? '';
    const obj: NewClient = {
      fullName: String(get('Full Name')).trim(),
      displayName: String(get('Display Name')).trim(),
      email: String(get('Email')).trim(),
      details: String(get('Details')).trim(),
      active: this.toBool(get('Active')),
      location: String(get('Location')).trim(),
      country: String(get('Country')).trim(),
    };
    // Basic validation
    if (!obj.fullName || !obj.displayName || !obj.email || !obj.country) return null;
    return obj;
  }

  async importNow() {
    if (!this.canImport()) return;
    this.loading.set(true);
    const data = this.rows();

    // Try bulk first
    try {
      await this.http.post(`${CLIENTS_API}/bulk`, { clients: data }).toPromise();
      this.imported.set(data.length);
      this.snack.open(`Imported ${data.length} clients (bulk)`, undefined, { duration: 3000 });
      this.ref.close(true);
      return;
    } catch {
      // Fallback to single create
      try {
        let done = 0;
        for (const row of data) {
          await this.http.post(CLIENTS_API, row).toPromise();
          done++; this.imported.set(done);
        }
        this.snack.open(`Imported ${done} clients`, undefined, { duration: 3000 });
        this.ref.close(true);
      } catch (err) {
        console.error(err);
        this.snack.open('Import failed. Please check your data.', 'OK', { duration: 5000 });
      } finally {
        this.loading.set(false);
      }
    } finally {
      this.loading.set(false);
    }
  }

  // Generates a template that matches your headers & order
  downloadTemplate() {
    const sample: Record<string, any> = {};
    for (const h of TEMPLATE_HEADERS) sample[h] = '';
    sample['Full Name'] = 'Jane Doe';
    sample['Display Name'] = 'Jane';
    sample['Email'] = 'jane@example.com';
    sample['Details'] = 'VIP';
    sample['Active'] = true;
    sample['Location'] = 'Amsterdam';
    sample['Country'] = 'Netherlands';
    // ID intentionally left blank

    const ws = XLSX.utils.json_to_sheet([sample], { skipHeader: false });
    // Enforce header order
    (ws['!cols'] ??= new Array(TEMPLATE_HEADERS.length));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clients');
    XLSX.writeFile(wb, 'client-import-template.xlsx');
  }

  close() { this.ref.close(false); }
}
