// ========== Angular / CDK ==========
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SelectionModel } from '@angular/cdk/collections';

// ========== Angular Material ==========
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MAT_SELECT_CONFIG } from '@angular/material/select';

// ========== App Components / Utils ==========
import { ClientDetailsComponent } from './client-details/client-details.component';
import { ClientEditComponent } from './client-edit/client-edit.component';
import { isoFromName } from '../../utils/country.util';

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

    // Material
    MatTableModule, MatSortModule, MatPaginatorModule,
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

  // ===== API =====
  private readonly API = 'http://localhost:8080/api/v1/clients';

  constructor(private dialog: MatDialog, private http: HttpClient) { }

  // ----- Lifecycle -----
  ngOnInit(): void {
    // Sorting & filtering logic (pure, readable helpers)
    this.dataSource.sortingDataAccessor = (row, col) => this.sortAccessor(row, col);
    this.dataSource.filterPredicate = (row, filter) => this.filterRow(row, filter);
    this.loadClients();
  }

  ngAfterViewInit(): void {
    // Attach sort & paginator once the view is ready
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  // ----- Data load -----
  private loadClients(): void {
    this.http.get<ClientsResponse>(this.API).subscribe({
      next: (res) => {
        this.dataSource.data = res?.clients ?? [];
        this.paginator?.firstPage();
      },
      error: (err) => console.error('Failed to load clients', err),
    });
  }

  // ----- Table helpers -----
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
      row.fullName, row.displayName, row.email, row.details, row.country,
      row.active ? 'active' : 'inactive'
    ].join(' ').toLowerCase();
    return haystack.includes(filter);
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    // Use filteredData so "Select all" acts on the visible rows
    const numRows = this.dataSource.filteredData.length || this.dataSource.data.length;
    return numSelected === numRows && numRows > 0;
  }

  masterToggle(): void {
    const rows = this.dataSource.filteredData.length ? this.dataSource.filteredData : this.dataSource.data;
    this.isAllSelected() ? this.selection.clear() : rows.forEach(r => this.selection.select(r));
  }

  // ----- Row actions -----
  addClient(): void {
    const nextId = (this.dataSource.data.reduce((m, c) => Math.max(m, c.id), 0) || 0) + 1;
    const draft: Client = {
      id: nextId, fullName: '', displayName: '', email: '', details: '',
      active: false, location: '', country: ''
    };

    const ref = this.dialog.open(ClientEditComponent, {
      width: '720px',
      data: { ...draft, isNew: true },
      disableClose: true,
      panelClass: 'client-edit-light',
    });

    ref.afterClosed().subscribe((created?: Client) => {
      if (!created) return;
      this.dataSource.data = [...this.dataSource.data, created];
      this.paginator && setTimeout(() => this.paginator.lastPage());
    });
  }
  
  editClient(row: Client): void {
    const ref = this.dialog.open(ClientEditComponent, {
      width: '720px',
      data: row,
      disableClose: true,
      panelClass: 'client-edit-light',
    });

    ref.afterClosed().subscribe((updated?: Client) => {
      if (!updated) return;
      const copy = this.dataSource.data.slice();
      const i = copy.findIndex(c => c.id === updated.id);
      if (i > -1) {
        copy[i] = updated;
        this.dataSource.data = copy;
      }
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

    const ids = new Set(this.selection.selected.map(c => c.id));
    this.dataSource.data = this.dataSource.data.filter(c => !ids.has(c.id));
    this.selection.clear();

    // Keep paginator on a valid page
    const p = this.paginator;
    if (p && p.pageIndex > 0 && p.pageIndex >= p.getNumberOfPages()) p.previousPage();
  }

  // ----- Utils -----
  iso(country?: string): string {
    return isoFromName(country);
  }
}
