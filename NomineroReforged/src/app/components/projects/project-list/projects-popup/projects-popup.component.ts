import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../../../services/auth.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProjectEmployeesComponent } from '../../project-employees/project-employees.component';
import { Client } from '../../../../models/client.model';
import { Department } from '../../../../models/department.model';
import { Type } from '../../../../models/types.model';
import { Project } from '../../../../models/proyect.model';

@Component({
  selector: 'app-projects-popup',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatTabsModule,
    ProjectEmployeesComponent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './projects-popup.component.html',
  styleUrl: './projects-popup.component.css',
})
export class ProjectsPopupComponent implements OnInit {
  projectForm!: FormGroup;
  rol: string = '';
  departments: Department[] = [];
  types: Type[] = [];
  clients: Client[] = [];

  ngOnInit(): void {
    this.rol = this.authService.getRoleFromToken()!;
    this.initForm();
    this.loadDropdopwns();
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public dialogRef: MatDialogRef<ProjectsPopupComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      project: Project | null;
      departments: Department[];
      clients: Client[];
      types: Type[];
    }
  ) {}

  loadDropdopwns() {
    this.departments = this.data.departments;
    this.clients = this.data.clients;
    this.types = this.data.types;
  }

  checkDepartment(){
    if(this.rol == 'Admin' && this.data.project){
      return this.authService.getDepartmentIdFromToken()
    }else if (this.data.project){
      return this.data.project.department
    }else{
      return ''
    }
  }

  initForm(): void {
    this.projectForm = this.fb.group({
      code: [
        this.data.project ? this.data.project!.code : '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(20),
        ],
      ],
      name: [
        this.data.project ? this.data.project!.name : '',
        [Validators.required, Validators.maxLength(50)],
      ],
      client: [ this.data.project ? this.data.project!.client : '', Validators.required],
      estimated: [ this.data.project ? this.data.project!.estimated : '', [Validators.required, Validators.maxLength(255)]],
      date_start: [ this.data.project ? this.data.project!.date_start : ''],
      date_end: [ this.data.project ? this.data.project!.date_end : ''],
      description: [ this.data.project ? this.data.project!.description : '', Validators.maxLength(255)],
      type: [ this.data.project ? this.data.project!.type : '', Validators.required],
      department: [
        this.checkDepartment(),
        Validators.required,
      ],
      is_active: [this.data.project ? this.data.project!.is_active : true]
    });
  }

  closeDialog(){
    this.dialogRef.close(this.projectForm.value);
  }
}
