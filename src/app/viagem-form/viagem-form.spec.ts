import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViagemForm } from './viagem-form';

describe('ViagemForm', () => {
  let component: ViagemForm;
  let fixture: ComponentFixture<ViagemForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViagemForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ViagemForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
