import { Component, OnInit, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { UserService } from '../../../../services/user.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { User } from '../../../../models/user.model';

@Component({
  selector: 'app-asign-employees',
  standalone: true,
  imports: [
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatPaginatorModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './asign-employees.component.html',
  styleUrls: ['./asign-employees.component.css'],
})
export class AsignEmployeesComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['select', 'id', 'name', 'surname'];
  dataSource = new MatTableDataSource<User>();
  searchControl = new FormControl('');
  selectedUsers: Set<number> = new Set<number>(); // Almacena IDs de usuarios seleccionados

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private userService: UserService,
    private dialogRef: MatDialogRef<AsignEmployeesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.setupFilter();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  // Obtener usuarios del servicio
  loadUsers(): void {
    this.userService.getAllUsers().subscribe((users) => {
      this.dataSource.data = users;
      this.dataSource.paginator = this.paginator;
    });
  }

  // Configurar filtro
  setupFilter(): void {
    this.searchControl.valueChanges.subscribe((value) => {
      this.dataSource.filter = value!.trim().toLowerCase();
    });

    this.dataSource.filterPredicate = (data: User, filter: string) =>
      data.name.toLowerCase().includes(filter) ||
      data.surname.toLowerCase().includes(filter);
  }

  // Seleccionar o deseleccionar usuario
  toggleUserSelection(userId: number): void {
    if (this.selectedUsers.has(userId)) {
      this.selectedUsers.delete(userId);
    } else {
      this.selectedUsers.add(userId);
    }
  }

  // Guardar y cerrar el modal
  assignUsers(): void {
    const selectedUserIds = Array.from(this.selectedUsers);
    const selectedUsers = this.dataSource.data.filter((user) =>
      selectedUserIds.includes(user.id!)
    );

    this.dialogRef.close(selectedUsers);
  }

  // Cancelar y cerrar el modal
  cancel(): void {
    this.dialogRef.close();
  }
}
