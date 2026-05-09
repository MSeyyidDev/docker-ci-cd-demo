/**
 * Task domain class.
 *
 * Encapsulates the invariants of a task entity. Validation that touches
 * external input lives in the Zod schemas, while invariants that must hold
 * for any persisted Task are enforced here.
 */

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'open' | 'in_progress' | 'completed';

export const TASK_PRIORITIES: readonly TaskPriority[] = ['low', 'medium', 'high'] as const;
export const TASK_STATUSES: readonly TaskStatus[] = ['open', 'in_progress', 'completed'] as const;

export interface TaskProps {
  id: string;
  title: string;
  description?: string | undefined;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | undefined;
}

export interface TaskJSON {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export class Task {
  public readonly id: string;
  public title: string;
  public description: string | undefined;
  public priority: TaskPriority;
  public status: TaskStatus;
  public dueDate: Date | undefined;
  public readonly createdAt: Date;
  public updatedAt: Date;
  public completedAt: Date | undefined;

  constructor(props: TaskProps) {
    this.assertValidTitle(props.title);
    this.assertValidPriority(props.priority);
    this.assertValidStatus(props.status);

    this.id = props.id;
    this.title = props.title.trim();
    this.description = props.description?.trim() || undefined;
    this.priority = props.priority;
    this.status = props.status;
    this.dueDate = props.dueDate;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.completedAt = props.completedAt;
  }

  /**
   * Mark the task as completed. Idempotent.
   */
  public complete(now: Date = new Date()): void {
    if (this.status === 'completed') {
      return;
    }
    this.status = 'completed';
    this.completedAt = now;
    this.updatedAt = now;
  }

  /**
   * Apply a partial update to mutable fields. Returns true if any field changed.
   */
  public update(
    patch: Partial<Pick<TaskProps, 'title' | 'description' | 'priority' | 'status' | 'dueDate'>>,
    now: Date = new Date(),
  ): boolean {
    let changed = false;

    if (patch.title !== undefined && patch.title !== this.title) {
      this.assertValidTitle(patch.title);
      this.title = patch.title.trim();
      changed = true;
    }
    if (patch.description !== undefined) {
      const next = patch.description?.trim() || undefined;
      if (next !== this.description) {
        this.description = next;
        changed = true;
      }
    }
    if (patch.priority !== undefined && patch.priority !== this.priority) {
      this.assertValidPriority(patch.priority);
      this.priority = patch.priority;
      changed = true;
    }
    if (patch.status !== undefined && patch.status !== this.status) {
      this.assertValidStatus(patch.status);
      this.status = patch.status;
      if (patch.status === 'completed') {
        this.completedAt = now;
      } else {
        this.completedAt = undefined;
      }
      changed = true;
    }
    if (patch.dueDate !== undefined) {
      const same =
        (patch.dueDate === undefined && this.dueDate === undefined) ||
        (patch.dueDate instanceof Date &&
          this.dueDate instanceof Date &&
          patch.dueDate.getTime() === this.dueDate.getTime());
      if (!same) {
        this.dueDate = patch.dueDate;
        changed = true;
      }
    }

    if (changed) {
      this.updatedAt = now;
    }
    return changed;
  }

  public toJSON(): TaskJSON {
    return {
      id: this.id,
      title: this.title,
      description: this.description ?? null,
      priority: this.priority,
      status: this.status,
      dueDate: this.dueDate ? this.dueDate.toISOString() : null,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      completedAt: this.completedAt ? this.completedAt.toISOString() : null,
    };
  }

  private assertValidTitle(title: string): void {
    if (typeof title !== 'string' || title.trim().length === 0) {
      throw new Error('Task title must be a non-empty string.');
    }
    if (title.length > 200) {
      throw new Error('Task title must be 200 characters or fewer.');
    }
  }

  private assertValidPriority(priority: TaskPriority): void {
    if (!TASK_PRIORITIES.includes(priority)) {
      throw new Error(`Invalid task priority: ${priority}`);
    }
  }

  private assertValidStatus(status: TaskStatus): void {
    if (!TASK_STATUSES.includes(status)) {
      throw new Error(`Invalid task status: ${status}`);
    }
  }
}
