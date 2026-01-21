import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PredioSearch } from './predio-search';

describe('PredioSearch', () => {
  let component: PredioSearch;
  let fixture: ComponentFixture<PredioSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PredioSearch],
    }).compileComponents();

    fixture = TestBed.createComponent(PredioSearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
