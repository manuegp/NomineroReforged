export interface Register {
  id?: number;
  user?: number;
  project?: number;
  phase?: number;
  date?: string;
  time?: number;
  delete_mark?: boolean;
  is_extra?: boolean;
  is_active?: boolean;
  coment?: string | null;
  updated_by?: number | null;
  updated_at?: string | null;
  created_by?: number | null;
  created_at?: string | null;
}
