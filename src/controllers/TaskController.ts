import type { Request, Response, NextFunction } from 'express';
import type { TaskService } from '../services/TaskService.js';
import type { TaskPriority, TaskStatus } from '../domain/Task.js';
import type { CreateTaskBody, UpdateTaskBody } from '../schemas/taskSchemas.js';

/**
 * HTTP boundary. Translates between Express requests/responses and the
 * application service. No business logic lives here.
 */
export class TaskController {
  constructor(private readonly service: TaskService) {}

  public list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tasks = await this.service.listTasks();
      res.status(200).json({
        data: tasks.map((t) => t.toJSON()),
        count: tasks.length,
      });
    } catch (err) {
      next(err);
    }
  };

  public get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const task = await this.service.getTask(req.params.id);
      res.status(200).json({ data: task.toJSON() });
    } catch (err) {
      next(err);
    }
  };

  public create = async (
    req: Request<unknown, unknown, CreateTaskBody>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const body = req.body;
      const task = await this.service.createTask({
        title: body.title,
        description: body.description,
        priority: body.priority as TaskPriority | undefined,
        status: body.status as TaskStatus | undefined,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      });
      res.status(201).json({ data: task.toJSON() });
    } catch (err) {
      next(err);
    }
  };

  public update = async (
    req: Request<{ id: string }, unknown, UpdateTaskBody>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const body = req.body;
      const task = await this.service.updateTask(req.params.id, {
        title: body.title,
        description: body.description === null ? undefined : body.description,
        priority: body.priority as TaskPriority | undefined,
        status: body.status as TaskStatus | undefined,
        dueDate:
          body.dueDate === null ? undefined : body.dueDate ? new Date(body.dueDate) : undefined,
      });
      res.status(200).json({ data: task.toJSON() });
    } catch (err) {
      next(err);
    }
  };

  public remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteTask(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  public complete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const task = await this.service.completeTask(req.params.id);
      res.status(200).json({ data: task.toJSON() });
    } catch (err) {
      next(err);
    }
  };
}
