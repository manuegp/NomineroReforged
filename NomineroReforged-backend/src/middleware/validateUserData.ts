import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errorHandler';

export const validateUserData = (req: Request, res: Response, next: NextFunction) => {
  const { method, body } = req;

  // Campos requeridos según el método HTTP
  const requiredFields: { [key: string]: string[] } = {
    POST: ['name', 'surname', 'email', 'password', 'is_active', 'is_admin', 'is_superadmin', 'department_id'],
    PUT: ['name', 'surname', 'email', 'is_active', 'is_admin', 'is_superadmin', 'department_id'],
  };

  if (method === 'POST' || method === 'PUT') {
    // Validar campos faltantes
    const missingFields = requiredFields[method].filter((field) => !(field in body));

    if (missingFields.length > 0) {
      return next(new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400));
    }

    // Validar campos prohibidos en PUT
    if (method === 'PUT') {
      if ('created_by' in body) {
        return next(new AppError('created_by should not be present in PUT requests', 400));
      }

      if ('password' in body) {
        return next(new AppError('password should not be present in PUT requests', 400));
      }
    }

    // Validar formato de correo electrónico
    if (body.email && !isValidEmail(body.email)) {
      return next(new AppError('Invalid email format', 400));
    }

    // Validar contraseña (solo en POST)
    if (method === 'POST' && (!body.password || body.password.trim() === '')) {
      return next(new AppError('Password cannot be empty', 400));
    }

    // Validar que `is_active` sea un booleano
    if (typeof body.is_active !== 'boolean') {
      return next(new AppError('is_active must be a boolean', 400));
    }

    // Validar que `is_admin` e `is_superadmin` sean booleanos
    if (typeof body.is_admin !== 'boolean' || typeof body.is_superadmin !== 'boolean') {
      return next(new AppError('is_admin and is_superadmin must be boolean values', 400));
    }

    // Validar que un usuario no sea tanto admin como superadmin
    if (body.is_admin && body.is_superadmin) {
      return next(new AppError('A user cannot be both admin and superadmin', 400));
    }


    // Validar `department_id` en POST y PUT
    if (!body.department_id || typeof body.department_id !== 'number') {
      return next(new AppError('department_id must be a valid department ID', 400));
    }

    // Validar longitud de name y surname
    if (body.name.length < 2 || body.name.length > 50) {
      return next(new AppError('Name must be between 2 and 50 characters', 400));
    }

    if (body.surname.length < 2 || body.surname.length > 50) {
      return next(new AppError('Surname must be between 2 and 50 characters', 400));
    }
  }

  next();
};

// Función para validar correos electrónicos
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
