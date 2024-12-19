import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { UserFormComponent } from './user-form/user-form.component';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { RolePipe } from '../../pipes/role.pipe';
import { DepartmentService } from '../../services/deparments.service';
import { Department } from '../../models/department.model';
import { DepartmentsPopupComponent } from './departments-popup/departments-popup.component';
import { SnackbarService } from '../../snackbar/snackbar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatPaginatorModule,
    MatSelectModule,
    RolePipe
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, AfterViewInit {
  rol: string = "";
  users: User[] = [];
  filteredUsers: User[] = [];
  displayedUsers: User[] = [];
  filterValue: string = '';
  selectedRole: number | null = null;
  selectedStatus: boolean | null = null;
  displayedColumns: string[] = ['id', 'name', 'surname', 'email', 'role', 'departament','is_active','actions'];
  pageSizeOptions: number[] = [5,10,15,20];
  totalUsers= 0;
  departments: { name: string }[] = [];

  roles = [
    { value: 1, viewValue: 'Empleado' },
    { value: 2, viewValue: 'Admin' },
    { value: 3, viewValue: 'Super Admin' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatTable) table!: MatTable<User>;
  selectedDepartment: any;
  departmentService: any;

  constructor(
    private userService: UserService,
    private deparmentService: DepartmentService,
    private dialog: MatDialog,
    private snackbar: SnackbarService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.rol = this.authService.getRoleFromToken()!;
    this.loadUsers();
    if(this.rol == "Superadmin"){
    this.loadDepartments();
  }
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.paginator.page.subscribe(() => this.updateDisplayedUsers());
    }
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe(
      (users) => {
        this.users = users;
        this.totalUsers = users.length;
        this.applyFilters();
      },
      (error) => {
        console.error('Error al cargar usuarios:', error);
        this.snackbar.openSnackbar("Error al cargar usuario", "snackbar-danger", 3000)
      }
    );
  }

  applyFilters() {
    let filtered = [...this.users];
  
    // Filtro de texto
    if (this.filterValue) {
      const filterText = this.filterValue.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(filterText) ||
        user.surname.toLowerCase().includes(filterText) ||
        user.email.toLowerCase().includes(filterText)
      );
    }
  
    // Filtro por rol
    if (this.selectedRole !== null) {
      filtered = filtered.filter(user => {
        if (this.selectedRole === 3) return user.is_superadmin;
        if (this.selectedRole === 2) return user.is_admin && !user.is_superadmin;
        return !user.is_admin && !user.is_superadmin;
      });
    }
  
    // Filtro por estado (0 y 1 en lugar de true y false)
    if (this.selectedStatus !== null) {
      filtered = filtered.filter(user => user.is_active === (this.selectedStatus ? 1 : 0));
    }
  
    // Filtro por departamento
    if (this.selectedDepartment) {
      filtered = filtered.filter(user => user.department_name === this.selectedDepartment);
    }
  
    this.filteredUsers = filtered;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.updateDisplayedUsers();
  }
  
  

  updateDisplayedUsers() {
    if (this.paginator) {
      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      this.displayedUsers = this.filteredUsers.slice(startIndex, startIndex + this.paginator.pageSize);
    } else {
      this.displayedUsers = this.filteredUsers;
    }
    if (this.table) {
      this.table.renderRows();
    }
  }

  onPageChange(event: PageEvent) {
    this.updateDisplayedUsers();
  }

  openUserForm(user?: User) {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '400px',
      data: {user}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  openDepartmentPopUp(){
    const dialogRef = this.dialog.open(DepartmentsPopupComponent, {
      width: '1300px',
      height: '400px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDepartments();
      }
    });
  }

  loadDepartments() {
    this.deparmentService.getAllDepartments().subscribe({
      next: (departments:any) => {
        this.departments = departments.map((d:any) => ({id: d.id ,name: d.name }));
      },
      error: (err:any) => {
        this.snackbar.openSnackbar("Error al cargar departamentos", "snackbar-danger", 3000)

        console.error('Error loading departments:', err);
      },
    });
  }
  
  deleteUser(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.userService.deleteUser(id).subscribe(
        () => {
          this.loadUsers();
        },
        (error) => {
        this.snackbar.openSnackbar("Error al eliminar usuario", "snackbar-danger", 3000)

          console.error('Error al eliminar usuario:', error);
        }
      );
    }
  }

  clearFilters() {
    this.filterValue = '';
    this.selectedRole = null;
    this.selectedStatus = null;
    this.selectedDepartment = null;
    this.applyFilters();
  }
}