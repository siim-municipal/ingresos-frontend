import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CajaDashboard } from './caja-dashboard';

describe('CajaDashboard', () => {
  let component: CajaDashboard;
  let fixture: ComponentFixture<CajaDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CajaDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(CajaDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
