import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContratoAguaList } from './contrato-agua-list';

describe('ContratoAguaList', () => {
  let component: ContratoAguaList;
  let fixture: ComponentFixture<ContratoAguaList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContratoAguaList],
    }).compileComponents();

    fixture = TestBed.createComponent(ContratoAguaList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
