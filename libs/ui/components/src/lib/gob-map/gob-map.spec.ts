import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GobMap } from './gob-map';

describe('GobMap', () => {
  let component: GobMap;
  let fixture: ComponentFixture<GobMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GobMap],
    }).compileComponents();

    fixture = TestBed.createComponent(GobMap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
