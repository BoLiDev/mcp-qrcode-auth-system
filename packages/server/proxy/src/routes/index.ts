import { Application } from 'express';

import gitlabRoutes from './gitlab';
import healthRoutes from './health';

export function setupRoutes(app: Application): void {
  app.use(healthRoutes);
  app.use(gitlabRoutes);
}
