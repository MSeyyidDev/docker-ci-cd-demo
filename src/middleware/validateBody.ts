import type { Request, Response, NextFunction } from 'express';
import { ZodError, type ZodSchema } from 'zod';
import { ValidationError } from '../services/errors.js';

/**
 * Generic Zod-backed body validator. On failure, normalises the issues
 * into a flat list and forwards a ValidationError so the error handler
 * can render a consistent response.
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues = err.errors.map((issue) => ({
          path: issue.path.join('.') || '(body)',
          message: issue.message,
        }));
        next(new ValidationError('Request body failed validation.', issues));
        return;
      }
      next(err);
    }
  };
}
