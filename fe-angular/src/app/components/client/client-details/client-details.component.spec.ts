import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ClientDetailsComponent } from './client-details.component';
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

describe('ClientDetailsComponent (standalone)', () => {
  let fixture: ComponentFixture<ClientDetailsComponent>;
  let component: ClientDetailsComponent;

  const dialogData: Client = {
    id: 42,
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
      imports: [ClientDetailsComponent, NoopAnimationsModule],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: dialogData }],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the injected MAT_DIALOG_DATA via `data`', () => {
    expect(component.data).toEqual(dialogData as any);
  });

  it('should expose isoFromName via `iso`', () => {
    expect(component.iso).toBe(isoFromName);
  });

  it('`iso` should convert known country names to lowercase ISO2', () => {
    expect(component.iso('Netherlands')).toBe('nl');
    expect(component.iso('Germany')).toBe('de');
  });

  it('`iso` should return empty string for unknown country names', () => {
    expect(component.iso('NotARealCountry')).toBe('');
  });

  it('should run change detection without errors', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});