import { Request, Response, NextFunction } from 'express';
import { TypeService } from '../services/type.service';
import { Type } from '../models/type.model';
import { AppError } from '../utils/errorHandler';
import { getUserIdFromToken } from '../utils/jwtUtils';

export class TypeController {
  constructor(private typeService: TypeService) {}

  async getAllTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const types = await this.typeService.getAllTypes();
      res.status(200).json(types);
    } catch (error) {
      next(error);
    }
  }

  async getTypeById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new AppError('Invalid type ID', 400);

      const type = await this.typeService.getTypeById(id);
      if (!type) throw new AppError('Type not found', 404);

      res.status(200).json(type);
    } catch (error) {
      next(error);
    }
  }

  async createType(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getUserIdFromToken(req.headers.authorization!);
      const { name } = req.body;

      const typeId = await this.typeService.createType(req.body, userId);
      res.status(201).json({ id: typeId, name });
    } catch (error) {
      next(error);
    }
  }

  async updateType(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new AppError('Invalid type ID', 400);

      const userId = getUserIdFromToken(req.headers.authorization!);


      await this.typeService.updateType(id, req.body, userId);
      res.status(200).json({ message: 'Type updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteType(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new AppError('Invalid type ID', 400);

      await this.typeService.deleteType(id);
      res.status(200).json({ message: 'Type deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
