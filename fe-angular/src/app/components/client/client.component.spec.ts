// src/app/components/client/client.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, Subject } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ClientComponent, Client } from './client.component';
import * as exportUtil from '../../utils/export.util';

const CLIENTS_API = 'http://localhost:8080/api/v1/clients';
const COOKIE_NAME = 'RABO_CLIENTS';

function clearCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}
function getCookieRaw(name: string): string | null {
  const m = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[2]) : null;
}

function overrideExportFn<T extends object, K extends keyof T>(obj: T, key: K) {
  const desc = Object.getOwnPropertyDescriptor(obj, key);
  const spy = jasmine.createSpy(String(key));
  if (!desc || desc.configurable) {
    Object.defineProperty(obj, key, { value: spy, configurable: true });
    return { spy, restore: () => { if (desc) Object.defineProperty(obj, key, desc); } };
  }
  return { spy, restore: () => { } };
}

describe('ClientComponent (standalone)', () => {
  let fixture: ComponentFixture<ClientComponent>;
  let component: ClientComponent;
  let httpMock: HttpTestingController;

  let dialogOpen$: Subject<any>;
  const dialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
  const snackSpy = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);

  let exportOverride: { spy: jasmine.Spy, restore: () => void };

  const clients: Client[] = [
    { id: 1, fullName: 'John Doe', displayName: 'John', email: 'john@x.com', details: '', active: true, location: 'AMS', country: 'Netherlands' },
    { id: 2, fullName: 'Jane Roe', displayName: 'Jane', email: 'jane@x.com', details: '', active: false, location: 'RTM', country: 'Germany' },
    { id: 3, fullName: 'Mary Major', displayName: 'Mary', email: 'mary@x.com', details: '', active: true, location: 'UTR', country: 'Netherlands' },
  ];

  function flushInitialLoad(data: Client[] = clients) {
    const pending = httpMock.match(CLIENTS_API);
    if (pending.length) {
      pending[0].flush({ clients: data });
    } else {
      // If the component didn’t issue an initial GET (defensive), seed state.
      (component as any).allClients.set(data);
      (component as any).dataSource.data = data;
    }
  }

  const realEventSource = (window as any).EventSource;

  beforeEach(async () => {
    clearCookie(COOKIE_NAME);

    (window as any).EventSource = class {
      onmessage: any; onerror: any;
      addEventListener() { }
      close() { }
    };

    dialogOpen$ = new Subject<any>();
    dialogSpy.open.calls.reset();
    dialogSpy.open.and.returnValue({ afterClosed: () => dialogOpen$.asObservable() } as any);

    snackSpy.open.and.callFake((_m: string, _a?: string, _c?: any) => ({ onAction: () => of() } as any));

    await TestBed.configureTestingModule({
      imports: [
        ClientComponent,
        HttpClientTestingModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatSnackBar, useValue: snackSpy },
      ]
    }).compileComponents();

    exportOverride = overrideExportFn(exportUtil as any, 'exportClientsToXlsx' as any);

    fixture = TestBed.createComponent(ClientComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();    // ngOnInit
    flushInitialLoad();         // satisfy initial load if requested
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    clearCookie(COOKIE_NAME);
    exportOverride?.restore();
    dialogOpen$.complete();
  });

  afterAll(() => {
    (window as any).EventSource = realEventSource;
  });

  it('should create and load clients, and set cookie with total count', () => {
    expect(component).toBeTruthy();
    expect(component['dataSource'].data.length).toBe(3);
    expect(getCookieRaw(COOKIE_NAME)).toBe('3');
  });

  it('getCurrentPageRows returns all rows when no paginator', () => {
    expect(component.getCurrentPageRows().length).toBe(3);
  });

  it('selection helpers + masterToggle work without paginator', () => {
    const sel = component['selection'];
    sel.clear();

    expect(component.isAllSelected()).toBeFalse();
    expect(component.pageHasSelection()).toBeFalse();

    component.masterToggle();
    expect(sel.selected.length).toBe(3);
    expect(component.isAllSelected()).toBeTrue();
    expect(component.pageHasSelection()).toBeTrue();

    component.masterToggle();
    expect(sel.selected.length).toBe(0);
    expect(component.isAllSelected()).toBeFalse();
  });

  describe('deleteSelectedClients', () => {
    let confirmSpy: jasmine.Spy<(msg?: string) => boolean>;
    let alertSpy: jasmine.Spy<(msg?: string) => void>;

    beforeEach(() => {
      confirmSpy = spyOn(window, 'confirm').and.returnValue(false);
      alertSpy = spyOn(window, 'alert').and.stub();
    });

    it('does nothing when no selection', () => {
      component.deleteSelectedClients();
      httpMock.expectNone(CLIENTS_API);
      expect(confirmSpy).not.toHaveBeenCalled();
    });

    it('cancels when confirm returns false', () => {
      component['selection'].select(clients[0]);
      component.deleteSelectedClients();
      expect(confirmSpy).toHaveBeenCalled();
      httpMock.expectNone(CLIENTS_API);
    });
  });
});
