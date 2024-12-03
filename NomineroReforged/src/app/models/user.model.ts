// src/app/models/user.model.ts
export interface User {
  id?: number;
  name: string;
  surname: string;
  email: string;
  password?: string;
  is_admin: boolean | number;
  is_superadmin: boolean | number;
  is_active: boolean | number;
  delete_mark: boolean | number;
  updated_by?: number;
  updated_at?: Date;
  created_by?: number;
  modify_by?: number;
  created_at?: Date;
  role_id?: number;  // Add this line
  department_name?: string
  department_id?: number
}