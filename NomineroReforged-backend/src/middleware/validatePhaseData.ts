import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errorHandler';
import { verifyToken } from '../utils/jwtUtils';

export const validatePhaseData = (req: Request, res: Response, next: NextFunction) => {
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

    // Asignar el ID del usuario desde el token
    if (method === 'POST') {
      req.body.created_by = decoded.id;
    } else if (method === 'PUT') {
      req.body.updated_by = decoded.id;
    }

    // Validar los campos requeridos según el método HTTP
    const requiredFields: { [key: string]: string[] } = {
      POST: ['id_phase', 'name'],
      PUT: ['name'], // En PUT, `id_phase` no es obligatorio, pero `name` sí.
    };

    if (method === 'POST' || method === 'PUT') {
      // Validar campos faltantes
      const missingFields = requiredFields[method].filter((field) => !(field in body));
      if (missingFields.length > 0) {
        return next(new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400));
      }

      // Validar que el campo `id_phase` tenga una longitud válida (solo para POST)
      if (method === 'POST' && body.id_phase && (body.id_phase.length < 3 || body.id_phase.length > 10)) {
        return next(new AppError('id_phase must be between 3 and 10 characters', 400));
      }

      // Validar que el campo `name` tenga una longitud válida
      if (body.name && (body.name.length < 2 || body.name.length > 50)) {
        return next(new AppError('Name must be between 2 and 50 characters', 400));
      }
    }

    next();
  } catch (error) {
    return next(new AppError('Invalid or expired token', 401));
  }
};
