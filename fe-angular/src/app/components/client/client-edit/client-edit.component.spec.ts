// client-edit.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ClientEditComponent } from './client-edit.component';
import { isoFromName } from '../../../utils/country.util';

type Client = {
  id: number;
  fullName: string;
  displayName: string;
  email: string;
  details: string;
  active: boolean;
  location: string;
  country: string;
};

describe('ClientEditComponent (standalone)', () => {
  let fixture: ComponentFixture<ClientEditComponent>;
  let component: ClientEditComponent;
  let httpMock: HttpTestingController;

  const API = 'http://localhost:8080/api/v1/clients';

  const dialogRefSpy = jasmine.createSpyObj<MatDialogRef<ClientEditComponent, Client>>('MatDialogRef', ['close']);
  const snackSpy = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);

  const dialogData = {
    id: 42,
    isNew: false,
    fullName: 'Jane Doe',
    displayName: 'Jane',
    email: 'jane.doe@example.com',
    details: 'VIP',
    active: true,
    location: 'Amsterdam',
    country: 'Netherlands',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ClientEditComponent,
        HttpClientTestingModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MatSnackBar, useValue: snackSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientEditComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    dialogRefSpy.close.calls.reset();
    snackSpy.open.calls.reset();
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose iso util', () => {
    expect(component.iso).toBe(isoFromName);
  });

  it('should initialize form controls from MAT_DIALOG_DATA', () => {
    const v = component.form.getRawValue();
    expect(v.fullName).toBe(dialogData.fullName);
    expect(v.displayName).toBe(dialogData.displayName);
    expect(v.email).toBe(dialogData.email);
    expect(v.details).toBe(dialogData.details);
    expect(v.active).toBe(dialogData.active);
    expect(v.location).toBe(dialogData.location);
    expect(v.country).toBe(dialogData.country);
  });

  it('getError: returns empty string for untouched/valid controls', () => {
    expect(component.getError('fullName')).toBe('');
    component.form.get('fullName')!.markAsTouched();
    expect(component.getError('fullName')).toBe('');
  });

  it('getError: required and email format and maxlength messages', () => {
    const country = component.form.get('country')!;
    country.setValue(''); country.markAsTouched();
    expect(component.getError('country')).toBe('Country is required');

    const email = component.form.get('email')!;
    email.setValue('not-an-email'); email.markAsTouched();
    expect(component.getError('email')).toBe('Enter a valid email');

    const displayName = component.form.get('displayName')!;
    displayName.setValue('x'.repeat(31)); displayName.markAsTouched();
    expect(component.getError('displayName')).toBe('Max 30 characters');

    const location = component.form.get('location')!;
    location.setValue('y'.repeat(121)); location.markAsTouched();
    expect(component.getError('location')).toBe('Max 120 characters');
  });

  it('onFieldChange: updates tooltip message and shows/hides accordingly', () => {
    const tip = { message: '', show: jasmine.createSpy('show'), hide: jasmine.createSpy('hide') } as any;

    const fullName = component.form.get('fullName')!;
    fullName.setValue(''); fullName.markAsTouched();

    component.onFieldChange('fullName', tip);
    expect(tip.message).toBe('Full name is required');
    expect(tip.show).toHaveBeenCalled();

    fullName.setValue('Alice');
    component.onFieldChange('fullName', tip);
    expect(tip.message).toBe('');
    expect(tip.hide).toHaveBeenCalled();
  });

  it('save(): invalid form marks all as touched and makes no HTTP call', () => {
    const spy = spyOn(component.form, 'markAllAsTouched').and.callThrough();

    component.form.get('fullName')!.setValue('');
    component.form.get('displayName')!.setValue('');
    component.form.get('email')!.setValue('');
    component.form.get('country')!.setValue('');

    component.save();

    expect(spy).toHaveBeenCalled();
    httpMock.expectNone(API);
    expect(dialogRefSpy.close).not.toHaveBeenCalled();
    expect(snackSpy.open).not.toHaveBeenCalled();
    expect(component.submitting).toBeFalse();
  });
});
