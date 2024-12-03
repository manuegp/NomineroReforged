import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateUserData } from '../middleware/validateUserData';
import { authMiddleware } from '../middleware/authMiddleware';

export function userRoutes(userController: UserController): Router {
  const router = Router();

  router.post('/login', (req, res, next) => userController.login(req, res, next));

  // Rutas protegidas
  router.get('/', authMiddleware, (req, res, next) => userController.getAllUsers(req, res, next));
  router.get('/:id', authMiddleware, (req, res, next) => userController.getUserById(req, res, next));
  router.post('/', authMiddleware, validateUserData, (req, res, next) => userController.createUser(req, res, next));
  router.put('/:id', authMiddleware, validateUserData, (req, res, next) => userController.updateUser(req, res, next));
  router.delete('/:id', authMiddleware, (req, res, next) => userController.deleteUser(req, res, next));

  return router;
}