export interface User {
  id?: number;
  name: string;
  surname: string;
  email: string;
  password: string;
  is_active: boolean;
  delete_mark: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: number | null;
  updated_by?: number | null;
  is_admin?: boolean; // Indica si el usuario es administrador
  is_superadmin?: boolean; // Indica si el usuario es superadministrador
  department_id?: number;
  department_name?: string;
  
}
