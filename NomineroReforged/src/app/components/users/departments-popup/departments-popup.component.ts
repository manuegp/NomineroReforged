import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Department } from '../../../models/department.model';
import { DepartmentService } from '../../../services/deparments.service';
import { SnackbarService } from '../../../snackbar/snackbar';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-departments-popup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatPaginatorModule,
  ],
  templateUrl: './departments-popup.component.html',
  styleUrls: ['./departments-popup.component.css'],
})
export class DepartmentsPopupComponent implements OnInit {
  departments: Department[] = [];
  paginatedDepartments: Department[] = [];
  displayedColumns: string[] = ['id', 'name'];
  selectedDepartment: Department | null = null;

  departmentForm: FormGroup;

  // Paginación
  pageSize = 5;
  currentPage = 0;
  totalDepartments = 0;

  constructor(
    public dialogRef: MatDialogRef<DepartmentsPopupComponent>,
    private departmentService: DepartmentService,
    @Inject(MAT_DIALOG_DATA) public data: Department[] | null,
    private fb: FormBuilder,
    private snackbar: SnackbarService
  ) {
    this.departmentForm = this.fb.group({
      id: [{ value: '', disabled: true }],
      name: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (departments: Department[]) => {
        this.departments = departments;
        this.totalDepartments = departments.length;
        this.updatePaginatedDepartments();
      },
      error: (err) => {
        console.error('Error al cargar departamentos:', err);
      },
    });
  }

  selectDepartment(department: Department): void {
    this.selectedDepartment = department;
    this.departmentForm.setValue({
      id: department.id,
      name: department.name,
    });
  }

  saveDepartment(): void {
    if (this.departmentForm.valid) {
      if (this.selectedDepartment) {
        this.departmentService
          .updateDepartment(this.selectedDepartment.id!, this.departmentForm.value.name)
          .subscribe({
            next: () => {
              console.log('Departamento actualizado');
              this.loadDepartments();
              this.snackbar.openSnackbar("Departamento actualizado", "snackbar-success", 3000)
            },
            error: (err) => {
              console.error('Error al actualizar departamento:', err);
              this.snackbar.openSnackbar("No se ha podido actualizar el departamento", "snackbar-danger", 3000)
            },
          });
      } else {
        this.departmentService.createDepartment(this.departmentForm.value.name).subscribe({
          next: () => {
            console.log('Departamento creado');
            this.loadDepartments();
            this.snackbar.openSnackbar("Departamento creado", "snackbar-success", 3000)
          },
          error: (err) => {
            console.error('Error al crear departamento:', err);
            this.snackbar.openSnackbar("No se ha podido crear el departamento", "snackbar-danger", 3000)
          },
        });
      }
      this.clearSelection();
    }
  }

  addNewDepartment(): void {
    this.clearSelection();
    this.departmentForm.reset();
  }

  clearSelection(): void {
    this.selectedDepartment = null;
    this.departmentForm.reset();
  }

  closePopup(): void {
    this.dialogRef.close(this.departments);
  }

  deleteDepartment(): void {
    if (this.selectedDepartment?.id) {
      this.departmentService.deleteDepartment(this.selectedDepartment.id).subscribe({
        next: () => {
          console.log('Departamento borrado');
          this.loadDepartments();
          this.snackbar.openSnackbar('Departamento borrado', 'snackbar-success', 3000);
        },
        error: (err) => {
          console.error('Error al borrar departamento:', err);
          const errorMessage = err.message; // Captura el mensaje procesado por handleError
          this.snackbar.openSnackbar(errorMessage, 'snackbar-danger', 3000);
        },
      });
    } else {
      this.snackbar.openSnackbar('No hay un departamento seleccionado para borrar', 'snackbar-warning', 3000);
    }
  }
  

  // Actualizar departamentos mostrados según la página
  updatePaginatedDepartments(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.departments.length);
    this.paginatedDepartments = this.departments.slice(startIndex, endIndex);
  }

  // Manejar el cambio de página
  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.updatePaginatedDepartments();
  }
}
