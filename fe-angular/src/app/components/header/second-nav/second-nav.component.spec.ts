import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { APP_BASE_HREF } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

import { SecondNavComponent } from './second-nav.component';

describe('SecondNavComponent (Option A href check)', () => {
  let fixture: ComponentFixture<SecondNavComponent>;
  let component: SecondNavComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SecondNavComponent,                 // standalone component
        RouterTestingModule.withRoutes([]), // provides RouterLink + sets href
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: '/' }],
    }).compileComponents();

    fixture = TestBed.createComponent(SecondNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the root container with .second-nav', () => {
    const root = fixture.debugElement.query(By.css('.second-nav'));
    expect(root).withContext('Missing .second-nav root container').not.toBeNull();
  });

  it('should render a logo link with aria-label "Rabobank Home"', () => {
    const logoLinkDe = fixture.debugElement.query(By.css('.logo a.logo-link'));
    expect(logoLinkDe).withContext('Missing .logo a.logo-link').not.toBeNull();
    const aria = (logoLinkDe.nativeElement as HTMLAnchorElement).getAttribute('aria-label');
    expect(aria).toBe('Rabobank Home');
  });

  it('logo link points to "/client" (href)', () => {
    const logoLinkDe = fixture.debugElement.query(By.css('.logo a.logo-link'));
    const href = (logoLinkDe.nativeElement as HTMLAnchorElement).getAttribute('href');
    expect(href).toBe('/client');
  });

  it('should render a logo <img> inside the logo link', () => {
    const imgDe = fixture.debugElement.query(By.css('.logo a.logo-link img'));
    expect(imgDe).withContext('Missing logo <img> element').not.toBeNull();

    const src = (imgDe.nativeElement as HTMLImageElement).getAttribute('src')
      ?? (imgDe.nativeElement as HTMLImageElement).src;
    expect(src).withContext('Logo <img> src should include "logo"').toContain('logo');
  });

  it('should be stable under change detection', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
