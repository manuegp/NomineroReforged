import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
    canActivate: [loginGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    children: [
      // {
      //   path: 'home',
      //   loadComponent: () => import('./components/dashboard/home/home.component').then(m => m.HomeComponent)
      // },
      // {
      //   path: 'clients',
      //   loadComponent: () => import('./components/dashboard/clients/clients.component').then(m => m.ClientsComponent)
      // },
      // {
      //   path: 'projects',
      //   loadComponent: () => import('./components/dashboard/projects/projects.component').then(m => m.ProjectsComponent)
      // },
      {
         path: 'users',
         loadComponent: () => import('./components/users/users.component').then(m => m.UsersComponent)
       },
      //  {
      //   path: 'registers',
      //   loadComponent: () => import('./components/dashboard/registers/registers.component').then(m => m.RegistersComponent)
      // },
      // {
      //   path: 'settings',
      //   loadComponent: () => import('./components/dashboard/settings/settings.component').then(m => m.SettingsComponent)
      // },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];