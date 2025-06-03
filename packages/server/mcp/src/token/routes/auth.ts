import { Request, Response, Router } from 'express';

import { TokenController } from '../controllers/token.js';

export class AuthRoutes {
  private readonly router: Router;
  private readonly tokenController: TokenController;

  constructor(tokenController: TokenController) {
    this.router = Router();
    this.tokenController = tokenController;
    this.setupRoutes();
  }

  public getRouter(): Router {
    return this.router;
  }

  private setupRoutes(): void {
    this.router.get('/callback', this.handleCallback.bind(this));
    this.router.post('/validate/start', this.handleStartValidation.bind(this));
    this.router.get('/validate/status', this.handleValidationStatus.bind(this));
  }

  private async handleCallback(req: Request, res: Response): Promise<void> {
    await this.tokenController.handleCallback(req, res);
  }

  private async handleStartValidation(
    req: Request,
    res: Response
  ): Promise<void> {
    await this.tokenController.startValidation(req, res);
  }

  private async handleValidationStatus(
    req: Request,
    res: Response
  ): Promise<void> {
    await this.tokenController.getValidationStatus(req, res);
  }
}
