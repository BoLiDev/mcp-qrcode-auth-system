import { Request, Response } from 'express';

import { TokenService } from '../../shared/token-service.js';

export class TokenController {
  private readonly tokenService: TokenService;

  constructor(tokenService: TokenService) {
    this.tokenService = tokenService;
  }

  public async handleCallback(req: Request, res: Response): Promise<void> {
    try {
      const authToken = this.extractAuthToken(req);
      await this.processAuthToken(authToken);
      this.sendSuccessResponse(res);
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

  private async processAuthToken(authToken: string): Promise<void> {
    await this.tokenService.processCallback(authToken);
  }

  private sendSuccessResponse(res: Response): void {
    res.status(200).json({
      success: true,
      message: 'Authentication completed successfully',
    });
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
