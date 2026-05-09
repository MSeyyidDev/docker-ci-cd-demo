import { describe, expect, it } from 'vitest';
import { InMemoryTaskRepository } from '../src/repositories/InMemoryTaskRepository.js';
import { seedTasks } from '../src/seed/seedTasks.js';

describe('seedTasks', () => {
  it('inserts exactly 20 tasks', async () => {
    const repo = new InMemoryTaskRepository();
    const inserted = await seedTasks(repo);
    expect(inserted).toBe(20);
    expect(await repo.count()).toBe(20);
  });

  it('produces tasks with valid statuses and priorities', async () => {
    const repo = new InMemoryTaskRepository();
    await seedTasks(repo);
    const all = await repo.findAll();
    for (const t of all) {
      expect(['open', 'in_progress', 'completed']).toContain(t.status);
      expect(['low', 'medium', 'high']).toContain(t.priority);
    }
  });
});
