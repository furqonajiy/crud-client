import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatOptionModule } from '@angular/material/core';
import { MAT_SELECT_CONFIG } from '@angular/material/select';
import { SelectionModel } from '@angular/cdk/collections';
import { ClientDetailsComponent } from './client-details/client-details.component';
import { ClientEditComponent } from './client-edit/client-edit.component';
import { isoFromName } from '../../utils/country.util';
import { HttpClient, HttpClientModule } from '@angular/common/http';

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

interface ClientsResponse {
  clients: Client[];
}

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule, MatSortModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatIconModule,
    MatCheckboxModule, MatButtonModule, MatTooltipModule,
    MatDialogModule, MatOptionModule, HttpClientModule
  ],
  providers: [
    { provide: MAT_SELECT_CONFIG, useValue: { overlayPanelClass: 'client-select-panel' } }
  ],
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']

})
export class ClientComponent implements OnInit {
  displayedColumns = ['select', 'displayName', 'active', 'country', 'actions'];
  dataSource = new MatTableDataSource<Client>();
  selection = new SelectionModel<Client>(true, []);

  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  private readonly API = 'http://localhost:8080/api/v1/clients';

  constructor(private dialog: MatDialog, private http: HttpClient) {}

  ngOnInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    this.dataSource.sortingDataAccessor = (row, col) => {
      switch (col) {
        case 'displayName': return row.displayName.toLowerCase();
        case 'active': return row.active ? 1 : 0;
        case 'country': return row.country.toLowerCase();
        default: return (row as any)[col];
      }
    };

    this.dataSource.filterPredicate = (row, filter) => {
      const text = (row.fullName + ' ' + row.displayName + ' ' + row.email + ' ' +
        row.details + ' ' + row.country + ' ' + (row.active ? 'active' : 'inactive')).toLowerCase();
      return text.includes(filter.trim().toLowerCase());
    };

    this.loadClients();
  }

  private loadClients(): void {
    this.http.get<ClientsResponse>(this.API).subscribe({
      next: (res) => {
        // If backend sends extra fields (e.g., location), TS will ignore them (structural typing)
        this.dataSource.data = res?.clients ?? [];
        // Keep paginator in a valid page after refresh
        if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
      },
      error: (err) => {
        console.error('Failed to load clients', err);
        // optional: show a toast/snackbar here
      }
    });
  }

  applyFilter(value: string) {
    this.dataSource.filter = value;
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach(r => this.selection.select(r));
  }

  edit(row: Client) {
    const ref = this.dialog.open(ClientEditComponent, {
      width: '720px',
      data: row,
      disableClose: true,
      panelClass: 'client-edit-light'
    });

    ref.afterClosed().subscribe((updated?: Client) => {
      if (!updated) return;
      // Replace the row in the data source
      const copy = this.dataSource.data.slice();
      const i = copy.findIndex(c => c.id === updated.id);
      if (i > -1) {
        copy[i] = updated;
        this.dataSource.data = copy;
      }
    });
  }

  // country → ISO2 for flag-icons
  iso(country?: string): string {
    return isoFromName(country);
  }

  openDetails(row: Client) {
    this.dialog.open(ClientDetailsComponent, {
      data: row,
      width: '520px',
      autoFocus: false,
      panelClass: 'client-details-light'
    });
  }

  addClient() {
    const nextId =
      (this.dataSource.data.reduce((m, c) => Math.max(m, c.id), 0) || 0) + 1;

    const draft: Client = {
      id: nextId,
      fullName: '',
      displayName: '',
      email: '',
      details: '',
      active: false,
      location: '',
      country: ''
    };

    const ref = this.dialog.open(ClientEditComponent, {
      width: '720px',
      data: { ...draft, isNew: true },
      disableClose: true,
      panelClass: 'client-edit-light'
    });

    ref.afterClosed().subscribe((created?: Client) => {
      if (!created) return;
      // append the new row
      this.dataSource.data = [...this.dataSource.data, created];
      // optional: jump to last page if paginator exists
      if (this.dataSource.paginator) {
        const p = this.dataSource.paginator;
        setTimeout(() => p.lastPage());
      }
    });
  }


  deleteSelected() {
    const count = this.selection.selected.length;
    if (count === 0) return;

    const ok = confirm(count === 1
      ? 'Delete the selected client?'
      : `Delete ${count} selected clients?`);
    if (!ok) return;

    const toDelete = new Set(this.selection.selected.map(c => c.id));
    this.dataSource.data = this.dataSource.data.filter(c => !toDelete.has(c.id));
    this.selection.clear();

    if (this.paginator && this.paginator.pageIndex > 0 && this.paginator.pageIndex >= this.paginator.getNumberOfPages()) {
      this.paginator.previousPage();
    }
  }

}