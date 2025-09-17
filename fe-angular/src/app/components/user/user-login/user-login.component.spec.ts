import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { UserLoginComponent } from './user-login.component';

describe('UserLoginComponent (standalone)', () => {
  let fixture: ComponentFixture<UserLoginComponent>;
  let component: UserLoginComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        UserLoginComponent,
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});