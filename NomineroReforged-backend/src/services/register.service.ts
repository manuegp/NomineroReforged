import { Register } from "@/models/register.model";
import { AppError } from "../utils/errorHandler";
import { Database } from "sqlite3";
import { spawn } from "child_process";
import fs from 'fs';
import path from "path";

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
        filters.push("date >= ?");
        values.push(from);
      }

      if (to) {
        filters.push("date <= ?");
        values.push(to);
      }

      const whereClause =
        filters.length > 0 ? `AND ${filters.join(" AND ")}` : "";

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
            reject(new AppError("Error retrieving registers by user", 500));
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

  async addRegister(register: Omit<Register, "id">): Promise<number> {
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
          reject(new AppError("Error adding register", 500));
        } else {
          resolve(this.lastID); // Devuelve el ID del nuevo registro
        }
      });
    });
  }

  async updateRegister(register: Register, id: number): Promise<void> {
    const { user, project, phase, date, time, is_extra, coment } = register;
    const updateFields: string[] = [];
    const values: any[] = [];

    if (user) {
      updateFields.push("user = ?");
      values.push(user);
    }
    if (project) {
      updateFields.push("project = ?");
      values.push(project);
    }
    if (phase) {
      updateFields.push("phase = ?");
      values.push(phase);
    }
    if (date) {
      updateFields.push("date = ?");
      values.push(date);
    }
    if (time) {
      updateFields.push("time = ?");
      values.push(time);
    }
    if (is_extra) {
      updateFields.push("is_extra = ?");
      values.push(is_extra);
    }
    if (coment) {
      updateFields.push("coment = ?");
      values.push(coment);
    }
    updateFields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);
    return new Promise((resolve, reject) => {
      this.db.run(
        `
        UPDATE NMN_REGISTERS SET ${updateFields.join(
          ", "
        )} WHERE id = ? AND delete_mark = 0
        `,
        values,
        (err) => {
          if (err) reject(new AppError("Error updating project", 500));
          else resolve();
        }
      );
    });
  }

  async deleteRegister(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE NMN_REGISTERS SET delete_mark = 1 WHERE id = ?`,
        [id],
        (err) => {
          if (err) {
            reject(new AppError("Error deleting", 500));
          } else {
            resolve();
          }
        }
      );
    });
  }

  async generateReport(reportData: any): Promise<{ jsonName: string; xlsxName: string }> {
    return new Promise((resolve, reject) => {
      // Creamos un marcador de posición para cada ID de usuario
      const userPlaceholders = reportData.users.map(() => '?').join(', ');
      const sqlQuery = `
        SELECT 
          user, 
          pro.name AS projectCode, 
          pha.name AS id_phase, 
          date, 
          time, 
          coment
        FROM 
          NMN_REGISTERS REG
        JOIN 
          NMN_PROJECTS PRO 
          ON PRO.id = REG.project
        JOIN 
          NMN_PHASE PHA 
          ON PHA.id = REG.phase
        WHERE 
          REG.date BETWEEN ? AND ?
          AND REG.user IN (${userPlaceholders})
          AND REG.delete_mark = FALSE;
      `;
  
      const queryParams = [reportData.fromDate, reportData.toDate, ...reportData.users];
  
      this.db.all(sqlQuery, queryParams, (err, rows) => {
        if (err) {
          reject(new AppError("Error getting users", 500));
        } else {
          const data = rows.map((row: any) => ({
            ...row,
            tasa: "",
            company: "20055",
            clasificacion_hora: "HN",
          }));
  
          const randomName = `${Math.floor(100 + Math.random() * 900)}.json`;
          fs.writeFile(`data/temporary/json/${randomName}`, JSON.stringify(data), async (err) => {
            if (err) {
              console.error(`Error writing file ${randomName}: ${err}`);
            } else {
              console.log(`Successfully wrote file ${randomName}`);
              const xlsxName = await this.getExcel(randomName);
              resolve({ xlsxName, jsonName: randomName });
            }
          });
        }
      });
    });
  }
  
   async getExcel(jsonFileName: string):Promise<string>{
    return new Promise((resolve, reject) => {
      const pythonScriptPath = path.resolve(__dirname, 'main.py');
      const jsonPath = path.resolve(__dirname, '..','..', 'data','temporary','json',`${jsonFileName}`);

      const randomNameXLSX = Math.floor(100 + Math.random() * 900).toString() + '.xlsx';
      const pythonProcess = spawn('python', [pythonScriptPath, '-i', jsonPath, '-o', randomNameXLSX]);
      let output = '';
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    // Capturar errores estándar (stderr) del script
    let errorOutput = '';
    pythonProcess.stderr.on('data', (data) => { 
      errorOutput += data.toString();
    });

    // Manejar cierre del proceso
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        resolve(randomNameXLSX); // El proceso terminó exitosamente
      } else {
        reject(new Error(`El proceso de Python terminó con código ${code}: ${errorOutput}`));
      }
    });

    // Manejar errores en la ejecución
    pythonProcess.on('error', (err) => {
      reject(err);
    });
    });

   }
}
