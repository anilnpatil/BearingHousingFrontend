import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewGraphicalReport } from './view-graphical-report';

describe('ViewGraphicalReport', () => {
  let component: ViewGraphicalReport;
  let fixture: ComponentFixture<ViewGraphicalReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewGraphicalReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewGraphicalReport);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
