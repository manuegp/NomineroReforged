import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errorHandler';
import { verifyToken } from '../utils/jwtUtils';

export const validateClientData = (req: Request, res: Response, next: NextFunction) => {
  const { method, body, headers } = req;

  // Validar el token
  const token = headers.authorization?.split(' ')[1];
  if (!token) {
    return next(new AppError('Authorization token is required', 401));
  }

  try {
    const decoded: any = verifyToken(token);

    // Verificar si el usuario es superadministrador
    if (decoded.is_superadmin !== 1) {
      return next(new AppError('Only superadmins can perform this operation', 403));
    }

    // Asignar el ID del usuario que realiza la operación
    if (method === 'POST') {
      req.body.created_by = decoded.id;
    } else if (method === 'PUT') {
      req.body.updated_by = decoded.id;
    }

    // Campos requeridos según el método HTTP
    const requiredFields: { [key: string]: string[] } = {
      POST: ['name'],
      PUT: ['name'],
    };

    if (method === 'POST' || method === 'PUT') {
      // Validar campos faltantes
      const missingFields = requiredFields[method]?.filter((field) => !(field in body));
      if (missingFields?.length > 0) {
        return next(new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400));
      }

      // Validar que el campo `name` tenga una longitud válida
      if (body.name && (body.name.length < 2 || body.name.length > 50)) {
        return next(new AppError('Name must be between 2 and 50 characters', 400));
      }

      // Validar que el campo `contact`, si está presente, sea un correo electrónico válido
      if (body.contact && !isValidEmail(body.contact)) {
        return next(new AppError('Contact must be a valid email address', 400));
      }
    }

    next();
  } catch (error) {
    return next(new AppError('Invalid or expired token', 401));
  }
};

// Validar si un correo electrónico tiene un formato válido
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
