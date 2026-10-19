import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinhasViagens } from './minhas-viagens';

describe('MinhasViagens', () => {
  let component: MinhasViagens;
  let fixture: ComponentFixture<MinhasViagens>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinhasViagens],
    }).compileComponents();

    fixture = TestBed.createComponent(MinhasViagens);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
