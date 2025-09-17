import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { HeaderComponent } from './header.component';

describe('HeaderComponent (standalone)', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
        RouterTestingModule.withRoutes([]),
        NoopAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the header', () => {
    expect(component).toBeTruthy();
  });

  it('should render FirstNav and SecondNav', () => {
    const firstNav = fixture.debugElement.query(By.css('app-first-nav'));
    const secondNav = fixture.debugElement.query(By.css('app-second-nav'));

    expect(firstNav).withContext('Expected <app-first-nav> in template').not.toBeNull();
    expect(secondNav).withContext('Expected <app-second-nav> in template').not.toBeNull();
  });

  it('should place FirstNav before SecondNav', () => {
    const order = fixture.debugElement
      .queryAll(By.css('app-first-nav, app-second-nav'))
      .map(de => (de.nativeElement as Element).tagName.toLowerCase());

    expect(order).toEqual(['app-first-nav', 'app-second-nav']);
  });

  it('should be stable under change detection', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
