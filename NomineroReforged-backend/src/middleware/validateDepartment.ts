import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errorHandler';
import { verifyToken } from '../utils/jwtUtils';
import { DepartmentService } from '../services/department.service';


export const validateDepartmentData = (req: Request, res: Response, next: NextFunction) => {
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
  
      // Asignar el ID del usuario
      if (method === 'POST') {
        req.body.created_by = decoded.id;
      } else if (method === 'PUT') {
        req.body.updated_by = decoded.id;
      }
  
      // Validar los datos del cuerpo
      const requiredFields: { [key: string]: string[] } = {
        POST: ['name'],
        PUT: ['name'],
      };
  
      const missingFields = requiredFields[method]?.filter((field) => !(field in body));
      if (missingFields?.length > 0) {
        return next(new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400));
      }
  
      // Validar la longitud del campo `name`
      if (body.name && (body.name.length < 2 || body.name.length > 50)) {
        return next(new AppError('Name must be between 2 and 50 characters', 400));
      }
  
      next();
    } catch (error) {
      return next(new AppError('Invalid or expired token', 401));
    }
  };
  
export const validateDeleteDepartment = (departmentService: DepartmentService) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
  
      if (!id || isNaN(Number(id))) {
        return next(new AppError('Invalid department ID', 400));
      }
  
      try {
        const hasUsers = await departmentService.hasUsersInDepartment(Number(id));
  
        if (hasUsers) {
          return next(
            new AppError('Cannot delete department with associated users', 400)
          );
        }
  
        next();
      } catch (error) {
        next(error);
      }
    };
  };
