import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestorForm } from './gestor-form';

describe('GestorForm', () => {
  let component: GestorForm;
  let fixture: ComponentFixture<GestorForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestorForm],
    }).compileComponents();

    fixture = TestBed.createComponent(GestorForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
