import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose process-specific values when more than one process is returned', () => {
    component.productionData = {
      ...component.productionData,
      numberofProcess: 2,
      p1_toxLoadActual: 5.229,
      p2_toxLoadActual: 13.878
    };

    expect(component.shouldShowSecondProcess()).toBeTrue();
    expect(component.getProcessDetailValue(2, 'toxLoadActual')).toBe(13.878);
  });
});
