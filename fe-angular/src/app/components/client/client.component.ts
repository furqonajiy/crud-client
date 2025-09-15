// ========== Angular / CDK ==========
import {
  Component, OnInit, AfterViewInit, OnDestroy,
  signal, computed, effect, viewChild, NgZone, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SelectionModel } from '@angular/cdk/collections';
import { FormsModule } from '@angular/forms';

// ========== Angular Material ==========
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MAT_SELECT_CONFIG } from '@angular/material/select';

// ========== App Components / Utils ==========
import { ClientDetailsComponent } from './client-details/client-details.component';
import { ClientEditComponent } from './client-edit/client-edit.component';
import { isoFromName } from '../../utils/country.util';
import { setCookie, getCookieInt } from '../../utils/cookie.util';
import { exportClientsToXlsx } from '../../utils/export.util';
import { ClientUploadComponent } from './client-upload/client-upload.component';

// ===== Types =====
export interface Client {
  id: number;
  fullName: string;
  displayName: string;
  email: string;
  details: string;
  active: boolean;
  location: string;
  country: string;
}
interface ClientsResponse { clients: Client[]; }

type ClientEventMsg = {
  type: 'CREATED' | 'UPDATED' | 'DELETED';
  clientId?: number;
  displayName?: string;
  message?: string;
  at?: string;
};

// ===== Constants =====
const CLIENTS_API = 'http://localhost:8080/api/v1/clients';
const CLIENTS_EVENTS = 'http://localhost:8080/api/v1/clients/events';
const CLIENTS_COUNT_COOKIE = 'RABO_CLIENTS';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,

    // Material
    MatTableModule, MatSortModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule,
    MatIconModule, MatCheckboxModule, MatButtonModule,
    MatTooltipModule, MatDialogModule, MatSnackBarModule,
  ],
  providers: [
    { provide: MAT_SELECT_CONFIG, useValue: { overlayPanelClass: 'client-select-panel' } }
  ],
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css'],
})
export class ClientComponent implements OnInit, AfterViewInit, OnDestroy {
  // ===== Table config =====
  readonly displayedColumns = ['select', 'id', 'displayName', 'active', 'country', 'actions'] as const;
  readonly dataSource = new MatTableDataSource<Client>([]);
  readonly selection = new SelectionModel<Client>(true, []);

  // ===== Utils =====
  readonly iso = isoFromName;

  // ===== View queries (signals) =====
  readonly sort = viewChild(MatSort);
  readonly paginator = viewChild(MatPaginator);

  // ===== State (signals) =====
  readonly clientSearchQ = signal('');
  private readonly allClients = signal<Client[]>([]);
  private readonly filterText = signal('');

  // Derived state
  readonly totalClients = computed(() => this.allClients().length);
  private readonly filteredClients = computed(() => {
    const q = this.filterText().trim().toLowerCase();
    if (!q) return this.allClients();
    return this.allClients().filter(c =>
      `${c.id} ${c.fullName} ${c.displayName} ${c.email} ${c.details} ${c.country} ${c.active ? 'active' : 'inactive'}`
        .toLowerCase()
        .includes(q)
    );
  });

  // ===== Effects =====
  // Keep table rows in sync with the filtered list
  readonly syncTableEffect = effect(() => {
    this.dataSource.data = this.filteredClients();
  }, { allowSignalWrites: true });

  // Persist count to cookie (1 day)
  readonly cookieCountEffect = effect(() => {
    const count = this.totalClients();
    if (getCookieInt(CLIENTS_COUNT_COOKIE) !== count) {
      setCookie(CLIENTS_COUNT_COOKIE, String(count), 1);
    }
  });

  // Clamp paginator when data size changes
  readonly clampPaginatorEffect = effect(() => {
    const p = this.paginator();
    if (!p) return;
    const total = this.filteredClients().length;
    const maxIndex = Math.max(0, Math.ceil(total / p.pageSize) - 1);
    if (p.pageIndex > maxIndex) p.pageIndex = maxIndex;
  }, { allowSignalWrites: true });

  // ===== Realtime (SSE) =====
  private es?: EventSource;

  // ===== DI (inject() – idiomatic in v17) =====
  private readonly http = inject(HttpClient);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  private readonly zone = inject(NgZone);

  // ===== Lifecycle =====
  ngOnInit(): void {
    this.dataSource.sortingDataAccessor = (row, col) => this.sortAccessor(row, col);
    this.loadClients();
    this.connectToEvents();
  }

  ngAfterViewInit(): void {
    const sort = this.sort();
    if (sort) this.dataSource.sort = sort;

    const paginator = this.paginator();
    if (paginator) {
      this.dataSource.paginator = paginator;
      paginator.page.subscribe(() => this.removeSelectionOutsideCurrentPage());
    }
  }

  ngOnDestroy(): void {
    this.es?.close();
  }

  // ===== Helpers (tiny & readable) =====
  private showSnack(message: string, action = 'Refresh', duration = 4000): void {
    this.snack.open(message, action, { duration })
      .onAction().subscribe(() => this.loadClients({ keepPage: true }));
  }

  private refresh(opts: { keepPage?: boolean; goLast?: boolean } = {}): void {
    this.loadClients(opts);
  }

  // ===== Realtime SSE =====
  private connectToEvents(): void {
    const es = new EventSource(CLIENTS_EVENTS);

    const parse = (e: MessageEvent): ClientEventMsg | null => {
      try { return JSON.parse(e.data) as ClientEventMsg; } catch { return null; }
    };
    const run = (fn: () => void) => this.zone.run(fn);

    es.addEventListener('INIT', () => { /* connected */ });

    for (const name of ['CREATED', 'UPDATED', 'DELETED'] as const) {
      es.addEventListener(name, (e: MessageEvent) => {
        const ev = parse(e); if (!ev) return;
        run(() => this.handleEvent(ev));
      });
    }

    // Fallback if server ever sends unnamed events:
    es.onmessage = (e) => {
      const ev = parse(e); if (!ev) return;
      run(() => this.handleEvent(ev));
    };

    es.onerror = () => {
      es.close();
      // simple retry; keep it quiet
      setTimeout(() => this.connectToEvents(), 3000);
    };

    this.es = es;
  }

  private handleEvent(ev: ClientEventMsg): void {
    switch (ev.type) {
      case 'CREATED': {
        const name = ev.displayName ? `: ${ev.displayName}` : '';
        this.showSnack(`New client added${name}`, 'View');
        this.refresh({ goLast: true });
        break;
      }
      case 'UPDATED': {
        const name = ev.displayName ? `: ${ev.displayName}` : '';
        this.showSnack(`Client updated${name}`);
        this.refresh({ keepPage: true });
        break;
      }
      case 'DELETED': {
        const idPart = ev.clientId ? ` #${ev.clientId}` : '';
        this.showSnack(`Client deleted${idPart}`);
        this.refresh({ keepPage: true });
        break;
      }
    }
  }

  // ===== Data loading =====
  private loadClients(opts: { keepPage?: boolean; goLast?: boolean } = {}): void {
    const prevIndex = this.paginator()?.pageIndex ?? 0;

    this.http.get<ClientsResponse>(CLIENTS_API).subscribe({
      next: ({ clients }) => {
        this.allClients.set(clients ?? []);

        const p = this.paginator();
        if (!p) return;

        const len = this.filteredClients().length;
        const maxIndex = Math.max(0, Math.ceil(len / p.pageSize) - 1);

        if (opts.goLast) p.pageIndex = maxIndex;
        else if (opts.keepPage) p.pageIndex = Math.min(prevIndex, maxIndex);
        else p.pageIndex = 0;

        // Ensure table recalculates rendered slice after programmatic page changes.
        this.dataSource._updateChangeSubscription();
      },
      error: (err) => console.error('Failed to load clients', err),
    });
  }

  // ===== Sorting / Filtering / Selection helpers =====
  applyFilter(value: string): void {
    this.filterText.set((value || '').trim());
    this.removeSelectionOutsideFilter();
    this.paginator()?.firstPage();
  }

  private sortAccessor(row: Client, col: string): string | number {
    switch (col) {
      case 'displayName': return row.displayName?.toLowerCase() ?? '';
      case 'country': return row.country?.toLowerCase() ?? '';
      case 'active': return row.active ? 1 : 0;
      default: return (row as any)[col];
    }
  }

  getCurrentPageRows(): Client[] {
    const rows = this.dataSource.data;
    const p = this.paginator();
    if (!p) return rows;
    const start = p.pageIndex * p.pageSize;
    return rows.slice(start, start + p.pageSize);
  }

  private removeSelectionOutsideCurrentPage(): void {
    const idsOnPage = new Set(this.getCurrentPageRows().map(r => r.id));
    this.selection.selected.forEach(s => {
      if (!idsOnPage.has(s.id)) this.selection.deselect(s);
    });
  }

  private removeSelectionOutsideFilter(): void {
    const filteredIds = new Set(this.filteredClients().map(c => c.id));
    this.selection.selected.forEach(s => {
      if (!filteredIds.has(s.id)) this.selection.deselect(s);
    });
  }

  isAllSelected(): boolean {
    const rows = this.getCurrentPageRows();
    return rows.length > 0 && rows.every(r => this.selection.isSelected(r));
  }

  pageHasSelection(): boolean {
    return this.getCurrentPageRows().some(r => this.selection.isSelected(r));
  }

  masterToggle(): void {
    const rows = this.getCurrentPageRows();
    const allSelected = rows.length > 0 && rows.every(r => this.selection.isSelected(r));
    rows.forEach(r => allSelected ? this.selection.deselect(r) : this.selection.select(r));
  }

  // ===== Row actions (dialogs & CRUD) =====
  addClient(): void {
    this.blurActive();
    const ref = this.dialog.open(ClientEditComponent, {
      width: '720px',
      data: { isNew: true },
      disableClose: true,
      panelClass: 'client-edit-light',
      maxHeight: 'none',
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.refresh({ goLast: true });
    });
  }

  editClient(row: Client): void {
    const ref = this.dialog.open(ClientEditComponent, {
      width: '720px',
      data: row,
      disableClose: true,
      panelClass: 'client-edit-light',
      maxHeight: 'none',
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.refresh({ keepPage: true });
    });
  }

  openClientDetails(row: Client): void {
    this.dialog.open(ClientDetailsComponent, {
      data: row,
      width: '520px',
      autoFocus: false,
      panelClass: 'client-details-light',
    });
  }

  deleteSelectedClients(): void {
    const count = this.selection.selected.length;
    if (!count) return;

    const ok = confirm(count === 1 ? 'Delete the selected client?' : `Delete ${count} selected clients?`);
    if (!ok) return;

    const ids = this.selection.selected.map(c => c.id);
    this.http.delete<void>(CLIENTS_API, { body: { ids } }).subscribe({
      next: () => {
        this.selection.clear();
        this.refresh({ keepPage: true });
      },
      error: (err) => {
        console.error('Failed to delete clients', err);
        alert('Failed to delete clients. Please try again.');
      }
    });
  }

  bulkUpload(): void {
    this.blurActive();
    this.dialog.open(ClientUploadComponent, {
      width: '640px',
      disableClose: true,
      panelClass: 'client-edit-light'
    }).afterClosed().subscribe(ok => {
      if (ok) this.refresh({ goLast: true });
    });
  }

  // ===== Search trigger from template =====
  searchClient(): void {
    this.applyFilter(this.clientSearchQ());
    this.removeSelectionOutsideCurrentPage();
  }

  // ===== DOM nicety =====
  private blurActive(): void {
    (document.activeElement as HTMLElement | null)?.blur();
  }

  // ===== Export =====
  exportAllClients(): void {
    exportClientsToXlsx(this.allClients());
  }
}
