import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestorLista } from './gestor-lista';

describe('GestorLista', () => {
  let component: GestorLista;
  let fixture: ComponentFixture<GestorLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestorLista],
    }).compileComponents();

    fixture = TestBed.createComponent(GestorLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
