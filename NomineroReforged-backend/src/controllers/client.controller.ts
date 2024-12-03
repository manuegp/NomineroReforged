import { Request, Response, NextFunction } from 'express';
import { ClientService } from '../services/client.service';
import { Client } from '../models/client.model';
import { AppError } from '../utils/errorHandler';
import { getUserIdFromToken } from '../utils/jwtUtils';

export class ClientController {
  private clientService: ClientService;

  constructor(clientService: ClientService) {
    this.clientService = clientService;
  }

  // Obtener todos los clientes
  async getAllClients(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clients = await this.clientService.getAllClients();
      res.status(200).json(clients);
    } catch (error) {
      next(error);
    }
  }

  // Obtener un cliente por ID
  async getClientById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new AppError('Invalid client ID', 400);
      }

      const client = await this.clientService.getClientById(id);
      if (!client) {
        throw new AppError('Client not found', 404);
      }

      res.status(200).json(client);
    } catch (error) {
      next(error);
    }
  }

  // Crear un nuevo cliente
  async createClient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = getUserIdFromToken(req.headers.authorization!);
      const clientData: Omit<Client, 'id'> = {
        ...req.body,
        created_by: userId,
      };

      const clientId = await this.clientService.createClient(clientData);
      res.status(201).json({ id: clientId, ...clientData });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar un cliente por ID
  async updateClient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new AppError('Invalid client ID', 400);
      }

      const userId = getUserIdFromToken(req.headers.authorization!);
      const clientData: Partial<Client> = {
        ...req.body,
        updated_by: userId,
      };

      await this.clientService.updateClient(id, clientData);
      res.status(200).json({ message: 'Client updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar un cliente por ID
  async deleteClient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new AppError('Invalid client ID', 400);
      }

      const userId = getUserIdFromToken(req.headers.authorization!);
      await this.clientService.deleteClient(id, userId);
      res.status(200).json({ message: 'Client deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
