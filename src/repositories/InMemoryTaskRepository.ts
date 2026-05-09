import { Task } from '../domain/Task.js';
import type { TaskRepository } from './TaskRepository.js';

export class InMemoryTaskRepository implements TaskRepository {
  private readonly tasks = new Map<string, Task>();

  public async findAll(): Promise<Task[]> {
    return Array.from(this.tasks.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  public async findById(id: string): Promise<Task | null> {
    return this.tasks.get(id) ?? null;
  }

  public async save(task: Task): Promise<Task> {
    this.tasks.set(task.id, task);
    return task;
  }

  public async delete(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  public async count(): Promise<number> {
    return this.tasks.size;
  }

  public async clear(): Promise<void> {
    this.tasks.clear();
  }
}
