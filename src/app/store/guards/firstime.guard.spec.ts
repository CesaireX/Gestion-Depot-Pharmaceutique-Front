import { TestBed } from '@angular/core/testing';

import { FirstimeGuard } from './firstime.guard';

describe('FirstimeGuard', () => {
  let guard: FirstimeGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(FirstimeGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
