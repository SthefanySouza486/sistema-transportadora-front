import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagamentoForm } from './pagamento-form';

describe('PagamentoForm', () => {
  let component: PagamentoForm;
  let fixture: ComponentFixture<PagamentoForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagamentoForm],
    }).compileComponents();

    fixture = TestBed.createComponent(PagamentoForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
