import { Router } from 'express';
import { DepartmentController } from '../controllers/department.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateDeleteDepartment, validateDepartmentData } from '../middleware/validateDepartment';
import { DepartmentService } from '../services/department.service';

export function departmentRoutes(departmentController: DepartmentController, departmentService: DepartmentService): Router {
  const router = Router();

  // Aplicar authMiddleware a todas las rutas
  router.use(authMiddleware);

  // Obtener todos los departamentos
  router.get('/', (req, res, next) => departmentController.getAllDepartments(req, res, next));

  // Obtener departamento por id
  router.get('/:id', (req, res, next) => departmentController.getDepartmentById(req, res, next));

  // Crear nuevo departamento
  router.post(
    '/',
    validateDepartmentData, // Middleware de validación
    (req, res, next) => departmentController.createDepartment(req, res, next)
  );

  // Actualizar departamento
  router.put(
    '/:id',
    validateDepartmentData, // Middleware de validación
    (req, res, next) => departmentController.updateDepartment(req, res, next)
  );

  // Eliminar departamento
  router.delete(
    '/:id',
    validateDeleteDepartment(departmentService), // Middleware para validar eliminación
    (req, res, next) => departmentController.deleteDepartment(req, res, next)
  );

  return router;
}
