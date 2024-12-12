import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { validateProjectData } from '../middleware/validateProjectData';
import { authMiddleware } from '../middleware/authMiddleware';

export function projectRoutes(projectController: ProjectController): Router {
  const router = Router();
  router.use(authMiddleware);

  router.get('/', (req, res, next) => projectController.getAllProjects(req, res, next));
  router.get('/:id', (req, res, next) => projectController.getProjectById(req, res, next));
  router.post('/', validateProjectData, (req, res, next) => projectController.createProject(req, res, next));
  router.put('/:id', validateProjectData, (req, res, next) => projectController.updateProject(req, res, next));
  router.delete('/:id', (req, res, next) => projectController.deleteProject(req, res, next));

  return router;
}
