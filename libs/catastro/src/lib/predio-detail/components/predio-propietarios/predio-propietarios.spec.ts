import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PredioPropietarios } from '../predio-propietarios';

describe('PredioPropietarios', () => {
  let component: PredioPropietarios;
  let fixture: ComponentFixture<PredioPropietarios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PredioPropietarios],
    }).compileComponents();

    fixture = TestBed.createComponent(PredioPropietarios);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
