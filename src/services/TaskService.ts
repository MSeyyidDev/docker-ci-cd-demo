import { randomUUID } from 'node:crypto';
import { Task, type TaskPriority, type TaskStatus } from '../domain/Task.js';
import type { TaskRepository } from '../repositories/TaskRepository.js';
import { TaskNotFoundError } from './errors.js';

export interface CreateTaskInput {
  title: string;
  description?: string | undefined;
  priority?: TaskPriority | undefined;
  status?: TaskStatus | undefined;
  dueDate?: Date | undefined;
}

export interface UpdateTaskInput {
  title?: string | undefined;
  description?: string | undefined;
  priority?: TaskPriority | undefined;
  status?: TaskStatus | undefined;
  dueDate?: Date | undefined;
}

export interface TaskServiceDeps {
  repository: TaskRepository;
  idFactory?: () => string;
  clock?: () => Date;
}

/**
 * Application service. Coordinates between the HTTP layer and the
 * persistence boundary. Holds no Express types.
 */
export class TaskService {
  private readonly repository: TaskRepository;
  private readonly idFactory: () => string;
  private readonly clock: () => Date;

  constructor(deps: TaskServiceDeps) {
    this.repository = deps.repository;
    this.idFactory = deps.idFactory ?? randomUUID;
    this.clock = deps.clock ?? (() => new Date());
  }

  public async listTasks(): Promise<Task[]> {
    return this.repository.findAll();
  }

  public async getTask(id: string): Promise<Task> {
    const task = await this.repository.findById(id);
    if (!task) {
      throw new TaskNotFoundError(id);
    }
    return task;
  }

  public async createTask(input: CreateTaskInput): Promise<Task> {
    const now = this.clock();
    const task = new Task({
      id: this.idFactory(),
      title: input.title,
      description: input.description,
      priority: input.priority ?? 'medium',
      status: input.status ?? 'open',
      dueDate: input.dueDate,
      createdAt: now,
      updatedAt: now,
    });
    return this.repository.save(task);
  }

  public async updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
    const task = await this.getTask(id);
    task.update(input, this.clock());
    return this.repository.save(task);
  }

  public async deleteTask(id: string): Promise<void> {
    const removed = await this.repository.delete(id);
    if (!removed) {
      throw new TaskNotFoundError(id);
    }
  }

  public async completeTask(id: string): Promise<Task> {
    const task = await this.getTask(id);
    task.complete(this.clock());
    return this.repository.save(task);
  }
}
