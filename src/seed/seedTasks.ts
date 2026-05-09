import { Task, type TaskPriority, type TaskStatus } from '../domain/Task.js';
import type { TaskRepository } from '../repositories/TaskRepository.js';

interface SeedRow {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  daysFromNow: number;
}

const SEED: readonly SeedRow[] = [
  {
    id: 'seed-01',
    title: 'Set up project skeleton',
    description: 'Bootstrap TypeScript, lint and test tooling.',
    priority: 'high',
    status: 'completed',
    daysFromNow: -7,
  },
  {
    id: 'seed-02',
    title: 'Define Task domain model',
    description: 'Implement the Task class with invariants.',
    priority: 'high',
    status: 'completed',
    daysFromNow: -6,
  },
  {
    id: 'seed-03',
    title: 'Implement in-memory repository',
    description: 'Provide a simple persistence boundary for the demo.',
    priority: 'medium',
    status: 'completed',
    daysFromNow: -6,
  },
  {
    id: 'seed-04',
    title: 'Wire Express routes',
    description: 'Expose CRUD endpoints over the service layer.',
    priority: 'high',
    status: 'in_progress',
    daysFromNow: 1,
  },
  {
    id: 'seed-05',
    title: 'Add Zod request validation',
    description: 'Validate request bodies before they hit the service.',
    priority: 'medium',
    status: 'in_progress',
    daysFromNow: 1,
  },
  {
    id: 'seed-06',
    title: 'Write Vitest unit tests',
    description: 'Cover the service and domain layers.',
    priority: 'medium',
    status: 'open',
    daysFromNow: 2,
  },
  {
    id: 'seed-07',
    title: 'Write Supertest HTTP tests',
    description: 'Cover happy and unhappy paths through the API.',
    priority: 'medium',
    status: 'open',
    daysFromNow: 2,
  },
  {
    id: 'seed-08',
    title: 'Author Dockerfile',
    description: 'Multi-stage build with a non-root runtime user.',
    priority: 'high',
    status: 'open',
    daysFromNow: 3,
  },
  {
    id: 'seed-09',
    title: 'Author docker-compose.yml',
    description: 'Bring the API up with a healthcheck and port mapping.',
    priority: 'medium',
    status: 'open',
    daysFromNow: 3,
  },
  {
    id: 'seed-10',
    title: 'Set up CI workflow',
    description: 'Lint, test and build on a Node 20 + 22 matrix.',
    priority: 'high',
    status: 'open',
    daysFromNow: 4,
  },
  {
    id: 'seed-11',
    title: 'Set up Docker workflow',
    description: 'Build the image and smoke-test /health.',
    priority: 'high',
    status: 'open',
    daysFromNow: 4,
  },
  {
    id: 'seed-12',
    title: 'Add coverage thresholds',
    description: 'Fail the build below 80% lines and statements.',
    priority: 'low',
    status: 'open',
    daysFromNow: 5,
  },
  {
    id: 'seed-13',
    title: 'Document API in README',
    description: 'Endpoint table, examples and run instructions.',
    priority: 'medium',
    status: 'open',
    daysFromNow: 5,
  },
  {
    id: 'seed-14',
    title: 'Document Docker workflow',
    description: 'Step-by-step CI/CD walkthrough for newcomers.',
    priority: 'low',
    status: 'open',
    daysFromNow: 6,
  },
  {
    id: 'seed-15',
    title: 'Verify build on a clean clone',
    description: 'Confirm the project boots from npm install.',
    priority: 'medium',
    status: 'open',
    daysFromNow: 6,
  },
  {
    id: 'seed-16',
    title: 'Run image size audit',
    description: 'Confirm the runtime image stays slim.',
    priority: 'low',
    status: 'open',
    daysFromNow: 7,
  },
  {
    id: 'seed-17',
    title: 'Add architecture diagram',
    description: 'Render the layer split via mermaid in the README.',
    priority: 'low',
    status: 'open',
    daysFromNow: 7,
  },
  {
    id: 'seed-18',
    title: 'Polish error responses',
    description: 'Make sure every error has code + message.',
    priority: 'medium',
    status: 'open',
    daysFromNow: 8,
  },
  {
    id: 'seed-19',
    title: 'Tag a v1 release',
    description: 'Cut a Conventional-Commits release once green.',
    priority: 'low',
    status: 'open',
    daysFromNow: 9,
  },
  {
    id: 'seed-20',
    title: 'Share screenshots of the green run',
    description: 'Capture the Actions UI for the README.',
    priority: 'low',
    status: 'open',
    daysFromNow: 10,
  },
];

export async function seedTasks(
  repository: TaskRepository,
  now: Date = new Date(),
): Promise<number> {
  for (const row of SEED) {
    const created = new Date(now.getTime() - 1000 * 60 * 60 * 24 * Math.max(0, -row.daysFromNow));
    const due = new Date(now.getTime() + 1000 * 60 * 60 * 24 * row.daysFromNow);
    const task = new Task({
      id: row.id,
      title: row.title,
      description: row.description,
      priority: row.priority,
      status: row.status,
      dueDate: due,
      createdAt: created,
      updatedAt: created,
      completedAt: row.status === 'completed' ? created : undefined,
    });
    await repository.save(task);
  }
  return SEED.length;
}
