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
import { SelectionModel } from '@angular/cdk/collections';

export interface Client {
  id: number;
  fullName: string;
  displayName: string;
  email: string;
  details: string;
  active: boolean;
  location: string;
}

const DATA: Client[] = [
  { id: 1,  fullName: 'Yolando Luczki', displayName: 'Ioni Bowcher',   email: 'yolando@acme.io',  details: 'VIP account. Likes monthly summary.', active: true,  location: 'France' },
  { id: 2,  fullName: 'Roxane Campain', displayName: 'Anna Fali',      email: 'roxane@acme.io',   details: 'Prefers email.',                       active: false, location: 'France' },
  { id: 3,  fullName: 'Penney Weight',  displayName: 'Amy Elsner',     email: 'penney@acme.io',   details: '—',                                     active: true,  location: 'South Africa' },
  { id: 4,  fullName: 'Nelida Sawchuk', displayName: 'Onyama Limba',   email: 'nelida@acme.io',   details: 'Key account',                           active: true,  location: 'South Africa' },
  { id: 5,  fullName: 'Micaela Rhymes', displayName: 'Asiya Javayant', email: 'micaela@acme.io',  details: '—',                                     active: true,  location: 'France' },
  { id: 6,  fullName: 'Melodie Knipp',  displayName: 'Asiya Javayant', email: 'melodie@acme.io',  details: '—',                                     active: true,  location: 'Finland' },
  { id: 7,  fullName: 'Layla Springe',  displayName: 'Ioni Bowcher',   email: 'layla@acme.io',    details: '—',                                     active: false, location: 'South Africa' },
  { id: 8,  fullName: 'Laticia Merced', displayName: 'Ivan Magalhaes', email: 'laticia@acme.io',  details: '—',                                     active: false, location: 'Burkina Faso' },
  { id: 9,  fullName: 'Hillary Skulski',displayName: 'Bernardo Dominic',email:'hillary@acme.io',  details: '—',                                     active: false, location: 'France' },
  { id:10,  fullName: 'Emerson Bowley', displayName: 'Stephen Shaw',   email: 'emerson@acme.io',  details: '—',                                     active: true,  location: 'Finland' },
];

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule, MatSortModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatIconModule,
    MatCheckboxModule, MatButtonModule, MatTooltipModule
  ],
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientComponent implements OnInit {
  displayedColumns = ['select', 'fullName', 'displayName', 'email', 'details', 'active', 'country', 'actions'];
  dataSource = new MatTableDataSource<Client>(DATA);
  selection = new SelectionModel<Client>(true, []);

  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  ngOnInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    this.dataSource.sortingDataAccessor = (row, col) => {
      switch (col) {
        case 'fullName': return row.fullName.toLowerCase();
        case 'displayName': return row.displayName.toLowerCase();
        case 'email': return row.email.toLowerCase();
        case 'details': return row.details?.toLowerCase() ?? '';
        case 'active': return row.active ? 1 : 0;
        case 'country': return row.location.toLowerCase();
        default: return (row as any)[col];
      }
    };

    this.dataSource.filterPredicate = (row, filter) => {
      const text = (row.fullName + ' ' + row.displayName + ' ' + row.email + ' ' +
                    row.details + ' ' + row.location + ' ' + (row.active ? 'active' : 'inactive')).toLowerCase();
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
}