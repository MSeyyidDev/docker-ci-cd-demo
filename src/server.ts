import { createApp } from './app.js';
import { logger } from './logger.js';
import { seedTasks } from './seed/seedTasks.js';

async function main(): Promise<void> {
  const port = Number.parseInt(process.env.PORT ?? '3000', 10);
  const { app, repository } = createApp({ enableRequestLogger: true });

  const seeded = await seedTasks(repository);
  logger.info({ seeded }, 'Seeded initial tasks.');

  const server = app.listen(port, () => {
    logger.info({ port }, 'docker-ci-cd-demo listening');
  });

  const shutdown = (signal: string): void => {
    logger.info({ signal }, 'Shutting down.');
    server.close(() => {
      logger.info('Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  logger.error({ err }, 'Fatal startup error');
  process.exit(1);
});
