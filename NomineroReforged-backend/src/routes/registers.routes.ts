import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { RegisterController } from '@/controllers/register.controller';

export function registerRoutes(typeController: RegisterController): Router {
  const router = Router();
  router.use(authMiddleware);

  router.get('/:id', (req, res, next) => typeController.getAllRegistersByUserId(req, res, next));
  router.post('/', (req, res, next) => typeController.addRegister(req, res, next));
  router.put('/:id', (req, res, next) => typeController.updateRegister(req, res, next));
  router.delete('/:id', (req, res, next) => typeController.deleteRegister(req, res, next));
  router.post('/generateReport', (req, res, next) => typeController.generateReport(req, res, next));
 

  return router;
}