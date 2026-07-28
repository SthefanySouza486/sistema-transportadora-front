import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotoristaListaComponent } from './motorista-lista';

describe('MotoristaLista', () => {
  let component: MotoristaListaComponent;
  let fixture: ComponentFixture<MotoristaListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MotoristaListaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MotoristaListaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
