import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service';
import { Project } from '../models/project.model';
import { AppError } from '../utils/errorHandler';
import { getUserIdFromToken } from '../utils/jwtUtils';

export class ProjectController {
  constructor(private projectService: ProjectService) {}

  async getAllProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const projects = await this.projectService.getAllProjects();
      res.status(200).json(projects);
    } catch (error) {
      next(error);
    }
  }

  async getProjectById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new AppError('Invalid project ID', 400);

      const project = await this.projectService.getProjectById(id);
      if (!project) throw new AppError('Project not found', 404);

      res.status(200).json(project);
    } catch (error) {
      next(error);
    }
  }

  async getEmployeesFromProjectById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new AppError('Invalid project ID', 400);

      const users = await this.projectService.getEmployeesFromProjectById(id);
      if (!users) throw new AppError('No hay empleados', 404);

      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  async asignEmployeesByProjectById(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = parseInt(req.params.id);
      const employees = req.body.users; // Array de usuarios enviados desde el frontend
  
      if (isNaN(projectId)) throw new AppError('Invalid project ID', 400);
      if (!Array.isArray(employees) || employees.length === 0) {
        throw new AppError('No users provided', 400);
      }
  
      // Llamada al servicio
      await this.projectService.asignEmployeesByProjectById(projectId, employees);
  
      res.status(200).json({
        message: 'Users assigned successfully',
        projectId: projectId,
        assignedUsers: employees.map((user) => user.id),
      });
    } catch (error) {
      next(error);
    }
  }
  
  async deleteEmployeeFromProject(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);
  
      // Validar parámetros
      if (isNaN(projectId)) throw new AppError('Invalid project ID', 400);
      if (isNaN(userId)) throw new AppError('Invalid user ID', 400);
  
      // Llamar al servicio para eliminar al usuario
      await this.projectService.deleteEmployeeFromProject(projectId, userId);
  
      res.status(200).json({
        message: 'User successfully removed from project',
        projectId,
        userId,
      });
    } catch (error) {
      next(error);
    }
  }
  

  async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getUserIdFromToken(req.headers.authorization!);
      const projectData = { ...req.body, created_by: userId };

      const projectId = await this.projectService.createProject(projectData);
      res.status(201).json({ id: projectId, ...projectData });
    } catch (error) {
      next(error);
    }
  }

  async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new AppError('Invalid project ID', 400);

      const userId = getUserIdFromToken(req.headers.authorization!);
      const projectData = { ...req.body, updated_by: userId };

      await this.projectService.updateProject(id, projectData);
      res.status(200).json({ message: 'Project updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new AppError('Invalid project ID', 400);

      await this.projectService.deleteProject(id);
      res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
