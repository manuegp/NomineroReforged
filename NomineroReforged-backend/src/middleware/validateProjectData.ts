import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errorHandler';

export const validateProjectData = (req: Request, res: Response, next: NextFunction) => {
  const { code, name, client, estimated, type, department } = req.body;

  if (!code || !name || !client || !estimated  || !type || !department) {
    return next(new AppError('Missing required fields', 400));
  }

  if (code.length < 3 || code.length > 10) {
    return next(new AppError('Code must be between 3 and 10 characters', 400));
  }

  if (name.length < 2 || name.length > 50) {
    return next(new AppError('Name must be between 2 and 50 characters', 400));
  }

  next();
};
