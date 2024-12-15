import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignEmployeesComponent } from './asign-employees.component';

describe('AsignEmployeesComponent', () => {
  let component: AsignEmployeesComponent;
  let fixture: ComponentFixture<AsignEmployeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignEmployeesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsignEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
