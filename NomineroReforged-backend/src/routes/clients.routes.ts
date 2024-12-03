import { Router } from 'express';
import { ClientController } from '../controllers/client.controller';
import { validateClientData } from '../middleware/validateClientData';
import { authMiddleware } from '../middleware/authMiddleware';

export function clientRoutes(clientController: ClientController): Router {
  const router = Router();
  router.use(authMiddleware);
  router.get('/', (req, res, next) => clientController.getAllClients(req, res, next));
  router.get('/:id', (req, res, next) => clientController.getClientById(req, res, next));
  router.post('/', validateClientData, (req, res, next) => clientController.createClient(req, res, next));
  router.put('/:id', validateClientData, (req, res, next) => clientController.updateClient(req, res, next));
  router.delete('/:id', (req, res, next) => clientController.deleteClient(req, res, next));

  return router;
}
