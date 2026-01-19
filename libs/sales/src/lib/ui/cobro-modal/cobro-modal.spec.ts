import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CobroModal } from './cobro-modal';

describe('CobroModal', () => {
  let component: CobroModal;
  let fixture: ComponentFixture<CobroModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CobroModal],
    }).compileComponents();

    fixture = TestBed.createComponent(CobroModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
