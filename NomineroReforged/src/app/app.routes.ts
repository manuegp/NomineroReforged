import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent
      ),
    canActivate: [loginGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [authGuard],
    children: [
      {
        path: 'clients',
        loadComponent: () =>
          import('./components/clients/clients.component').then(
            (m) => m.ClientsComponent
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./components/users/users.component').then(
            (m) => m.UsersComponent
          ),
      },
      {
        path: 'registers',
        loadComponent: () =>
          import('./components/registers/registers.component').then(
            (m) => m.RegistersComponent
          ),
      },
      {path: 'reports',
        loadComponent: () =>
          import('./components/reports/reports.component').then(
            (m) => m.ReportsComponent
          )},
      {
        path: 'projects',
        loadComponent: () =>
          import('./components/projects/projects.component').then(
            (m) => m.ProjectsComponent
          ),
        children: [
          {
            path: '',
            redirectTo: 'list',
            pathMatch: 'full',
          },
          {
            path: 'list',
            loadComponent: () =>
              import('./components/projects/project-list/project-list.component').then(
                (m) => m.ProjectListComponent
              ),
          },
          {
            path: 'types',
            loadComponent: () =>
              import('./components/projects/types/types.component').then(
                (m) => m.TypesComponent
              ),
          },
          {
            path: 'phases',
            loadComponent: () =>
              import('./components/projects/phases/phases.component').then(
                (m) => m.PhasesComponent
              ),
          },
        ],
      },
      {
        path: '',
        redirectTo: 'registers',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
