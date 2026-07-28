import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotoristaForm } from './motorista-form';

describe('MotoristaForm', () => {
  let component: MotoristaForm;
  let fixture: ComponentFixture<MotoristaForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MotoristaForm],
    }).compileComponents();

    fixture = TestBed.createComponent(MotoristaForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
