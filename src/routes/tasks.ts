import { Router } from 'express';
import type { TaskController } from '../controllers/TaskController.js';
import { validateBody } from '../middleware/validateBody.js';
import { createTaskSchema, updateTaskSchema } from '../schemas/taskSchemas.js';

export function buildTaskRouter(controller: TaskController): Router {
  const router = Router();

  router.get('/', controller.list);
  router.post('/', validateBody(createTaskSchema), controller.create);
  router.get('/:id', controller.get);
  router.put('/:id', validateBody(updateTaskSchema), controller.update);
  router.delete('/:id', controller.remove);
  router.post('/:id/complete', controller.complete);

  return router;
}
