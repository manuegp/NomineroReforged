import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { MenuItem } from '../../models/menuItem.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  menuItems: Array<MenuItem> = [];
  rol?: string;
  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  ngOnInit(): void {
    // Force a layout recalculation
    this.rol = this.authService.getRoleFromToken()!;
    this.loadMenuItems();
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    });
  }

  loadMenuItems() {
    this.menuItems.push({
      icon: 'schedule',
      label: 'Registros',
      route: '/dashboard/registers',
    });
    if (this.rol == 'Admin' || this.rol == 'Superadmin') {
      this.menuItems.push(
        { icon: 'people', label: 'Usuarios', route: '/dashboard/users' },
        { icon: 'business', label: 'Clientes', route: '/dashboard/clients' },
        { icon: 'assignment', label: 'Proyectos', route: '/dashboard/projects' }
      );
    }
  }
}

// { icon: 'home', label: 'Inicio', route: '/dashboard/home' },
//     { icon: 'business', label: 'Clientes', route: '/dashboard/clients' },
//     { icon: 'assignment', label: 'Proyectos', route: '/dashboard/projects' },
//     { icon: 'people', label: 'Usuarios', route: '/dashboard/users' },
//     { icon: 'schedule', label: 'Registros', route: '/dashboard/registers' },
//     { icon: 'settings', label: 'Configuración', route: '/dashboard/settings' }
