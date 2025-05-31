import { gitlabConfig } from '@src/config';
import { authMiddleware, requestLogger } from '@src/middleware';
import { setupRoutes } from '@src/routes';
import express from 'express';

const app = express();
const PORT = process.env['PORT'] || 3100;

// Middleware setup
app.use(express.json());
app.use(requestLogger);
app.use(authMiddleware);

// Setup routes
setupRoutes(app);

// Start server
app.listen(PORT, () => {
  const configStatus = gitlabConfig.getStatus();
  console.log(`🚀 GitLab Proxy Server is running on port ${PORT}`);
  console.log(`🌐 Visit: http://localhost:${PORT}`);
  console.log(`�� Health check: http://localhost:${PORT}/health`);
  console.log(`⚙️  Config loaded: ${configStatus.loaded ? '✅' : '❌'}`);
  console.log(`🔑 Token configured: ${configStatus.hasToken ? '✅' : '❌'}`);
});

export default app;
