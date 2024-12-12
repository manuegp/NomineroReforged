import { Database } from 'sqlite3';
import { Type } from '../models/type.model';
import { AppError } from '../utils/errorHandler';
import { Phase } from '@/models/phase.model';

export class TypeService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async getAllTypes(): Promise<Type[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `
        SELECT 
          t.id,
          t.name,
          GROUP_CONCAT(ph.id || ':' || ph.name) AS phases
        FROM 
          NMN_TYPE_PROJECT t
        LEFT JOIN 
          NMN_TYPE_PRO_PHASE tp ON t.id = tp.id_type_project
        LEFT JOIN 
          NMN_PHASE ph ON tp.id_phase = ph.id
        WHERE 
          t.delete_mark IS NULL OR t.delete_mark = 0
        GROUP BY 
          t.id, t.name
        `,
        (err, rows) => {
          if (err) {
            reject(new AppError('Error fetching types with phases', 500));
          } else {
            const types = rows.map((row: any) => ({
              id: row.id,
              name: row.name,
              phases: row.phases
                ? row.phases.split(',').map((phase: string) => {
                    const [id, name] = phase.split(':');
                    return { id: Number(id), name };
                  })
                : [],
            }));
            resolve(types as Type[]);
          }
        }
      );
    });
  }
  
  

  async getTypeById(id: number): Promise<Type | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `
        SELECT 
          t.*, 
          GROUP_CONCAT(ph.id || ':' || ph.name) AS phases
        FROM 
          NMN_TYPE_PROJECT t
        LEFT JOIN 
          NMN_TYPE_PRO_PHASE tp ON t.id = tp.id_type_project
        LEFT JOIN 
          NMN_PHASE ph ON tp.id_phase = ph.id
        WHERE 
          t.id = ? AND  (t.delete_mark IS NULL OR t.delete_mark = 0)
        GROUP BY 
          t.id
        `,
        [id],
        (err, row) => {
          if (err) {
            reject(new AppError('Error fetching type with phases', 500));
          } else if (row) {
            // Asegurarse de que row sea tratado como cualquier objeto con las propiedades necesarias
            const rowWithCorrectType = row as {
              id: number;
              name: string;
              phases: string | null;
            };
  
            // Convertir las fases concatenadas en un array de objetos Phase
            const type: Type = {
              id: rowWithCorrectType.id,
              name: rowWithCorrectType.name,
              phases: rowWithCorrectType.phases
                ? rowWithCorrectType.phases.split(',').map((phase: string) => {
                    const [id, name] = phase.split(':');
                    return { id: Number(id), name } as Phase;
                  })
                : []
              
            };
            resolve(type);
          } else {
            resolve(null);
          }
        }
      );
    });
  }
 
  async createType(type: Omit<Type, 'id'>, userId:number): Promise<number> {
    const db = this.db; // Almacenar referencia de `this.db`
  
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO NMN_TYPE_PROJECT (name, created_by, created_at) 
         VALUES (?, ?, CURRENT_TIMESTAMP)`,
        [type.name, userId],
        function (this: { lastID: number }, err) {
          if (err) {
            reject(new AppError('Error creating type', 500));
          } else {
            const typeId = this.lastID;
            if (type.phases && type.phases.length > 0) {
              const phaseInserts = type.phases.map((phase: Phase) => {
                return new Promise<void>((resolvePhase, rejectPhase) => {
                  db.run(
                    `INSERT INTO NMN_TYPE_PRO_PHASE 
                     (id_type_project, id_phase, created_by, created_at)
                     VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
                    [typeId, phase.id, userId],
                    (phaseErr) => {
                      if (phaseErr) {
                        rejectPhase(new AppError('Error associating phase with type', 500));
                      } else {
                        resolvePhase();
                      }
                    }
                  );
                });
              });
  
              // Insertar todas las fases en paralelo
              Promise.all(phaseInserts)
                .then(() => resolve(typeId))
                .catch((phaseErr) => reject(phaseErr));
            } else {
              resolve(typeId); // No hay fases para asociar
            }
          }
        }
      );
    });
  }
  
  

  async updateType(id: number, type: Partial<Type>, userId: number): Promise<void> {
    const { name, phases } = type; // Ahora se incluye `phases`
    const updateFields: string[] = [];
    const values: any[] = [];
    
    if (name) {
      updateFields.push('name = ?');
      values.push(name);
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
  
    return new Promise((resolve, reject) => {
      // Iniciar una transacción para garantizar consistencia
      this.db.serialize(() => {
        // Actualizar la tabla `NMN_TYPE_PROJECT`
        this.db.run(
          `UPDATE NMN_TYPE_PROJECT SET ${updateFields.join(', ')} WHERE id = ?`,
          values,
          (err) => {
            if (err) {
              reject(new AppError('Error updating type', 500));
              return;
            }
          }
        );
  
        // Eliminar relaciones existentes en `NMN_TYPE_PRO_PHASE`
        this.db.run(
          `DELETE FROM NMN_TYPE_PRO_PHASE WHERE id_type_project = ?`,
          [id],
          (err) => {
            if (err) {
              reject(new AppError('Error deleting old type-phase relationships', 500));
              return;
            }
          }
        );
  
        // Insertar nuevas relaciones en `NMN_TYPE_PRO_PHASE`
        if (phases && phases.length > 0) {
          const insertPhaseStmt = this.db.prepare(
            `INSERT INTO NMN_TYPE_PRO_PHASE (id_type_project, id_phase, created_by, created_at) 
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)`
          );
  
          phases.forEach((phase) => {
            insertPhaseStmt.run([id, phase.id, userId], (err) => {
              if (err) {
                reject(new AppError('Error inserting new type-phase relationships', 500));
              }
            });
          });
  
          insertPhaseStmt.finalize((err) => {
            if (err) {
              reject(new AppError('Error finalizing type-phase relationship insertion', 500));
              return;
            }
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  }
  

  async deleteType(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE NMN_TYPE_PROJECT SET delete_mark = 1 WHERE id = ?`,
        [id],
        (err) => {
          if (err) {
            reject(new AppError('Error marking type as deleted', 500));
          } else {
            resolve();
          }
        }
      );
    });
  }
  
}
