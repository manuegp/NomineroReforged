import { Router } from 'express';
import { TypeController } from '../controllers/types.controller';
import { validateTypeData } from '../middleware/validateType';
import { authMiddleware } from '../middleware/authMiddleware';

export function typeRoutes(typeController: TypeController): Router {
  const router = Router();
  router.use(authMiddleware);

  router.get('/', (req, res, next) => typeController.getAllTypes(req, res, next));
  router.get('/:id', (req, res, next) => typeController.getTypeById(req, res, next));
  router.post('/', validateTypeData, (req, res, next) => typeController.createType(req, res, next));
  router.put('/:id', validateTypeData, (req, res, next) => typeController.updateType(req, res, next));
  router.delete('/:id', (req, res, next) => typeController.deleteType(req, res, next));

  return router;
}
