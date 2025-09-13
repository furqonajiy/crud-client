// ========== Angular / CDK ==========
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
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
  deleting = false;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // ===== Utils =====
  readonly iso = isoFromName;

  private updateClientsCountCookie(): void {
    const total = this.dataSource.data.length;
    const prev = getCookieInt('RABO_CLIENTS');
    if (prev !== total) setCookie('RABO_CLIENTS', String(total), 1);
  }

  // inside your component class
  q: string = '';

  // ===== API =====
  private readonly API = 'http://localhost:8080/api/v1/clients';

  constructor(private dialog: MatDialog, private http: HttpClient) { }

  // ===== Lifecycle =====
  ngOnInit(): void {
    // Sorting & filtering logic (pure, readable helpers)
    this.dataSource.sortingDataAccessor = (row, col) => this.sortAccessor(row, col);
    this.dataSource.filterPredicate = (row, filter) => this.filterRow(row, filter);
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
        this.dataSource.data = res?.clients ?? [];

        if (!this.paginator) return;

        // compute max page index after refresh
        const total = (this.dataSource.filteredData.length || this.dataSource.data.length);
        const maxIndex = Math.max(0, Math.ceil(total / this.paginator.pageSize) - 1);

        if (goLast) {
          this.paginator.pageIndex = maxIndex;
        } else if (keepPage) {
          this.paginator.pageIndex = Math.min(prevIndex, maxIndex);
        } else {
          this.paginator.pageIndex = 0;
        }

        // trigger table to re-render the correct slice
        this.dataSource._updateChangeSubscription();
        this.updateClientsCountCookie();
      },
      error: (err) => console.error('Failed to load clients', err),
    });
  }

  // ===== Table helpers =====
  applyFilter(value: string): void {
    this.dataSource.filter = (value || '').trim().toLowerCase();
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

  private filterRow(row: Client, filter: string): boolean {
    const haystack = [
      row.id, row.fullName, row.displayName, row.email, row.details, row.country,
      row.active ? 'active' : 'inactive'
    ].join(' ').toLowerCase();
    return haystack.includes(filter);
  }

  private get renderedRows(): Client[] {
    const list = this.dataSource.filteredData.length ? this.dataSource.filteredData : this.dataSource.data;
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
