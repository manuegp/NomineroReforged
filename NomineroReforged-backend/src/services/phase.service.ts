import { Database } from 'sqlite3';
import { Phase } from '../models/phase.model';
import { AppError } from '../utils/errorHandler';

export class PhaseService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  // Obtener todas las fases
  async getAllPhases(): Promise<Phase[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM NMN_PHASE',
        (err, rows) => {
          if (err) {
            reject(new AppError('Error fetching phases', 500));
          } else {
            resolve(rows as Phase[]);
          }
        }
      );
    });
  }

  // Obtener una fase por ID
  async getPhaseById(id: number): Promise<Phase | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM NMN_PHASE WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            reject(new AppError('Error fetching phase', 500));
          } else {
            resolve(row as Phase | null);
          }
        }
      );
    });
  }

  // Crear una nueva fase
  async createPhase(phase: Omit<Phase, 'id'>): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO NMN_PHASE 
        (id_phase, name, created_by, created_at) 
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
        [phase.id_phase, phase.name, phase.created_by],
        function (this: { lastID: number }, err) {
          if (err) {
            reject(new AppError('Error creating phase', 500));
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  // Actualizar una fase por ID
  async updatePhase(id: number, phase: Partial<Phase>): Promise<void> {
    const { id_phase, name, updated_by } = phase;
    const updateFields: string[] = [];
    const values: any[] = [];

    if (id_phase) {
      updateFields.push('id_phase = ?');
      values.push(id_phase);
    }
    if (name) {
      updateFields.push('name = ?');
      values.push(name);
    }
    if (updated_by) {
      updateFields.push('updated_by = ?');
      values.push(updated_by);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE NMN_PHASE SET ${updateFields.join(', ')} WHERE id = ?`,
        values,
        (err) => {
          if (err) {
            reject(new AppError('Error updating phase', 500));
          } else {
            resolve();
          }
        }
      );
    });
  }

  // Eliminar una fase por ID
  async deletePhase(id: number, updated_by: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM NMN_PHASE WHERE id = ?',
        [id],
        (err) => {
          if (err) {
            reject(new AppError('Error deleting phase', 500));
          } else {
            resolve();
          }
        }
      );
    });
  }
}
