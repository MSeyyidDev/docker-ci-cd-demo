import express, { type Express } from 'express';
import { TaskController } from './controllers/TaskController.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { InMemoryTaskRepository } from './repositories/InMemoryTaskRepository.js';
import type { TaskRepository } from './repositories/TaskRepository.js';
import { buildHealthRouter } from './routes/health.js';
import { buildTaskRouter } from './routes/tasks.js';
import { TaskService } from './services/TaskService.js';

export interface AppDeps {
  repository?: TaskRepository;
  enableRequestLogger?: boolean;
}

export interface AppHandle {
  app: Express;
  repository: TaskRepository;
  service: TaskService;
}

/**
 * createApp wires the layers together. It is intentionally pure: callers
 * (server.ts in production, tests in CI) decide whether to pass a custom
 * repository or skip the request logger.
 */
export function createApp(deps: AppDeps = {}): AppHandle {
  const repository = deps.repository ?? new InMemoryTaskRepository();
  const service = new TaskService({ repository });
  const controller = new TaskController(service);

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '256kb' }));

  if (deps.enableRequestLogger) {
    app.use(requestLogger);
  }

  app.use('/health', buildHealthRouter());
  app.use('/tasks', buildTaskRouter(controller));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return { app, repository, service };
}
