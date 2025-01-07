import { Router } from 'express';
import { PhaseController } from '../controllers/phase.controller';
import { validatePhaseData } from '../middleware/validatePhaseData';
import { authMiddleware } from '../middleware/authMiddleware';

export function phaseRoutes(phaseController: PhaseController): Router {
  const router = Router();
  router.use(authMiddleware);

  router.get('/', (req, res, next) => phaseController.getAllPhases(req, res, next));
  router.get('/:id', (req, res, next) => phaseController.getPhaseById(req, res, next));
  router.post('/', validatePhaseData, (req, res, next) => phaseController.createPhase(req, res, next));
  router.put('/:id', validatePhaseData, (req, res, next) => phaseController.updatePhase(req, res, next));
  router.delete('/:id', (req, res, next) => phaseController.deletePhase(req, res, next));
  router.post('/ProjectPhases', (req, res, next) => phaseController.getPhasesByProjects(req, res, next));

  return router;
}
