import { gitlabConfig } from '@src/config';
import { Request, Response } from 'express';

export class HealthController {
  static getHealth(_req: Request, res: Response): void {
    const configStatus = gitlabConfig.getStatus();
    res.json({
      status: 'ok',
      config: configStatus,
      timestamp: new Date().toISOString(),
    });
  }

  static getServiceInfo(_req: Request, res: Response): void {
    const configStatus = gitlabConfig.getStatus();
    res.json({
      service: 'GitLab Proxy Server',
      version: '1.0.0',
      status: 'running',
      config: {
        loaded: configStatus.loaded,
        hasValidConfig: gitlabConfig.isConfigValid(),
      },
      endpoints: {
        health: '/health',
        proxy: '/gitlab/*',
      },
    });
  }
}
