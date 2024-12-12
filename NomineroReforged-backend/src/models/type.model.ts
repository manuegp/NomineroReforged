import { Phase } from "./phase.model";

export interface Type{
    id?:number;
    name?: string;
    phases?: Phase[];
    delete_mark?: boolean;
    updated_by?: number | null; // User who updated the record
    updated_at?: string | null; // Timestamp of the last update
    created_by?: number; // User who created the record
    created_at?: string; // Timestamp of the record creation
}