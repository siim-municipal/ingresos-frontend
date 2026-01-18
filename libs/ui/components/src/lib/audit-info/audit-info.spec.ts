import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuditInfo } from './audit-info';

describe('AuditInfo', () => {
  let component: AuditInfo;
  let fixture: ComponentFixture<AuditInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditInfo],
    }).compileComponents();

    fixture = TestBed.createComponent(AuditInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
