export interface Client {
    id?: number;
    name: string;
    contact: string;
    updated_by?: number | null;
    updated_at?: string | null;
    created_by: number;
    created_at?: string | null;
  }