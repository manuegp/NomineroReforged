import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckbox, MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';

import { UserService } from '../../services/user.service';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Phase } from '../../models/phase.model';
import { PhasesService } from '../../services/phase.service';
import { TypesService } from '../../services/type.service';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { Type } from '../../models/types.model';
import { User } from '../../models/user.model';
import { MatSelectModule } from '@angular/material/select';
import { RegistersService } from '../../services/registers.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class ReportsComponent implements OnInit {
  typeForm: FormGroup; // FormGroup principal
  users: User[] = []; // Lista completa de usuarios
  filteredUsers: User[] = []; // Usuarios filtrados para el autocomplete
  selectedUsers: User[] = []; // Usuarios seleccionados en los chips
  userFilterCtrl = new FormControl(''); // Control para filtrar usuarios
  selectAllControl = new FormControl(false); // Control para manejar el checkbox "Seleccionar todos"

  constructor(private fb: FormBuilder, private userService: UserService, private registerService: RegistersService,) {
    // Inicializamos el formulario reactivo
    this.typeForm = this.fb.group({
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadUsers();

    // Observamos los cambios en el input de búsqueda y filtramos los usuarios
    this.userFilterCtrl.valueChanges.subscribe((value) => {
      const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
      this.filteredUsers = this.filterUsers(filterValue);
    });

    // Observamos cambios en el checkbox "Seleccionar todos"
    this.selectAllControl.valueChanges.subscribe((checked) => {
      this.selectedUsers = checked ? [...this.users] : [];
    });
  }

  // Cargar usuarios desde el servicio
  loadUsers(): void {
    this.userService.getAllUsers().subscribe((users) => {
      this.users = users;
      this.filteredUsers = users;
    });
  }

  // Filtrar usuarios para el autocomplete
  filterUsers(value: string): User[] {
    return this.users.filter((user) =>
      `${user.name} ${user.surname}`.toLowerCase().includes(value)
    );
  }

  // Agregar un usuario seleccionado desde el autocomplete
  addUser(event: MatAutocompleteSelectedEvent): void {
    const selectedUser = event.option.value as User;
    if (!this.selectedUsers.find((user) => user.id === selectedUser.id)) {
      this.selectedUsers.push(selectedUser);
    }
    this.userFilterCtrl.setValue(''); // Limpiamos el control de filtro
  }

  // Eliminar un usuario de los chips
  removeUser(user: User): void {
    this.selectedUsers = this.selectedUsers.filter((u) => u.id !== user.id);
  }

  sendToExport(): void {
    const formValue = this.typeForm.value
    const parsedUsers = this.selectedUsers.map((user) => user.id);

    this.registerService.exportToXLSX({users: parsedUsers, toDate: formValue.toDate.toISOString(), fromDate: formValue.fromDate.toISOString()})
  }
}
