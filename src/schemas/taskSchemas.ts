import { z } from 'zod';
import { TASK_PRIORITIES, TASK_STATUSES } from '../domain/Task.js';

const isoDateString = z
  .string()
  .datetime({ offset: true, message: 'dueDate must be an ISO-8601 datetime string' });

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'title must be a non-empty string')
    .max(200, 'title must be 200 characters or fewer'),
  description: z.string().trim().max(2000).optional(),
  priority: z.enum(TASK_PRIORITIES as unknown as [string, ...string[]]).optional(),
  status: z.enum(TASK_STATUSES as unknown as [string, ...string[]]).optional(),
  dueDate: isoDateString.optional(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    priority: z.enum(TASK_PRIORITIES as unknown as [string, ...string[]]).optional(),
    status: z.enum(TASK_STATUSES as unknown as [string, ...string[]]).optional(),
    dueDate: isoDateString.nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided.',
  });

export type CreateTaskBody = z.infer<typeof createTaskSchema>;
export type UpdateTaskBody = z.infer<typeof updateTaskSchema>;
