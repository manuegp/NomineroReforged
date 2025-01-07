export interface Project {
    id?: number;
    code: string; // Código único del proyecto
    name: string; // Nombre del proyecto
    client: number; // Cliente asociado
    estimated: number; // Estimación en horas o costo
    date_start: string; // Fecha de inicio
    date_end?: string; // Fecha de finalización
    description?: string; // Descripción del proyecto
    is_active?: number;
    type: number; // Tipo de proyecto
    department: number; // Departamento asociado
    updated_by?: number | null; // Usuario que actualizó el proyecto
    updated_at?: string | null; // Fecha de última actualización
    created_by: number; // Usuario que creó el proyecto
    created_at?: string; // Fecha de creación
    delete_mark?: number; // Marcador de borrado (0 = no eliminado, 1 = eliminado)
  }
  