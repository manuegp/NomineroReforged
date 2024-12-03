import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentsPopupComponent } from './departments-popup.component';

describe('DepartmentsPopupComponent', () => {
  let component: DepartmentsPopupComponent;
  let fixture: ComponentFixture<DepartmentsPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentsPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
