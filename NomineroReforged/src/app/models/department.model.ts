// src/models/department.model.ts
export interface Department {
    id?: number;
    name: string;
    delete_mark?: number;
    updated_by?: number;
    updated_at?: Date;
    created_by?: number;
    modify_by?: number;
    created_at?: Date;
    selected?: boolean
}