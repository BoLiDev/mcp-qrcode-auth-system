import { authRoutes, qrcodeRoutes, userRoutes } from '@src/routes';
import express, { Application, Request, Response } from 'express';

const createApp = (): Application => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'qrcode-auth-server',
    });
  });

  app.use('/api/qrcode', qrcodeRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);

  app.use('/{*any}', (_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint not found',
    });
  });

  return app;
};

export default createApp;
