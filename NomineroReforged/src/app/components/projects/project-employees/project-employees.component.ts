import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { User } from '../../../models/user.model';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ProjectService } from '../../../services/projects.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AsignEmployeesComponent } from './asign-employees/asign-employees.component';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-project-employees',
  imports: [MatTableModule, MatButtonModule, MatIcon],
  templateUrl: './project-employees.component.html',
  styleUrl: './project-employees.component.css'
})
export class ProjectEmployeesComponent implements OnInit, OnChanges{
  @Input() projectId!: number; // Recibe el ID del proyecto
  displayedColumns: string[] = ['id', 'name', 'actions']
  dataSource = new MatTableDataSource<User>();
  //TODO hacer modal con filtro para nombre apellido departamento
  constructor(private projectService: ProjectService, private dialog: MatDialog) {}

  ngOnInit(): void {
    if (this.projectId) {
      this.loadEmployees();
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId'] && !changes['projectId'].firstChange) {
      this.loadEmployees();
    }
  }
  loadEmployees(): void {
    this.projectService.getEmployeesByProject(this.projectId).subscribe(
      (users) => {
        this.dataSource.data = users;
      },
      (error) => {
        console.error('Error al cargar empleados:', error);
      }
    );
  }
  deleteEmployee(employeeId: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este empleado del proyecto?')) {
      this.projectService.deleteEmployeeFromProject(this.projectId, employeeId).subscribe({
        next: () => {
          console.log(`Empleado ${employeeId} eliminado del proyecto ${this.projectId}`);
          this.loadEmployees(); // Recargar la lista
        },
        error: (err) => {
          console.error('Error al eliminar el empleado del proyecto:', err);
        },
      });
    }
  }
  openAssignEmployeesDialog() {
    const dialogRef = this.dialog.open(AsignEmployeesComponent, {
      width: '80%', // Ancho ajustable
      maxHeight: '90vh', // Altura máxima del modal
      disableClose: true, // Evita cerrar el diálogo haciendo clic fuera
    });
  
    dialogRef.afterClosed().subscribe((selectedUsers: User[]) => {
      if (selectedUsers && selectedUsers.length > 0) {
        console.log('Usuarios seleccionados:', selectedUsers);

        // Llamar al servicio para asignar usuarios al proyecto
        this.projectService.assignEmployeesToProject(this.projectId, selectedUsers).subscribe({
          next: () => {
            console.log('Usuarios asignados correctamente');
            this.loadEmployees(); // Refrescar la lista de empleados asignados
          },
          error: (err) => console.error('Error al asignar usuarios:', err),
        });
      }
    });
  }
}
