import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errorHandler';

export const validateTypeData = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body;

  if (!name || name.length < 2 || name.length > 50) {
    return next(new AppError('Name must be between 2 and 50 characters', 400));
  }

  next();
};
