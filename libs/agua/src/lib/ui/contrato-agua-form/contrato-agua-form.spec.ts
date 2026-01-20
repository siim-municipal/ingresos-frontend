import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContratoAguaForm } from './contrato-agua-form';

describe('ContratoAguaForm', () => {
  let component: ContratoAguaForm;
  let fixture: ComponentFixture<ContratoAguaForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContratoAguaForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ContratoAguaForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
