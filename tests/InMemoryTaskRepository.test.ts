import { beforeEach, describe, expect, it } from 'vitest';
import { Task } from '../src/domain/Task.js';
import { InMemoryTaskRepository } from '../src/repositories/InMemoryTaskRepository.js';

const makeTask = (id: string, createdAt: Date): Task =>
  new Task({
    id,
    title: `Task ${id}`,
    priority: 'medium',
    status: 'open',
    createdAt,
    updatedAt: createdAt,
  });

describe('InMemoryTaskRepository', () => {
  let repo: InMemoryTaskRepository;

  beforeEach(() => {
    repo = new InMemoryTaskRepository();
  });

  it('starts empty', async () => {
    expect(await repo.count()).toBe(0);
    expect(await repo.findAll()).toEqual([]);
  });

  it('saves and finds by id', async () => {
    const t = makeTask('a', new Date());
    await repo.save(t);
    expect(await repo.findById('a')).toBe(t);
    expect(await repo.findById('missing')).toBeNull();
  });

  it('findAll() returns tasks newest first', async () => {
    await repo.save(makeTask('old', new Date('2026-01-01')));
    await repo.save(makeTask('new', new Date('2026-02-01')));
    const all = await repo.findAll();
    expect(all.map((t) => t.id)).toEqual(['new', 'old']);
  });

  it('delete() returns true when the task existed', async () => {
    await repo.save(makeTask('a', new Date()));
    expect(await repo.delete('a')).toBe(true);
    expect(await repo.delete('a')).toBe(false);
  });

  it('clear() empties the store', async () => {
    await repo.save(makeTask('a', new Date()));
    await repo.save(makeTask('b', new Date()));
    await repo.clear();
    expect(await repo.count()).toBe(0);
  });
});
