import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwtUtils';
import { AppError } from '../utils/errorHandler';

export interface AuthRequest extends Request {
  user?: any;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;



  if (!authHeader) {
    return next(new AppError('No token provided', 401));
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return next(new AppError('Token error', 401));
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return next(new AppError('Token malformatted', 401));
  }



  try {
    const decoded = verifyToken(token);
    console.log('Decoded token:', decoded); // Log para debugging
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification error:', err); // Log para debugging
    next(new AppError('Invalid token', 401));
  }
}