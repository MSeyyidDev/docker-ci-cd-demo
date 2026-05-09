import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { createApp } from '../src/app.js';

describe('HTTP API', () => {
  let app: Express;

  beforeEach(() => {
    ({ app } = createApp());
  });

  describe('GET /health', () => {
    it('returns 200 and a status payload', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(typeof res.body.uptimeSeconds).toBe('number');
    });
  });

  describe('Tasks CRUD', () => {
    it('lists tasks (initially empty)', async () => {
      const res = await request(app).get('/tasks');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ data: [], count: 0 });
    });

    it('creates a task with valid payload', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: 'Write tests', priority: 'high' });
      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Write tests');
      expect(res.body.data.priority).toBe('high');
      expect(res.body.data.status).toBe('open');
      expect(typeof res.body.data.id).toBe('string');
    });

    it('rejects an empty title with 400', async () => {
      const res = await request(app).post('/tasks').send({ title: '' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(Array.isArray(res.body.error.issues)).toBe(true);
    });

    it('rejects unknown priority values', async () => {
      const res = await request(app).post('/tasks').send({ title: 'x', priority: 'urgent' });
      expect(res.status).toBe(400);
    });

    it('rejects malformed dueDate', async () => {
      const res = await request(app).post('/tasks').send({ title: 'x', dueDate: 'not-a-date' });
      expect(res.status).toBe(400);
    });

    it('GET /tasks/:id returns 404 for missing tasks', async () => {
      const res = await request(app).get('/tasks/missing');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('TASK_NOT_FOUND');
    });

    it('round-trip: create, read, update, complete, delete', async () => {
      const created = await request(app).post('/tasks').send({ title: 'Round trip' });
      const id = created.body.data.id;

      const got = await request(app).get(`/tasks/${id}`);
      expect(got.status).toBe(200);
      expect(got.body.data.id).toBe(id);

      const updated = await request(app).put(`/tasks/${id}`).send({ priority: 'high' });
      expect(updated.status).toBe(200);
      expect(updated.body.data.priority).toBe('high');

      const completed = await request(app).post(`/tasks/${id}/complete`);
      expect(completed.status).toBe(200);
      expect(completed.body.data.status).toBe('completed');

      const removed = await request(app).delete(`/tasks/${id}`);
      expect(removed.status).toBe(204);

      const after = await request(app).get(`/tasks/${id}`);
      expect(after.status).toBe(404);
    });

    it('PUT with no fields returns a validation error', async () => {
      const created = await request(app).post('/tasks').send({ title: 'x' });
      const res = await request(app).put(`/tasks/${created.body.data.id}`).send({});
      expect(res.status).toBe(400);
    });

    it('DELETE on missing id returns 404', async () => {
      const res = await request(app).delete('/tasks/nope');
      expect(res.status).toBe(404);
    });

    it('POST /tasks/:id/complete on missing id returns 404', async () => {
      const res = await request(app).post('/tasks/nope/complete');
      expect(res.status).toBe(404);
    });

    it('responds 404 for unknown routes', async () => {
      const res = await request(app).get('/does-not-exist');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
