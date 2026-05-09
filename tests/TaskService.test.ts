import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryTaskRepository } from '../src/repositories/InMemoryTaskRepository.js';
import { TaskService } from '../src/services/TaskService.js';
import { TaskNotFoundError } from '../src/services/errors.js';

describe('TaskService', () => {
  let repo: InMemoryTaskRepository;
  let service: TaskService;
  let counter = 0;

  beforeEach(() => {
    repo = new InMemoryTaskRepository();
    counter = 0;
    service = new TaskService({
      repository: repo,
      idFactory: () => `task-${++counter}`,
      clock: () => new Date('2026-05-09T00:00:00Z'),
    });
  });

  it('creates a task with defaults applied', async () => {
    const task = await service.createTask({ title: 'Buy milk' });
    expect(task.id).toBe('task-1');
    expect(task.priority).toBe('medium');
    expect(task.status).toBe('open');
    expect(await repo.count()).toBe(1);
  });

  it('lists tasks', async () => {
    await service.createTask({ title: 'A' });
    await service.createTask({ title: 'B' });
    const all = await service.listTasks();
    expect(all).toHaveLength(2);
  });

  it('getTask() throws TaskNotFoundError for an unknown id', async () => {
    await expect(service.getTask('nope')).rejects.toBeInstanceOf(TaskNotFoundError);
  });

  it('updates a task', async () => {
    const created = await service.createTask({ title: 'Buy milk' });
    const updated = await service.updateTask(created.id, { title: 'Buy almond milk' });
    expect(updated.title).toBe('Buy almond milk');
  });

  it('deleteTask() throws when the task does not exist', async () => {
    await expect(service.deleteTask('nope')).rejects.toBeInstanceOf(TaskNotFoundError);
  });

  it('completeTask() marks the task completed', async () => {
    const created = await service.createTask({ title: 'Ship it' });
    const completed = await service.completeTask(created.id);
    expect(completed.status).toBe('completed');
    expect(completed.completedAt).toBeDefined();
  });
});
