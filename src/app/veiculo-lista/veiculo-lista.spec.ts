import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VeiculoLista } from './veiculo-lista';

describe('VeiculoLista', () => {
  let component: VeiculoLista;
  let fixture: ComponentFixture<VeiculoLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VeiculoLista],
    }).compileComponents();

    fixture = TestBed.createComponent(VeiculoLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
