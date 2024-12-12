import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../../services/projects.service';
import { Project } from '../../../models/proyect.model';
import { DepartmentService } from '../../../services/deparments.service';
import { ClientsService } from '../../../services/clients.service';
import { Department } from '../../../models/department.model';
import { Type } from '../../../models/types.model';
import { Client } from '../../../models/client.model';
import { SnackbarService } from '../../../snackbar/snackbar';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { TypesService } from '../../../services/type.service';
@Component({
  selector: 'app-project-list',
  standalone: true,
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
    MatSelectModule
  ],
  providers: [  
    provideNativeDateAdapter(),  
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css'],
})
export class ProjectListComponent implements OnInit {
  displayedColumns: string[] = [
    'code',
    'name',
    'client',
    'estimated',
    'date_start',
    'date_end',
    'actions',
  ];
  dataSource = new MatTableDataSource<Project>();
  projectForm!: FormGroup;
  selectedProject: Project | null = null;

  departments: Department[]=[];
  types: Type[]=[];
  clients: Client[]=[];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private deparmentService: DepartmentService,
    private clientService: ClientsService,
    private typesService: TypesService,
    private snackbar: SnackbarService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadClients();
    this.loadDepartments();
    this.loadProjects();
    this.loadTypes();

  }

  initForm(): void {
    this.projectForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(20)]],
      name: ['', [Validators.required, Validators.maxLength(50)]],
      client: ['', Validators.required],
      estimated: ['', [Validators.required, Validators.maxLength(255)]],
      date_start: [''],
      date_end: [''],
      description: ['', Validators.maxLength(255)],
      type: ['', Validators.required],
      department: ['', Validators.required],
    });
  }

  getDepartmentName(departmentId: number): string {
    const department = this.departments.find((d) => d.id === departmentId);
    return department ? department.name : '';
  }
  

  loadTypes(): void {
    this.typesService.getAllTypes().subscribe({
      next: (types: any) => {
        this.types = types.map((d: any) => ({
          id: d.id,
          name: d.name,
        }));
      },
      error: (err: any) => {
        this.snackbar.openSnackbar(
          'Error al cargar departamentos',
          'snackbar-danger',
          3000
        );

        console.error('Error loading departments:', err);
      },
    });
  }
  loadClients(): void {
    this.clientService.getAllClients().subscribe(
      (clients) => {
        this.clients = clients;
      },
      (error) => {
        console.error('Error al cargar usuarios:', error);
        this.snackbar.openSnackbar(
          'Error al cargar usuario',
          'snackbar-danger',
          3000
        );
      }
    );
  }
  loadDepartments(): void {
    this.deparmentService.getAllDepartments().subscribe({
      next: (departments: any) => {
        this.departments = departments.map((d: any) => ({
          id: d.id,
          name: d.name,
        }));
      },
      error: (err: any) => {
        this.snackbar.openSnackbar(
          'Error al cargar departamentos',
          'snackbar-danger',
          3000
        );

        console.error('Error loading departments:', err);
      },
    });
  }

 

  loadProjects(): void {
    this.projectService.getProjects().subscribe((projects) => {
      this.dataSource.data = projects;
      this.dataSource.paginator = this.paginator;
    });
  }

  selectProject(project: Project): void {
    console.log('Seleccionando proyecto:', project);
    console.log('Departamentos disponibles:', this.departments);
  
    this.selectedProject = project;
  
    if (this.departments.length === 0) {
      this.loadDepartments();
    }
  
    this.projectForm.patchValue({
      code: project.code,
      name: project.name,
      client: project.client,
      estimated: project.estimated,
      date_start: project.date_start,
      date_end: project.date_end,
      description: project.description,
      type: project.type,
      department: project.department, // Asegúrate de que este valor sea válido
    });
  }
  
  
  saveProject(): void {
    if (this.projectForm.valid) {
      const project = this.projectForm.value as Project;
      if (this.selectedProject) {
        // Update
        this.projectService
          .updateProject(this.selectedProject.id, project)
          .subscribe(() => {
            this.loadProjects();
            this.newForm();
          });
      } else {
        // Create
        this.projectService.createProject(project).subscribe(() => {
          this.loadProjects();
          this.newForm();
        });
      }
    }
  }

  deleteProject(projectId: number): void {
    if (confirm('Are you sure you want to delete this project?')) {
      this.projectService
        .deleteProject(projectId)
        .subscribe(() => this.loadProjects());
    }
  }

  newForm(): void {
    this.selectedProject = null;
    this.projectForm.reset();
  }
}
