import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatPaginator,
  MatPaginatorIntl,
  MatPaginatorModule,
} from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule, formatDate } from '@angular/common';
import { ProjectService } from '../../../services/projects.service';
import { Project } from '../../../models/proyect.model';
import { DepartmentService } from '../../../services/deparments.service';
import { ClientsService } from '../../../services/clients.service';
import { Department } from '../../../models/department.model';
import { Type } from '../../../models/types.model';
import { Client } from '../../../models/client.model';
import { SnackbarService } from '../../../snackbar/snackbar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MatNativeDateModule,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { TypesService } from '../../../services/type.service';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../../services/auth.service';
import { ProjectsPopupComponent } from './projects-popup/projects-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  MatSlideToggleChange,
  MatSlideToggleModule,
} from '@angular/material/slide-toggle';
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
    MatSelectModule,
    MatTabsModule,
    MatTooltipModule,
    MatSlideToggleModule,
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
    'is_active',
  ];
  dataSource = new MatTableDataSource<Project>();
  projectForm!: FormGroup;
  selectedProject: Project | null = null;
  rol: string = '';
  departments: Department[] = [];
  types: Type[] = [];
  clients: Client[] = [];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(
    private projectService: ProjectService,
    private deparmentService: DepartmentService,
    private clientService: ClientsService,
    private typesService: TypesService,
    private authService: AuthService,
    private snackbar: SnackbarService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.rol = this.authService.getRoleFromToken()!;
    this.paginator._intl.itemsPerPageLabel = 'Registros por pagina';
    this.loadClients();
    if (this.rol == 'Superadmin') {
      this.loadDepartments();
    }
    this.loadProjects();
    this.loadTypes();
  }

  getDepartmentName(departmentId: number): string {
    const department = this.departments.find((d) => d.id === departmentId);
    return department ? department.name : '';
  }

  getClientName(clientId: number): string {
    const client = this.clients.find((d) => d.id === clientId);
    return client ? client.name : '';
  }

  /**
   * Formatea una fecha al formato dd-MM-yyyy.
   * @param date Fecha en string o Date.
   * @returns Fecha formateada como string.
   */
  getFormattedDate(date: string | Date): string {
    if (!date) return ''; // Si la fecha está vacía, retorna cadena vacía
    const parsedDate = typeof date === 'string' ? new Date(date) : date; // Asegúrate de convertir el string a Date si es necesario
    return formatDate(parsedDate, 'dd-MM-yyyy', 'en-US'); // Formato usando Angular's formatDate
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

  // selectProject(project: Project): void {
  //   console.log('Seleccionando proyecto:', project);
  //   console.log('Departamentos disponibles:', this.departments);

  //   this.selectedProject = project;

  //   if (this.departments.length === 0) {
  //     this.loadDepartments();
  //   }

  //   this.projectForm.patchValue({
  //     code: project.code,
  //     name: project.name,
  //     client: project.client,
  //     estimated: project.estimated,
  //     date_start: project.date_start,
  //     date_end: project.date_end,
  //     description: project.description,
  //     type: project.type,
  //     department: project.department, // Asegúrate de que este valor sea válido
  //   });
  // }

  deleteProject(projectId: number): void {
    if (confirm('¿Seguro que quieres borrar este proyecto?')) {
      this.projectService
        .deleteProject(projectId)
        .subscribe(() => this.loadProjects());
    }
  }

  changeStatus(project: Project, event: MatSlideToggleChange) {
    const originalState = event.checked; // Captura el estado actual del slider
    const msg = `¿Seguro que quieres ${
      project.is_active ? 'desactivar' : 'activar'
    } este proyecto?`;

    if (confirm(msg)) {
      // Cambiar el estado del proyecto solo si se confirma
      project.is_active = originalState ? 1 : 0; // Ajusta el estado
      this.projectService.updateProject(project.id, project).subscribe(() => {
        this.loadProjects();
      });
    } else {
      // Si no se confirma, revertir el estado del slider
      event.source.checked = !originalState;
    }
  }

  openProjectDialog(project: Project | null = null): void {
    const dialogRef = this.dialog.open(ProjectsPopupComponent, {
      width: '70%',
      height: 'auto',
      data: {
        project: project,
        departments: this.departments,
        clients: this.clients,
        types: this.types,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (project) {
          this.projectService
            .updateProject(project.id, result)
            .subscribe(() => {
              this.snackbar.openSnackbar(
                'Proyecto actualizado',
                'snackbar-success',
                3000
              );
              this.loadProjects();
            });
        } else {
          this.projectService
            .createProject(result)
            .subscribe(() =>{
              this.snackbar.openSnackbar(
                'Proyecto creado',
                'snackbar-success',
                3000
              );
               this.loadProjects()
              });
        }
      }
    });
  }
}
