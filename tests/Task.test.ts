import { describe, expect, it } from 'vitest';
import { Task } from '../src/domain/Task.js';

const baseProps = (): ConstructorParameters<typeof Task>[0] => ({
  id: 't-1',
  title: 'Write docs',
  description: 'Cover the API surface.',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
});

describe('Task domain', () => {
  it('constructs with valid props and trims the title', () => {
    const t = new Task({ ...baseProps(), title: '  Hello  ' });
    expect(t.title).toBe('Hello');
    expect(t.id).toBe('t-1');
  });

  it('rejects empty titles', () => {
    expect(() => new Task({ ...baseProps(), title: '   ' })).toThrow();
  });

  it('rejects titles longer than 200 characters', () => {
    expect(() => new Task({ ...baseProps(), title: 'a'.repeat(201) })).toThrow();
  });

  it('rejects an invalid priority', () => {
    expect(() => new Task({ ...baseProps(), priority: 'urgent' as unknown as 'low' })).toThrow();
  });

  it('rejects an invalid status', () => {
    expect(() => new Task({ ...baseProps(), status: 'cancelled' as unknown as 'open' })).toThrow();
  });

  it('complete() marks the task completed and stamps completedAt', () => {
    const t = new Task(baseProps());
    const at = new Date('2026-02-01T12:00:00Z');
    t.complete(at);
    expect(t.status).toBe('completed');
    expect(t.completedAt?.toISOString()).toBe(at.toISOString());
    expect(t.updatedAt.toISOString()).toBe(at.toISOString());
  });

  it('complete() is idempotent', () => {
    const t = new Task(baseProps());
    const at1 = new Date('2026-02-01T12:00:00Z');
    t.complete(at1);
    const at2 = new Date('2026-02-02T12:00:00Z');
    t.complete(at2);
    expect(t.completedAt?.toISOString()).toBe(at1.toISOString());
  });

  it('update() applies a partial patch and returns true when changed', () => {
    const t = new Task(baseProps());
    const at = new Date('2026-03-01T00:00:00Z');
    const changed = t.update({ title: 'Renamed', priority: 'high' }, at);
    expect(changed).toBe(true);
    expect(t.title).toBe('Renamed');
    expect(t.priority).toBe('high');
    expect(t.updatedAt.toISOString()).toBe(at.toISOString());
  });

  it('update() returns false when nothing changes', () => {
    const t = new Task(baseProps());
    const changed = t.update({ title: t.title, priority: t.priority });
    expect(changed).toBe(false);
  });

  it('update() to status=completed stamps completedAt; reverting clears it', () => {
    const t = new Task(baseProps());
    const at1 = new Date('2026-04-01T00:00:00Z');
    t.update({ status: 'completed' }, at1);
    expect(t.completedAt?.toISOString()).toBe(at1.toISOString());

    const at2 = new Date('2026-04-02T00:00:00Z');
    t.update({ status: 'open' }, at2);
    expect(t.completedAt).toBeUndefined();
  });

  it('toJSON() returns ISO strings and null for missing optional fields', () => {
    const t = new Task({ ...baseProps(), description: undefined });
    const json = t.toJSON();
    expect(json.id).toBe('t-1');
    expect(json.description).toBeNull();
    expect(json.dueDate).toBeNull();
    expect(json.completedAt).toBeNull();
    expect(typeof json.createdAt).toBe('string');
    expect(typeof json.updatedAt).toBe('string');
  });
});
