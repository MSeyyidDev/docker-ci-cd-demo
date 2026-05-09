/**
 * Domain / application errors. The HTTP layer translates these into
 * structured responses; lower layers throw them without knowing about HTTP.
 */

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class TaskNotFoundError extends AppError {
  constructor(id: string) {
    super(`Task with id "${id}" was not found.`, 'TASK_NOT_FOUND', 404);
    this.name = 'TaskNotFoundError';
  }
}

export class ValidationError extends AppError {
  public readonly issues: Array<{ path: string; message: string }>;

  constructor(message: string, issues: Array<{ path: string; message: string }> = []) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
    this.issues = issues;
  }
}
