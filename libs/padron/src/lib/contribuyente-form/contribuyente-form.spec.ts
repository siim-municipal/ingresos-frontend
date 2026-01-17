import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContribuyenteForm } from '../contribuyente-form';

describe('ContribuyenteForm', () => {
  let component: ContribuyenteForm;
  let fixture: ComponentFixture<ContribuyenteForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContribuyenteForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ContribuyenteForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
