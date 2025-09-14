// ========== Angular / CDK ==========
import { Component, OnInit, AfterViewInit, ViewChild, signal, computed, effect } from '@angular/core';
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

// ===== Component =====
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

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // ===== Utils =====
  readonly iso = isoFromName;

  // ===== Signals =====
  private readonly clients = signal<Client[]>([]);
  private readonly filterQ = signal('');
  readonly total = computed(() => this.clients().length);

  private readonly visible = computed(() => {
    const f = this.filterQ().trim().toLowerCase();
    if (!f) return this.clients();
    return this.clients().filter(c => (
      `${c.id} ${c.fullName} ${c.displayName} ${c.email} ${c.details} ${c.country} ${c.active ? 'active' : 'inactive'}`
    ).toLowerCase().includes(f));
  });

  /** Sync the computed rows into the Material table */
  readonly _syncTableEffect = effect(() => {
    this.dataSource.data = this.visible();
  });

  /** Keep cookie RABO_CLIENTS in sync with the total */
  readonly _cookieEffect = effect(() => {
    const count = this.total();
    const prev = getCookieInt('RABO_CLIENTS');
    if (prev !== count) setCookie('RABO_CLIENTS', String(count), 1);
  });

  // ===== Search =====
  q: string = '';

  /** Clamp paginator when filtered data shrinks or grows */
  readonly _clampPageEffect = effect(() => {
    const p = this.paginator;
    if (!p) return;
    const len = this.visible().length;
    const maxIndex = Math.max(0, Math.ceil(len / p.pageSize) - 1);
    if (p.pageIndex > maxIndex) p.pageIndex = maxIndex;
  });

  // ===== API =====
  private readonly API = 'http://localhost:8080/api/v1/clients';

  constructor(private dialog: MatDialog, private http: HttpClient) { }

  // ===== Lifecycle =====
  ngOnInit(): void {
    // Sorting & filtering logic (pure, readable helpers)
    this.dataSource.sortingDataAccessor = (row, col) => this.sortAccessor(row, col);
    this.loadClients();
  }

  private pruneSelectionToRendered(): void {
    const keep = new Set(this.renderedRows.map(r => r.id));
    this.selection.selected.forEach(s => { if (!keep.has(s.id)) this.selection.deselect(s); });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    this.paginator.page.subscribe(() => this.pruneSelectionToRendered());
  }

  // ===== Data load =====
  private loadClients(opts?: { keepPage?: boolean; goLast?: boolean }): void {
    const keepPage = !!opts?.keepPage;
    const goLast = !!opts?.goLast;

    // remember current page before data changes
    const prevIndex = this.paginator ? this.paginator.pageIndex : 0;

    this.http.get<ClientsResponse>(this.API).subscribe({
      next: (res) => {
        this.clients.set(res?.clients ?? []);

        // Page bookkeeping after new data lands
        const p = this.paginator;
        if (!p) return;
        const len = this.visible().length;
        const maxIndex = Math.max(0, Math.ceil(len / p.pageSize) - 1);
        p.pageIndex = goLast ? maxIndex : keepPage ? Math.min(prevIndex, maxIndex) : 0;

        // trigger table to re-render the correct slice
        this.dataSource._updateChangeSubscription();
      },
      error: (err) => console.error('Failed to load clients', err),
    });
  }

  // ===== Table helpers =====
  applyFilter(value: string): void {
    this.filterQ.set((value || '').trim());
    this.paginator?.firstPage();
  }

  private sortAccessor(row: Client, col: string): string | number {
    switch (col) {
      case 'displayName': return row.displayName?.toLowerCase() ?? '';
      case 'country': return row.country?.toLowerCase() ?? '';
      case 'active': return row.active ? 1 : 0;
      default: return (row as any)[col];
    }
  }

  private get renderedRows(): Client[] {
    const list = this.dataSource.data;
    if (!this.paginator) return list;
    const start = this.paginator.pageIndex * this.paginator.pageSize;
    return list.slice(start, start + this.paginator.pageSize);
  }

  isAllSelected(): boolean {
    const rows = this.renderedRows;
    return rows.length > 0 && rows.every(r => this.selection.isSelected(r));
  }

  pageHasSelection(): boolean {
    return this.renderedRows.some(r => this.selection.isSelected(r));
  }

  masterToggle(): void {
    const rows = this.renderedRows;
    const allSelected = rows.length > 0 && rows.every(r => this.selection.isSelected(r));
    rows.forEach(r => allSelected ? this.selection.deselect(r) : this.selection.select(r));
  }

  // ===== Row actions =====
  addClient(): void {
    this.blurActive();

    const ref = this.dialog.open(ClientEditComponent, {
      width: '720px',
      data: { isNew: true },
      disableClose: true,
      panelClass: 'client-edit-light',
      maxHeight: 'none',
    });

    ref.afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.loadClients({ goLast: true });
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

    ref.afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.loadClients({ keepPage: true });
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

    this.http.delete<void>(this.API, { body: { ids } }).subscribe({
      next: () => {
        this.selection.clear();
        this.loadClients({ keepPage: true });
      },
      error: (err) => {
        console.error('Failed to delete clients', err);
        alert('Failed to delete clients. Please try again.');
      }
    });
  }

  onSearch(): void {
    this.applyFilter(this.q);
    this.pruneSelectionToRendered();
  }

  private blurActive(): void {
    (document.activeElement as HTMLElement | null)?.blur();
  }
}