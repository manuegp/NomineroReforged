import { Database } from 'sqlite3';
import { Department } from '../models/department.model';
import { AppError } from '../utils/errorHandler';

export class DepartmentService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async getAllDepartments(): Promise<Department[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM NMN_DEPARTAMENT WHERE delete_mark = 0', (err, rows) => {
        if (err) {
          reject(new AppError('Error fetching departments', 500));
        } else {
          resolve(rows as Department[]);
        }
      });
    });
  }

  async getDepartmentById(id: number): Promise<Department | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM NMN_DEPARTAMENT WHERE id = ? AND delete_mark = 0', [id], (err, row) => {
        if (err) {
          reject(new AppError('Error fetching department', 500));
        } else {
          resolve(row as Department | null);
        }
      });
    });
  }

  async createDepartment(department: Omit<Department, 'id'>): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO NMN_DEPARTAMENT 
        (name, delete_mark, created_by, created_at, updated_by, updated_at) 
        VALUES (?, 0, ?, CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP)`,
        [department.name, department.created_by, null],
        function (this: { lastID: number }, err) {
          if (err) {
            reject(new AppError('Error creating department', 500));
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  async updateDepartment(id: number, department: Partial<Department>): Promise<void> {
    const { name, updated_by } = department;
    const updateFields: string[] = [];
    const values: any[] = [];

    if (name) {
      updateFields.push('name = ?');
      values.push(name);
    }
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    if (updated_by) {
      updateFields.push('updated_by = ?');
      values.push(updated_by);
    }

    values.push(id);

    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE NMN_DEPARTAMENT SET ${updateFields.join(', ')} WHERE id = ? AND delete_mark = 0`,
        values,
        (err) => {
          if (err) {
            reject(new AppError('Error updating department', 500));
          } else {
            resolve();
          }
        }
      );
    });
  }

  async deleteDepartment(id: number, updatedBy: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE NMN_DEPARTAMENT SET delete_mark = 1, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE id = ? AND delete_mark = 0',
        [updatedBy, id],
        (err) => {
          if (err) {
            reject(new AppError('Error deleting department', 500));
          } else {
            resolve();
          }
        }
      );
    });
  }

  async getDepartmentsByUserId(userId: number): Promise<Department[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT d.* FROM NMN_DEPARTAMENT d
         INNER JOIN NMN_USER_DEPARTMENT ud ON d.id = ud.ID_DEPART
         WHERE ud.ID_USER = ? AND d.delete_mark = 0 AND ud.delete_mark = 0`,
        [userId],
        (err, rows) => {
          if (err) {
            reject(new AppError('Error fetching user departments', 500));
          } else {
            resolve(rows as Department[]);
          }
        }
      );
    });
  }

  async addUserToDepartment(userId: number, departmentId: number, createdBy: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO NMN_USER_DEPARTMENT 
        (ID_DEPART, ID_USER, delete_mark, created_by, created_at, updated_by, updated_at, modify_by) 
        VALUES (?, ?, 0, ?, CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP, ?)`,
        [departmentId, userId, createdBy, createdBy, createdBy],
        (err) => {
          if (err) {
            reject(new AppError('Error adding user to department', 500));
          } else {
            resolve();
          }
        }
      );
    });
  }

  async removeUserFromDepartment(userId: number, departmentId: number, updatedBy: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE NMN_USER_DEPARTMENT SET delete_mark = 1, updated_by = ?, updated_at = CURRENT_TIMESTAMP, modify_by = ? WHERE ID_USER = ? AND ID_DEPART = ? AND delete_mark = 0',
        [updatedBy, updatedBy, userId, departmentId],
        (err) => {
          if (err) {
            reject(new AppError('Error removing user from department', 500));
          } else {
            resolve();
          }
        }
      );
    });
  }

  async hasUsersInDepartment(departmentId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT COUNT(*) AS userCount 
         FROM NMN_USER_DEPARTMENT 
         WHERE ID_DEPART = ? AND delete_mark = 0`,
        [departmentId],
        (err, row:any) => {
          if (err) {
            reject(new AppError('Error checking users in department', 500));
          } else {
            resolve(row.userCount > 0); // Retorna true si hay usuarios
          }
        }
      );
    });
  }
  
}