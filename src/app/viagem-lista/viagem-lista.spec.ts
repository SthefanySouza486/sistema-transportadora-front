import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViagemLista } from './viagem-lista';

describe('ViagemLista', () => {
  let component: ViagemLista;
  let fixture: ComponentFixture<ViagemLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViagemLista],
    }).compileComponents();

    fixture = TestBed.createComponent(ViagemLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
