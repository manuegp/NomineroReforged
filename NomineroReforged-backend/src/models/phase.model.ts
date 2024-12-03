export interface Phase {
    id?: number; // Primary Key
    id_phase: string; // Unique phase identifier
    name: string; // Name of the phase
    updated_by?: number | null; // User who updated the record
    updated_at?: string | null; // Timestamp of the last update
    created_by: number; // User who created the record
    created_at?: string; // Timestamp of the record creation
  }
  