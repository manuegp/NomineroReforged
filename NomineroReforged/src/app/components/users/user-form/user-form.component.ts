import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonModule } from '@angular/common';
import { DepartmentService } from '../../../services/deparments.service'; // Asegúrate de que la ruta es correcta
import { Department } from '../../../models/department.model'; // Modelo de departamentos
import { UserService } from '../../../services/user.service';
import { SnackbarService } from '../../../snackbar/snackbar';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
})
export class UserFormComponent implements OnInit {
  @ViewChild('nameInput') nameInput!: ElementRef;
  userForm!: FormGroup;
  hidePassword = true;
  isEditMode = false;
  departments: Department[] = []; // Lista de departamentos
  roles = [
    { value: 1, viewValue: 'Empleado' },
    { value: 2, viewValue: 'Administrador' },
    { value: 3, viewValue: 'Superadministrador' },
  ];

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private userService: UserService,
    public dialogRef: MatDialogRef<UserFormComponent>,
    private snackbar: SnackbarService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

   async ngOnInit(): Promise<void> {
    this.isEditMode = this.data.user == undefined ? false : true;
    await this.initForm();
    await this.loadDepartments();

    if (!this.isEditMode) {
      // Retrasar el enfoque si es un nuevo usuario
      setTimeout(() => {
        this.nameInput.nativeElement.focus();
      }, 100);
    }
  }

  async initForm() {
    this.userForm = this.fb.group({
      name: [this.data?.user?.name || '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      surname: [this.data?.user?.surname || '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: [this.data?.user?.email || '', [Validators.required, Validators.email]],
      password: [this.isEditMode ? null : '', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      role_id: [ this.convertRolId(), Validators.required],
      department_id: [this.data?.user?.department_id || null, Validators.required],
      is_active: [this.convertIsActive(this.data?.user?.is_active)|| false],
    });

    // Si estamos en modo edición, establecer el valor inicial del departamento
    if (this.isEditMode && this.data.user.department_id) {
      this.userForm.patchValue({
        department_id: this.data.user.department_id,
      });
    }
  }

  convertRolId(){
    if(this.data?.user?.is_admin && !this.data?.user?.is_superadmin){
      return 2
    }else if(!this.data?.user?.is_admin && this.data?.user?.is_superadmin) {
      return 3
    }else{
      return 1
    }
  }

  convertIsActive(isActive: number){
    if(isActive == 1){
      return true
    }else {
      return false
    }
  }

  async loadDepartments() {
    return new Promise<void>((resolve) => {
      this.departmentService.getAllDepartments().subscribe({
        next: (departments: any) => {
          this.departments = departments;
          resolve(); // Resuelve la promesa cuando los departamentos están cargados
        },
        error: (err: any) => {
          console.error('Error loading departments:', err);
          resolve(); // Resuelve incluso si ocurre un error para evitar bloqueos
        },
      });
    });
  }

  
  onSubmit() {
    if (this.userForm.value.role_id) {
      const formData = { ...this.userForm.value }; // Clonar los datos del formulario
  
      // Modificar los valores de acuerdo al id
      switch (formData.role_id) {
        case 1:
          formData.is_admin = false;
          formData.is_superadmin = false;
          break;
        case 2:
          formData.is_admin = true;
          formData.is_superadmin = false;
          break;
        case 3:
          formData.is_admin = false;
          formData.is_superadmin = true;
          break;
        default:
          // Para otros IDs, no realizar cambios adicionales
          break;
      }
  
      // Eliminar el campo role_id antes de enviar
      delete formData.role_id;
      
      if(this.isEditMode){
        delete formData.password;
      }

      // Enviar los datos al servicio
      if(this.isEditMode){
      this.userService.updateUser(this.data.user.id, formData).subscribe({
        next: (response) => {
          console.log('Usuario actualizado:', response);
          this.snackbar.openSnackbar("Usuario actualizado", "snackbar-success", 3000)
          this.dialogRef.close(formData); // Cerrar el diálogo solo si la respuesta es exitosa
        },
        error: (err) => {
          console.error('Error al actualizar usuario:', err);
          this.snackbar.openSnackbar("No se ha podido actualuizar usuario", "snackbar-danger", 3000)

        },
      });
    }else{
      this.userService.createUser(formData).subscribe({
        next: (response) => {
          console.log('Usuario creado:', response);
          this.snackbar.openSnackbar("Usuario creado", "snackbar-success", 3000)
          this.dialogRef.close(formData); // Cerrar el diálogo solo si la respuesta es exitosa
        },
        error: (err) => {
          console.error('Error al crear usuario:', err);
          this.snackbar.openSnackbar("No se ha podido crear usuario", "snackbar-danger", 3000)
        },
      });
    }
    }
  }
  

  onCancel() {
    this.dialogRef.close();
  }

  getErrorMessage(controlName: string): string {
    const control = this.userForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (control?.hasError('minlength')) {
      const min = control.errors?.['minlength']?.requiredLength;
      return `Debe tener al menos ${min} caracteres`;
    }
    if (control?.hasError('maxlength')) {
      const max = control.errors?.['maxlength']?.requiredLength;
      return `No puede tener más de ${max} caracteres`;
    }
    if (control?.hasError('email')) {
      return 'Correo no válido';
    }
    return '';
  }
}
