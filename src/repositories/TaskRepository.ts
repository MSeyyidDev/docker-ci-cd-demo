import { Task } from '../domain/Task.js';

/**
 * Persistence boundary for tasks.
 *
 * Implementations are pluggable: the in-memory store used here could be
 * swapped for a Postgres- or Redis-backed implementation without touching
 * the service or controller layers.
 */
export interface TaskRepository {
  findAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  save(task: Task): Promise<Task>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
  clear(): Promise<void>;
}
