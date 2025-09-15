// src/app/utils/export.util.ts
// Excel export for Clients using SheetJS (xlsx)
// Install once:  npm i xlsx   (optionally: npm i -D @types/xlsx)

import * as XLSX from 'xlsx';

export interface ExportClient {
  id: number;
  fullName?: string;
  displayName?: string;
  email?: string;
  details?: string;
  active?: boolean;
  location?: string;
  country?: string;
}

/** Format: yyyyMMddhhmm (e.g., 20250914*2035*) */
export function formatTimestampForFilename(d = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes())
  );
}

/** Export an array of clients into an Excel file: clients_yyyyMMddhhmm.xlsx */
export function exportClientsToXlsx(clients: ExportClient[], filePrefix = 'clients'): void {
  const rows = (clients ?? []).map(c => ({
    ID: c.id,
    'Full Name': c.fullName ?? '',
    'Display Name': c.displayName ?? '',
    Email: c.email ?? '',
    Details: c.details ?? '',
    Active: Boolean(c.active),          // stays boolean in Excel (TRUE/FALSE)
    Location: c.location ?? '',
    Country: c.country ?? '',
  }));

  const headers = ['ID', 'Full Name', 'Display Name', 'Email', 'Details', 'Active', 'Location', 'Country'] as const;

  // Create sheet with stable header order
  const ws = XLSX.utils.json_to_sheet(rows, { header: [...headers] });

  // Auto-size columns (basic heuristic based on string length)
  const colWidths = headers.map(h => {
    const maxLen = Math.max(
      String(h).length,
      ...rows.map(r => (r[h as keyof typeof rows[number]] ?? '').toString().length)
    );
    return { wch: Math.min(Math.max(maxLen + 2, 10), 60) }; // clamp 10..60
  });
  (ws as any)['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Clients');

  const filename = `${filePrefix}_${formatTimestampForFilename()}.xlsx`;
  XLSX.writeFile(wb, filename, { compression: true });
}
