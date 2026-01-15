import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContribuyenteDetail } from './contribuyente-detail';

describe('ContribuyenteDetail', () => {
  let component: ContribuyenteDetail;
  let fixture: ComponentFixture<ContribuyenteDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContribuyenteDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(ContribuyenteDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
