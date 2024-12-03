// src/app/pipes/role.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'role',
  standalone: true
})
export class RolePipe implements PipeTransform {
  transform(user: { is_admin: boolean, is_superadmin: boolean }): string {
    if (user.is_superadmin) return 'Super Admin';
    if (user.is_admin) return 'Admin';
    return 'Empleado';
  }
}