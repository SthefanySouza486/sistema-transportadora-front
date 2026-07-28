import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VeiculoForm } from './veiculo-form';

describe('VeiculoForm', () => {
  let component: VeiculoForm;
  let fixture: ComponentFixture<VeiculoForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VeiculoForm],
    }).compileComponents();

    fixture = TestBed.createComponent(VeiculoForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
