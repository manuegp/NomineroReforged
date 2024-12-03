import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { AppError } from '../utils/errorHandler';
import { getUserIdFromToken, verifyToken } from '../utils/jwtUtils';

export class UserController {
  private userService: UserService;
  departments: { name: string }[] = [];

  constructor(userService: UserService) {
    this.userService = userService;
  }

  // Obtener todos los usuarios
  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let users;
      const authHeader = req.headers.authorization!.split(' ')
      const headers = verifyToken(authHeader[1]);
      if(headers.is_superadmin == 1 && headers.is_admin == 0){
         users = await this.userService.getAllUsers();
      }else if(headers.is_superadmin == 0 && headers.is_admin == 1){
         users = await this.userService.getAllUsersByDepartmentId(headers.department_id);
      }
      
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  // Obtener usuario por ID
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const user = await this.userService.getUserById(id);

      if (user) {
        res.json(user);
      } else {
        next(new AppError('User not found', 404));
      }
    } catch (error) {
      next(error);
    }
  }

  // Crear un nuevo usuario
  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData: User = req.body;
  
      // Agregar la fecha actual al campo created_at
      userData.created_at = new Date().toISOString(); // Fecha en formato ISO 8601
      userData.created_by = getUserIdFromToken(req.headers.authorization!);
      const id = await this.userService.createUser(userData);
  
      res.status(201).json({
        id,
        ...userData,
        password: undefined, // No devolver la contraseña en la respuesta
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar un usuario existente
  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log("Entra al update")
      const id = parseInt(req.params.id);
      const userData: Partial<User> = req.body;
      userData.updated_by = getUserIdFromToken(req.headers.authorization!);
      // Validar roles
      if (userData.is_admin && userData.is_superadmin) {
        throw new AppError('User cannot be both admin and superadmin', 400);
      }

      await this.userService.updateUser(id, userData);
      res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar un usuario (marcar como eliminado)
  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      const updatedBy = getUserIdFromToken(req.headers.authorization!);
      if (!updatedBy) {
        throw new AppError('Updated_by field is required', 400);
      }

      await this.userService.deleteUser(id, updatedBy);
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Inicio de sesión
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError('Email and password are required', 400);
      }

      const result = await this.userService.login(email, password);

      if (result) {
        res.json({
          message: 'Login successful',
          user: result.user,
          token: result.token,
        });
      } else {
        throw new AppError('Invalid email or password', 401);
      }
    } catch (error) {
      next(error);
    }
  }
}
