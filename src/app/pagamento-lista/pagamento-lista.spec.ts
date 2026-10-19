import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagamentoLista } from './pagamento-lista';

describe('PagamentoLista', () => {
  let component: PagamentoLista;
  let fixture: ComponentFixture<PagamentoLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagamentoLista],
    }).compileComponents();

    fixture = TestBed.createComponent(PagamentoLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
