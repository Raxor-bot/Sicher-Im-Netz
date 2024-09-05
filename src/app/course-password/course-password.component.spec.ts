import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursePasswordComponent } from './course-password.component';

describe('CoursePasswordComponent', () => {
  let component: CoursePasswordComponent;
  let fixture: ComponentFixture<CoursePasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursePasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoursePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
