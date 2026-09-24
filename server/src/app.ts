import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { productsRouter, metaRouter } from './routes/products.js';
import { config } from './config.js';

export function createApp() {
  const app = express();

  // Images are served from a third-party host, so allow cross-origin images.
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(cors({ origin: config.corsOrigin }));
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, env: config.nodeEnv, affcode: config.affcode });
  });

  app.use('/api/products', productsRouter);
  app.use('/api/meta', metaRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Central error handler: never leak stack traces to clients.
  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error('[api]', err.message);
      res.status(500).json({ error: 'Internal server error' });
    },
  );

  return app;
}
