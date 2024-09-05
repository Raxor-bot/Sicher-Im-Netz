import { TestBed } from '@angular/core/testing';

import { CourseAuthService } from './course-auth.service';

describe('CourseAuthService', () => {
  let service: CourseAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CourseAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
