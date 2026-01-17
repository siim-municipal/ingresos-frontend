import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PredioList } from './predio-list';

describe('PredioList', () => {
  let component: PredioList;
  let fixture: ComponentFixture<PredioList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PredioList],
    }).compileComponents();

    fixture = TestBed.createComponent(PredioList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
