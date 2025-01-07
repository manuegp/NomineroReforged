export interface Project {
    id: number;
    code: string;
    name: string;
    client: number;
    is_active?: number| boolean;
    estimated: number;
    date_start: string;
    date_end: string | null;
    description: string;
    type: number;
    department: number;
}