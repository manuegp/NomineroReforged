import { Request, Response, NextFunction } from 'express';
import { DepartmentService } from '../services/department.service';
import { Department } from '../models/department.model';
import { AppError } from '../utils/errorHandler';
import { getUserIdFromToken } from '../utils/jwtUtils';

export class DepartmentController {
  private departmentService: DepartmentService;

  constructor(departmentService: DepartmentService) {
    this.departmentService = departmentService;
  }

  async getAllDepartments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const departments = await this.departmentService.getAllDepartments();
      res.json(departments);
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const department = await this.departmentService.getDepartmentById(id);
      if (department) {
        res.json(department);
      } else {
        throw new AppError('Department not found', 404);
      }
    } catch (error) {
      next(error);
    }
  }

  async createDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const departmentData: Omit<Department, 'id'> = {
        ...req.body,
        delete_mark: 0
      };
      
      const id = await this.departmentService.createDepartment(departmentData);
      res.status(201).json({ 
        id, 
        ...departmentData
      });
    } catch (error) {
      next(error);
    }
  }

  async updateDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const department: Partial<Department> = {
        ...req.body,
      };
      await this.departmentService.updateDepartment(id, department);
      res.status(200).json({ message: 'Department updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const updatedBy = getUserIdFromToken(req.headers.authorization!); // Obtener ID desde el token
  
      await this.departmentService.deleteDepartment(id, updatedBy);
      res.status(200).json({ message: 'Department deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
  


}