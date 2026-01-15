import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContribuyenteSearch } from './contribuyente-search';

describe('ContribuyenteList', () => {
  let component: ContribuyenteSearch;
  let fixture: ComponentFixture<ContribuyenteSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContribuyenteSearch],
    }).compileComponents();

    fixture = TestBed.createComponent(ContribuyenteSearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
