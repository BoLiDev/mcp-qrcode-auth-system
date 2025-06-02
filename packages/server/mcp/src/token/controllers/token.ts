import { Request, Response } from 'express';

import { TokenService } from '../../shared/token-service.js';
import { authSuccessHtml } from './auth-success.html.js';

export class TokenController {
  private readonly tokenService: TokenService;

  constructor(tokenService: TokenService) {
    this.tokenService = tokenService;
  }

  public async handleCallback(req: Request, res: Response): Promise<void> {
    try {
      const authToken = this.extractAuthToken(req);
      const currentPath = this.extractCurrentPath(req);
      await this.processAuthToken(authToken);
      this.sendSuccessResponse(res, currentPath);
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  private extractAuthToken(req: Request): string {
    const authToken = req.query['authCode'] as string;

    if (!authToken) {
      throw new Error('Missing authCode parameter');
    }

    return authToken;
  }

  private extractCurrentPath(req: Request): string | undefined {
    const currentPath = req.query['currentPath'] as string | undefined;

    return currentPath;
  }

  private async processAuthToken(authToken: string): Promise<void> {
    await this.tokenService.processCallback(authToken);
  }

  private sendSuccessResponse(res: Response, currentPath?: string): void {
    res.status(200).type('html').send(authSuccessHtml(currentPath));
  }

  private sendErrorResponse(res: Response, error: unknown): void {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    console.error('Token callback error:', errorMessage);

    res.status(400).json({
      success: false,
      error: errorMessage,
    });
  }
}
