import { TestBed } from '@angular/core/testing';

import { Despesa } from './despesa';

describe('Despesa', () => {
  let service: Despesa;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Despesa);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
