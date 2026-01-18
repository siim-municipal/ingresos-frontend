import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleAdeudo } from './detalle-adeudo';

describe('DetalleAdeudo', () => {
  let component: DetalleAdeudo;
  let fixture: ComponentFixture<DetalleAdeudo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleAdeudo],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleAdeudo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
