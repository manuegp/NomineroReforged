import { Database } from 'sqlite3';
import { User } from '../models/user.model';
import { AppError } from '../utils/errorHandler';
import bcrypt from 'bcrypt';
import { generateToken, getUserIdFromToken } from '../utils/jwtUtils';

export class UserService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async getAllUsers(): Promise<(User & { department_id: number | null; department_name: string | null })[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT 
           u.*, 
           d.id AS department_id, 
           d.name AS department_name
         FROM NMN_USER u
         LEFT JOIN NMN_USER_DEPARTMENT ud ON u.id = ud.ID_USER
         LEFT JOIN NMN_DEPARTAMENT d ON ud.ID_DEPART = d.id
         WHERE u.delete_mark = 0 
           AND (ud.delete_mark = 0 OR ud.delete_mark IS NULL)
           AND (d.delete_mark = 0 OR d.delete_mark IS NULL)`, 
        (err:any, rows:any) => {
          if (err) {
            reject(err);
          } else {
            resolve(
              rows.map((row: any) => {
                const { password, ...userWithoutPassword } = row;
                return {
                  ...userWithoutPassword,
                  department_id: row.department_id || null,
                  department_name: row.department_name || null,
                } as User & { department_id: number | null; department_name: string | null };
              })
            );
          }
        }
      );
    });
  }
  
  
  
  

  async getAllUsersByDepartmentId(department_id: number): Promise<(Omit<User, 'password'> & { department_id: number })[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT u.id, u.name, u.surname, u.email, u.is_admin, u.is_superadmin, u.is_active, u.delete_mark,
                ud.id_depart AS department_id
         FROM nmn_user u
         JOIN nmn_user_department ud ON u.id = ud.id_user
         WHERE ud.id_depart = ? AND u.delete_mark = 0`,
        [department_id],
        (err, rows) => {
          if (err) {
            return reject(new AppError('Error retrieving users by department', 500));
          }
  
          // Cast explícito para que TypeScript reconozca el tipo correcto
          resolve(
            rows.map((row:any) => ({
              id: row.id,
              name: row.name,
              surname: row.surname,
              email: row.email,
              is_admin: row.is_admin,
              is_superadmin: row.is_superadmin,
              is_active: row.is_active,
              delete_mark: row.delete_mark,
              department_id: row.department_id,
            })) as (Omit<User, 'password'> & { department_id: number })[]
          );
        }
      );
    });
  }
  
  
  

  async getUserById(id: number): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM NMN_USER WHERE id = ? AND delete_mark = 0', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as User | null);
        }
      });
    });
  }

  async createUser(user: User): Promise<number> {
    const db = this.db;
  
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
  
        const saltRounds = 10;
  
        bcrypt.hash(user.password, saltRounds)
          .then((hashedPassword) => {
            // Determinar los valores de is_admin e is_superadmin basados en las reglas
            const isAdmin = user.is_admin ? 1 : 0;
            const isSuperAdmin = user.is_superadmin ? 1 : 0;
            // Si no se proporciona `created_at`, asignar la fecha actual
            const createdAt = user.created_at || new Date().toISOString();
  
            // Insertar el usuario en NMN_USER
            db.run(
              `INSERT INTO NMN_USER 
              (name, surname, email, password, is_admin, is_superadmin, is_active, delete_mark, created_at, created_by) 
              VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
              [user.name, user.surname, user.email, hashedPassword, isAdmin, isSuperAdmin, user.is_active, createdAt, user.created_by],
              function (this: { lastID: number }, err) {
                if (err) {
                  db.run('ROLLBACK');
                  return reject(new AppError('Error creating user', 500));
                }
  
                const userId = this.lastID;
  
                // Validar que el department_id esté presente
                if (!user.department_id) {
                  db.run('ROLLBACK');
                  return reject(new AppError('Department ID is required', 400));
                }
  
                // Insertar la relación en NMN_USER_DEPARTMENT
                db.run(
                  `INSERT INTO NMN_USER_DEPARTMENT (id_user, id_depart, delete_mark, created_at, created_by)
                  VALUES (?, ?, 0, ?, ?)`,
                  [userId, user.department_id, createdAt, user.created_by],
                  (err) => {
                    if (err) {
                      db.run('ROLLBACK');
                      return reject(new AppError('Error assigning department to user', 500));
                    }
  
                    // Confirmar la transacción
                    db.run('COMMIT', (err) => {
                      if (err) {
                        db.run('ROLLBACK');
                        return reject(new AppError('Error committing transaction', 500));
                      }
                      resolve(userId);
                    });
                  }
                );
              }
            );
          })
          .catch((err) => {
            db.run('ROLLBACK');
            reject(new AppError('Error hashing password', 500));
          });
      });
    });
  }

  async updateUser(id: number, user: Partial<User>): Promise<void> {
    const { 
      name, 
      surname, 
      email, 
      password, 
      is_active, 
      updated_by, 
      department_id, 
      is_admin, 
      is_superadmin 
    } = user;
    const updateFields: string[] = [];
    const values: any[] = [];

    // Agregar campos al arreglo de actualizaciones
    if (name) {
      updateFields.push('name = ?');
      values.push(name);
    }
    if (surname) {
      updateFields.push('surname = ?');
      values.push(surname);
    }
    if (email) {
      updateFields.push('email = ?');
      values.push(email);
    }
    if (password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateFields.push('password = ?');
      values.push(hashedPassword);
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      values.push(is_active);
    }
    if (is_admin !== undefined) {
      updateFields.push('is_admin = ?');
      values.push(is_admin);
    }
    if (is_superadmin !== undefined) {
      updateFields.push('is_superadmin = ?');
      values.push(is_superadmin);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    if (updated_by) {
      updateFields.push('updated_by = ?');
      values.push(updated_by);
    }

    values.push(id);

    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');

        this.db.run(
          `UPDATE NMN_USER SET ${updateFields.join(', ')} WHERE id = ? AND delete_mark = 0`,
          values,
          (err) => {
            if (err) {
              this.db.run('ROLLBACK');
              return reject(err);
            }

            // Actualizar el departamento si se proporciona
            if (department_id !== undefined) {
              this.db.run(
                `UPDATE NMN_USER_DEPARTMENT 
                SET ID_DEPART = ?, UPDATED_AT = CURRENT_TIMESTAMP, UPDATED_BY = ? 
                WHERE ID_USER = ? AND DELETE_MARK = 0`,
                [department_id, updated_by, id],
                (err) => {
                  if (err) {
                    this.db.run('ROLLBACK');
                    return reject(new AppError('Error updating user department', 500));
                  }

                  this.db.run('COMMIT', (err) => {
                    if (err) {
                      this.db.run('ROLLBACK');
                      return reject(new AppError('Error committing transaction', 500));
                    }
                    resolve();
                  });
                }
              );
            } else {
              this.db.run('COMMIT', (err) => {
                if (err) {
                  this.db.run('ROLLBACK');
                  return reject(new AppError('Error committing transaction', 500));
                }
                resolve();
              });
            }
          }
        );
      });
    });
  }


  async deleteUser(id: number, updatedBy: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE NMN_USER SET delete_mark = 1, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE id = ? AND delete_mark = 0',
        [updatedBy, id],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async login(email: string, password: string): Promise<{ user: Partial<User>, token: string } | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT u.*, 
                d.id AS department_id
         FROM NMN_USER u
         LEFT JOIN NMN_USER_DEPARTMENT ud ON u.id = ud.id_user
         LEFT JOIN NMN_DEPARTAMENT d ON ud.id_depart = d.id
         WHERE TRIM(u.email) = ? AND u.delete_mark = 0 AND u.is_active = 1` ,
        [email],
        async (err, row) => {
          if (err) {
            return reject(new AppError('An error occurred during login', 500));
          }
  
          if (!row) {
            return resolve(null); // Usuario no encontrado
          }
  
          const user = row as User & { department_id: number | null };
  
          try {
            // Asegurarse de que el hash no tenga saltos de línea o espacios extra
            const storedPassword = user.password.trim();
            const passwordMatch = await bcrypt.compare(password, storedPassword);
  
            if (passwordMatch) {
              const token = generateToken(user);
              const { password, ...userWithoutPassword } = user;
              return resolve({
                user: userWithoutPassword,
                token,
              });
            } else {
              return resolve(null); // Contraseña no coincide
            }
          } catch (error) {
            return reject(new AppError('Error verifying password', 500));
          }
        }
      );
    });
  }
  

}
