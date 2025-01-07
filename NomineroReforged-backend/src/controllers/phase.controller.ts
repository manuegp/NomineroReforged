import { Request, Response, NextFunction } from 'express';
import { PhaseService } from '../services/phase.service';
import { Phase } from '../models/phase.model';
import { AppError } from '../utils/errorHandler';
import { getUserIdFromToken } from '../utils/jwtUtils';

export class PhaseController {
  private phaseService: PhaseService;

  constructor(phaseService: PhaseService) {
    this.phaseService = phaseService;
  }

  // Obtener todas las fases
  async getAllPhases(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const phases = await this.phaseService.getAllPhases();
      res.status(200).json(phases);
    } catch (error) {
      next(error);
    }
  }

  // Obtener una fase por ID
  async getPhaseById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new AppError('Invalid phase ID', 400);
      }

      const phase = await this.phaseService.getPhaseById(id);
      if (!phase) {
        throw new AppError('Phase not found', 404);
      }

      res.status(200).json(phase);
    } catch (error) {
      next(error);
    }
  }

  async getPhasesByProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const projectIds: number[] = req.body.projectIds; // Espera recibir un array de IDs de proyectos
  
      if (!Array.isArray(projectIds) || projectIds.length === 0) {
        throw new AppError('Project IDs are required and must be an array.', 400);
      }
  
      const phases = await this.phaseService.getPhasesByProjectIds(projectIds);
      res.status(200).json(phases);
    } catch (error) {
      next(error);
    }
  }
  

  // Crear una nueva fase
  async createPhase(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = getUserIdFromToken(req.headers.authorization!); // Obtener el ID del usuario desde el token
      const phaseData: Omit<Phase, 'id' | 'created_by'> = {
        ...req.body,
      };

      const phaseId = await this.phaseService.createPhase({ ...phaseData, created_by: userId });
      res.status(201).json({ id: phaseId, ...phaseData });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar una fase por ID
  async updatePhase(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new AppError('Invalid phase ID', 400);
      }

      const userId = getUserIdFromToken(req.headers.authorization!); // Obtener el ID del usuario desde el token
      const phaseData: Partial<Phase> = {
        ...req.body,
        updated_by: userId, // Asignar automáticamente
      };

      await this.phaseService.updatePhase(id, phaseData);
      res.status(200).json({ message: 'Phase updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar una fase por ID
  async deletePhase(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new AppError('Invalid phase ID', 400);
      }

      const userId = getUserIdFromToken(req.headers.authorization!); // Obtener el ID del usuario desde el token
      await this.phaseService.deletePhase(id, userId);
      res.status(200).json({ message: 'Phase deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
