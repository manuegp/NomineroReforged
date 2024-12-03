import { Database } from 'sqlite3';
import { AppError } from '../utils/errorHandler';
import { Client } from '../models/client.model';



export class ClientService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  // Obtener todos los clientes
  async getAllClients(): Promise<Client[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM NMN_CLIENT',
        (err, rows) => {
          if (err) {
            reject(new AppError('Error fetching clients', 500));
          } else {
            resolve(rows as Client[]);
          }
        }
      );
    });
  }

  // Obtener un cliente por ID
  async getClientById(id: number): Promise<Client | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM NMN_CLIENT WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            reject(new AppError('Error fetching client', 500));
          } else {
            resolve(row as Client | null);
          }
        }
      );
    });
  }

  // Crear un nuevo cliente
  async createClient(client: Omit<Client, 'id'>): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO NMN_CLIENT 
        (name, contact, created_by, created_at) 
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
        [client.name, client.contact, client.created_by],
        function (this: { lastID: number }, err) {
          if (err) {
            reject(new AppError('Error creating client', 500));
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  // Actualizar un cliente por ID
  async updateClient(id: number, client: Partial<Client>): Promise<void> {
    const { name, contact, updated_by } = client;
    const updateFields: string[] = [];
    const values: any[] = [];

    if (name) {
      updateFields.push('name = ?');
      values.push(name);
    }
    if (contact) {
      updateFields.push('contact = ?');
      values.push(contact);
    }
    if (updated_by) {
      updateFields.push('updated_by = ?');
      values.push(updated_by);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE NMN_CLIENT SET ${updateFields.join(', ')} WHERE id = ?`,
        values,
        (err) => {
          if (err) {
            reject(new AppError('Error updating client', 500));
          } else {
            resolve();
          }
        }
      );
    });
  }

  // Eliminar un cliente por ID
  async deleteClient(id: number, updated_by: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM NMN_CLIENT WHERE id = ?',
        [id],
        (err) => {
          if (err) {
            reject(new AppError('Error deleting client', 500));
          } else {
            resolve();
          }
        }
      );
    });
  }
}
