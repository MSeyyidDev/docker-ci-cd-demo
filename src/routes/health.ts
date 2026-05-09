import { Router, type Request, type Response } from 'express';

export function buildHealthRouter(): Router {
  const router = Router();
  const startedAt = Date.now();

  router.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}
