export interface Register {
  id?: number;
  start?: string;
  end?: string;
  project?: number;
  phase?: number;
  date?: string;
  time?: number;
  user?: number;
  is_extra?: boolean;
  coment?: string | null;
  updated_by?: number | null;
  updated_at?: string | null;
  created_by?: number | null;
  created_at?: string | null;
}
