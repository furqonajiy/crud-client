// ========== Angular / CDK ==========
import {
  Component, OnInit, AfterViewInit,
  signal, computed, effect, viewChild
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
import { MAT_SELECT_CONFIG } from '@angular/material/select';

// ========== App Components / Utils ==========
import { ClientDetailsComponent } from './client-details/client-details.component';
import { ClientEditComponent } from './client-edit/client-edit.component';
import { isoFromName } from '../../utils/country.util';
import { setCookie, getCookieInt } from '../../utils/cookie.util';

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

// ===== Constants =====
const CLIENTS_API = 'http://localhost:8080/api/v1/clients';
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
    MatTooltipModule, MatDialogModule,
  ],
  providers: [
    { provide: MAT_SELECT_CONFIG, useValue: { overlayPanelClass: 'client-select-panel' } }
  ],
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css'],
})
export class ClientComponent implements OnInit, AfterViewInit {
  // ===== Table config =====
  readonly displayedColumns: string[] = ['select', 'id', 'displayName', 'active', 'country', 'actions'];
  readonly dataSource = new MatTableDataSource<Client>([]);
  readonly selection = new SelectionModel<Client>(true, []);

  // ===== Utils =====
  readonly iso = isoFromName;

  // ===== Search model (template binds to this) =====
  clientSearchQ: string = '';

  // ===== Signals =====
  /** View queries */
  readonly sort = viewChild(MatSort);
  readonly paginator = viewChild(MatPaginator);

  private readonly allClients = signal<Client[]>([]);
  private readonly filterText = signal('');

  /** Total clients (for cookies or badges) */
  readonly totalClients = computed(() => this.allClients().length);

  /** Client list filtered by `filterText` */
  private readonly filteredClients = computed(() => {
    const f = this.filterText().trim().toLowerCase();
    if (!f) return this.allClients();

    return this.allClients().filter(c =>
      `${c.id} ${c.fullName} ${c.displayName} ${c.email} ${c.details} ${c.country} ${c.active ? 'active' : 'inactive'}`
        .toLowerCase()
        .includes(f)
    );
  });

  // ===== Effects (react to signals, perform side-effects) =====
  /** Push filtered rows into the Material table whenever signals change */
  readonly syncTableEffect = effect(() => {
    this.dataSource.data = this.filteredClients();
  });

  /** Keep cookie with client count in sync (1-day expiry, only when changed) */
  readonly cookieCountEffect = effect(() => {
    const count = this.totalClients();
    if (getCookieInt(CLIENTS_COUNT_COOKIE) !== count) {
      setCookie(CLIENTS_COUNT_COOKIE, String(count), 1);
    }
  });

  /** Keep paginator on a valid page when data size changes */
  readonly clampPaginatorEffect = effect(() => {
    const p = this.paginator();
    if (!p) return;

    const totalRows = this.filteredClients().length;
    const maxIndex = Math.max(0, Math.ceil(totalRows / p.pageSize) - 1);
    if (p.pageIndex > maxIndex) p.pageIndex = maxIndex;
  });

  // ===== DI =====
  constructor(private dialog: MatDialog, private http: HttpClient) { }

  // ===== Lifecycle =====
  ngOnInit(): void {
    this.dataSource.sortingDataAccessor = (row, col) => this.sortAccessor(row, col);
    this.fetchClients();
  }

  ngAfterViewInit(): void {
    // Wire MatSort & MatPaginator once the view queries resolve
    const sort = this.sort();
    if (sort) this.dataSource.sort = sort;

    const paginator = this.paginator();
    if (paginator) {
      this.dataSource.paginator = paginator;
      paginator.page.subscribe(() => this.removeSelectionOutsideCurrentPage());
    }
  }

  // ===== Data loading =====
  private fetchClients(opts: { keepPage?: boolean; goLast?: boolean } = {}): void {
    const p0 = this.paginator();
    const prevIndex = p0 ? p0.pageIndex : 0;

    this.http.get<ClientsResponse>(CLIENTS_API).subscribe({
      next: ({ clients }) => {
        this.allClients.set(clients ?? []);

        const p = this.paginator();
        if (!p) return;

        const len = this.filteredClients().length;
        const maxIndex = Math.max(0, Math.ceil(len / p.pageSize) - 1);

        if (opts.goLast) {
          p.pageIndex = maxIndex;
        } else if (opts.keepPage) {
          p.pageIndex = Math.min(prevIndex, maxIndex);
        } else {
          p.pageIndex = 0;
        }

        // Force table to recalc its rendered slice
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
      if (!ok) return;
      this.fetchClients({ goLast: true });
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
      if (!ok) return;
      this.fetchClients({ keepPage: true });
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

    const ok = confirm(count === 1
      ? 'Delete the selected client?'
      : `Delete ${count} selected clients?`);
    if (!ok) return;

    const ids = this.selection.selected.map(c => c.id);

    this.http.delete<void>(CLIENTS_API, { body: { ids } }).subscribe({
      next: () => {
        this.selection.clear();
        // Other users may have modified the list — re-fetch from server.
        this.fetchClients({ keepPage: true });
      },
      error: (err) => {
        console.error('Failed to delete clients', err);
        alert('Failed to delete clients. Please try again.');
      }
    });
  }

  // ===== Search trigger from template =====
  searchClient(): void {
    this.applyFilter(this.clientSearchQ);
    this.removeSelectionOutsideCurrentPage();
  }

  // ===== DOM nicety =====
  private blurActive(): void {
    (document.activeElement as HTMLElement | null)?.blur();
  }
}
