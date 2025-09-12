import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
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
import { MAT_SELECT_CONFIG } from '@angular/material/select';
import { SelectionModel } from '@angular/cdk/collections';
import { ClientDetailsComponent } from './client-details/client-details.component';

export interface Client {
  id: number;
  fullName: string;
  displayName: string;
  email: string;
  details: string;
  active: boolean;
  country: string;
}

const DATA: Client[] = [
  { id: 1, fullName: 'Yolando Luczki', displayName: 'Ioni Bowcher', email: 'yolaasfasfsafsafasfasfndo@acme.io', details: 'VIP account. Likes monthly summary.', active: true, country: 'France' },
  { id: 2, fullName: 'Roxane Campain', displayName: 'Anna Fali', email: 'roxane@acme.io', details: 'Prefers email.', active: false, country: 'France' },
  { id: 3, fullName: 'Penney Weight', displayName: 'Amy Elsner', email: 'penney@acme.io', details: '—', active: true, country: 'South Africa' },
  { id: 4, fullName: 'Nelida Sawchuk', displayName: 'Onyama Limba', email: 'nelida@acme.io', details: 'Key account', active: true, country: 'South Africa' },
  { id: 5, fullName: 'Micaela Rhymes', displayName: 'Asiya Javayant', email: 'micaela@acme.io', details: '—', active: true, country: 'France' },
  { id: 6, fullName: 'Melodie Knipp', displayName: 'Asiya Javayant', email: 'melodie@acme.io', details: '—', active: true, country: 'Finland' },
  { id: 7, fullName: 'Layla Springe', displayName: 'Ioni Bowcher', email: 'layla@acme.io', details: '—', active: false, country: 'South Africa' },
  { id: 8, fullName: 'Laticia Merced', displayName: 'Ivan Magalhaes', email: 'laticia@acme.io', details: '—', active: false, country: 'Burkina Faso' },
  { id: 9, fullName: 'Hillary Skulski', displayName: 'Bernardo Dominic', email: 'hillary@acme.io', details: '—', active: false, country: 'France' },
  { id: 10, fullName: 'Emerson Bowley', displayName: 'Stephen Shaw', email: 'emerson@acme.io', details: '—', active: true, country: 'Finland' },
];

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule, MatSortModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatIconModule,
    MatCheckboxModule, MatButtonModule, MatTooltipModule,
    MatDialogModule,
  ],
  providers: [
    { provide: MAT_SELECT_CONFIG, useValue: { overlayPanelClass: 'client-select-panel' } }
  ],
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
  
})
export class ClientComponent implements OnInit {
  displayedColumns = ['select', 'displayName', 'active', 'country', 'actions'];
  dataSource = new MatTableDataSource<Client>(DATA);
  selection = new SelectionModel<Client>(true, []);

  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

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
  }

  applyFilter(value: string) {
    this.dataSource.filter = value;
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  // selection
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
    alert(`Edit: ${row.fullName} (${row.email})`);
  }

  // country → ISO2 for flag-icons
  iso(country: string): string {
    const map: Record<string, string> = {
      'France': 'fr', 'Finland': 'fi', 'South Africa': 'za', 'Burkina Faso': 'bf'
    };
    return map[country] ?? 'xx';
  }

  constructor(private dialog: MatDialog) { }
  openDetails(row: Client) {
    this.dialog.open(ClientDetailsComponent, {
      data: row,
      width: '520px',
      autoFocus: false,
      panelClass: 'client-details-light'
    });
  }
}