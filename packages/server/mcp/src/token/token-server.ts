import express, { Application } from 'express';

import { Config, TokenManager, TokenService } from '../shared';
import { TokenController } from './controllers';
import { AuthRoutes } from './routes';

export class TokenServer {
  private readonly app: Application;
  private readonly config: Config;
  private readonly tokenService: TokenService;

  constructor(config: Config) {
    this.config = config;
    this.app = express();
    this.tokenService = this.createTokenService();
    this.setupMiddleware();
    this.setupRoutes();
  }

  public async start(): Promise<void> {
    await this.initializeTokenService();
    await this.startServer();
  }

  public async stop(): Promise<void> {
    console.error('Token server stopped');
  }

  private createTokenService(): TokenService {
    const tokenManager = new TokenManager(this.config);
    return new TokenService(this.config, tokenManager);
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes(): void {
    const tokenController = new TokenController(this.tokenService);
    const authRoutes = new AuthRoutes(tokenController);

    this.app.use('/auth', authRoutes.getRouter());
    this.setupHealthCheck();
  }

  private setupHealthCheck(): void {
    this.app.get('/health', (_, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
  }

  private async initializeTokenService(): Promise<void> {
    await this.tokenService.checkTokenOnStartup();
  }

  private async startServer(): Promise<void> {
    const port = this.config.tokenServer.port;

    return new Promise((resolve) => {
      this.app.listen(port, () => {
        console.error(`Token server running on port ${port}`);
        console.error(`Callback URL: ${this.config.tokenServer.callbackUrl}`);
        resolve();
      });
    });
  }
}
