import { Database } from 'sqlite3';
import { Project } from '../models/project.model';
import { AppError } from '../utils/errorHandler';

export class ProjectService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async getAllProjects(): Promise<Project[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `
        SELECT 
          p.*,
          GROUP_CONCAT(ph.id || ':' || ph.name) AS phases
        FROM 
          NMN_PROJECTS p
        LEFT JOIN 
          NMN_TYPE_PRO_PHASE tp ON p.type = tp.id_type_project
        LEFT JOIN 
          NMN_PHASE ph ON tp.id_phase = ph.id
        WHERE 
          p.delete_mark = 0
        GROUP BY 
          p.id
        `,
        (err, rows) => {
          if (err) {
            reject(new AppError('Error fetching projects with phases', 500));
          } else {
            const projects = rows.map((row: any) => ({
              ...row,
              phases: row.phases ? row.phases.split(',').map((phase: string) => {
                const [id, name] = phase.split(':');
                return { id: Number(id), name };
              }) : [],
            }));
            resolve(projects as Project[]);
          }
        }
      );
    });
  }
  

  async getProjectById(id: number): Promise<Project | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM NMN_PROJECTS WHERE id = ? AND delete_mark = 0',
        [id],
        (err, row) => {
          if (err) reject(new AppError('Error fetching project', 500));
          else resolve(row as Project | null);
        }
      );
    });
  }

  async createProject(project: Omit<Project, 'id'>): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO NMN_PROJECTS 
        (code, name, client, estimated, date_start, date_end, description, type, department, created_by, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          project.code,
          project.name,
          project.client,
          project.estimated,
          project.date_start,
          project.date_end,
          project.description,
          project.type,
          project.department,
          project.created_by,
        ],
        function (this: { lastID: number }, err) {
          if (err) reject(new AppError('Error creating project', 500));
          else resolve(this.lastID);
        }
      );
    });
  }

  async updateProject(id: number, project: Partial<Project>): Promise<void> {
    const { code, name, client, estimated, date_start, date_end, description, type, department, updated_by } = project;
    const updateFields: string[] = [];
    const values: any[] = [];

    if (code) {
      updateFields.push('code = ?');
      values.push(code);
    }
    if (name) {
      updateFields.push('name = ?');
      values.push(name);
    }
    if (client) {
      updateFields.push('client = ?');
      values.push(client);
    }
    if (estimated) {
      updateFields.push('estimated = ?');
      values.push(estimated);
    }
    if (date_start) {
      updateFields.push('date_start = ?');
      values.push(date_start);
    }
    if (date_end) {
      updateFields.push('date_end = ?');
      values.push(date_end);
    }
    if (description) {
      updateFields.push('description = ?');
      values.push(description);
    }
    if (type) {
      updateFields.push('type = ?');
      values.push(type);
    }
    if (department) {
      updateFields.push('department = ?');
      values.push(department);
    }
    if (updated_by) {
      updateFields.push('updated_by = ?');
      values.push(updated_by);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE NMN_PROJECTS SET ${updateFields.join(', ')} WHERE id = ? AND delete_mark = 0`,
        values,
        (err) => {
          if (err) reject(new AppError('Error updating project', 500));
          else resolve();
        }
      );
    });
  }

  async deleteProject(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE NMN_PROJECTS SET delete_mark = 1 WHERE id = ?',
        [id],
        (err) => {
          if (err) reject(new AppError('Error deleting project', 500));
          else resolve();
        }
      );
    });
  }
}
