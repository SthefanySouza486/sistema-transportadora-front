import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DespesaLista } from './despesa-lista';

describe('DespesaLista', () => {
  let component: DespesaLista;
  let fixture: ComponentFixture<DespesaLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DespesaLista],
    }).compileComponents();

    fixture = TestBed.createComponent(DespesaLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
