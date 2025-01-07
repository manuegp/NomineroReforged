import { Register } from "@/models/register.model";
import { AppError } from "../utils/errorHandler";
import { Database } from "sqlite3";

export class RegisterService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async getAllRegistersByUserId(
    userId: number,
    from?: string,
    to?: string
  ): Promise<Register[]> {
    return new Promise((resolve, reject) => {
      const filters = [];
      const values: any[] = [userId];
  
      if (from) {
        filters.push('date >= ?');
        values.push(from);
      }
  
      if (to) {
        filters.push('date <= ?');
        values.push(to);
      }
  
      const whereClause = filters.length > 0 ? `AND ${filters.join(' AND ')}` : '';
  
      this.db.all(
        `
        SELECT 
          id, 
          project, 
          phase, 
          date, 
          time, 
          is_extra, 
          coment, 
          updated_by, 
          updated_at, 
          created_by, 
          created_at,
          delete_mark
        FROM 
          NMN_REGISTERS
        WHERE 
          user = ? ${whereClause} AND delete_mark = 0;
        `,
        values,
        (err, rows) => {
          if (err) {
            reject(new AppError('Error retrieving registers by user', 500));
          } else {
            resolve(
              rows.map((row: any) => ({
                id: row.id,
                project: row.project,
                phase: row.phase,
                date: row.date,
                time: row.time,
                is_extra: Boolean(row.is_extra),
                coment: row.coment,
                updated_by: row.updated_by,
                updated_at: row.updated_at,
                created_by: row.created_by,
                created_at: row.created_at,
              }))
            );
          }
        }
      );
    });
  }
  
  async addRegister(register: Omit<Register, 'id'>): Promise<number> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO NMN_REGISTERS 
        (user, project, phase, date, time, is_extra, coment, delete_mark, created_by, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;

      const params = [
        register.user,
        register.project,
        register.phase,
        register.date,
        register.time,
        register.is_extra,
        register.coment || null, // Permite que el comentario sea opcional
        register.delete_mark || 0, // Default 0 si no se pasa
        register.created_by,
      ];

      this.db.run(query, params, function (this: { lastID: number }, err) {
        if (err) {
          reject(new AppError('Error adding register', 500));
        } else {
          resolve(this.lastID); // Devuelve el ID del nuevo registro
        }
      });
    });
  }

  async updateRegister(register: Register, id: number): Promise<void> {
    const { user, project, phase,date,time, is_extra, coment } = register;
    const updateFields: string[] = [];
    const values: any[] = [];

    if (user) {
      updateFields.push('user = ?');
      values.push(user);
    }
    if (project) {
      updateFields.push('project = ?');
      values.push(project);
    }
    if (phase) {
      updateFields.push('phase = ?');
      values.push(phase);
    }
    if (date) {
      updateFields.push('date = ?');
      values.push(date);
    }
    if (time) {
      updateFields.push('time = ?');
      values.push(time);
    }
    if (is_extra) {
      updateFields.push('is_extra = ?');
      values.push(is_extra);
    }
    if (coment) {
      updateFields.push('coment = ?');
      values.push(coment);
    }
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id)
    return new Promise((resolve, reject) => {
      this.db.run(`
        UPDATE NMN_REGISTERS SET ${updateFields.join(', ')} WHERE id = ? AND delete_mark = 0
        `, 
        values,
        (err) =>{
          if (err) reject(new AppError('Error updating project', 500));
          else resolve();
        }
      
      )
    })
  }
}