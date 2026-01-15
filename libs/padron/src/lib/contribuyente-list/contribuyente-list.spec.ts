import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContribuyenteList } from '../contribuyente-list';

describe('ContribuyenteList', () => {
  let component: ContribuyenteList;
  let fixture: ComponentFixture<ContribuyenteList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContribuyenteList],
    }).compileComponents();

    fixture = TestBed.createComponent(ContribuyenteList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
