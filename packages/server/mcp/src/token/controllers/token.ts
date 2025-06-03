import { Request, Response } from 'express';

import { TokenService } from '../../shared/token-service';
import { SessionManager } from '../services/session-manager';
import {
  StartValidationResponse,
  ValidationStatusResponse,
} from '../types/validation';
import { authSuccessHtml } from './auth-success.html';

export class TokenController {
  private readonly tokenService: TokenService;
  private readonly sessionManager: SessionManager;

  constructor(tokenService: TokenService) {
    this.tokenService = tokenService;
    this.sessionManager = new SessionManager();

    // Setup periodic cleanup of expired sessions
    setInterval(
      () => {
        this.sessionManager.cleanupExpiredSessions();
      },
      5 * 60 * 1000
    ); // Cleanup every 5 minutes
  }

  public async startValidation(req: Request, res: Response): Promise<void> {
    try {
      const session = this.sessionManager.createSession();
      const currentPath = req.query['currentPath'] as string | undefined;

      // Start auth flow with sessionId - this will open the browser with the correct URL
      await this.tokenService.startAuthFlowIfNeeded(
        currentPath,
        session.sessionId
      );

      const response: StartValidationResponse = {
        sessionId: session.sessionId,
      };

      console.error(`Validation started for session: ${session.sessionId}`);
      res.status(200).json(response);
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  public async getValidationStatus(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = req.query['sessionId'] as string;

      if (!sessionId) {
        throw new Error('Missing sessionId parameter');
      }

      const session = this.sessionManager.getSession(sessionId);

      if (!session) {
        res.status(404).json({
          status: 'not_found',
          error: 'Session not found or expired',
        });
        return;
      }

      const response: ValidationStatusResponse = {
        status: session.status,
      };

      if (session.authToken) {
        response.authToken = session.authToken;
      }

      if (session.error) {
        response.error = session.error;
      }

      res.status(200).json(response);
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  public async handleCallback(req: Request, res: Response): Promise<void> {
    try {
      const authToken = this.extractAuthToken(req);
      const sessionId = this.extractSessionId(req);
      const currentPath = this.extractCurrentPath(req);

      // Process auth token (save to keychain)
      await this.processAuthToken(authToken);

      // Update session status if sessionId is provided
      if (sessionId) {
        const success = this.sessionManager.updateSessionStatus(
          sessionId,
          'success',
          authToken
        );

        if (success) {
          console.error(`Session ${sessionId} marked as successful`);
        } else {
          console.error(
            `Failed to update session ${sessionId} - session not found`
          );
        }
      }

      this.sendSuccessResponse(res, currentPath);
    } catch (error) {
      // If sessionId is available, mark session as failed
      const sessionId = this.extractSessionId(req);
      if (sessionId) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.sessionManager.updateSessionStatus(
          sessionId,
          'failed',
          undefined,
          errorMessage
        );
      }

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

  private extractSessionId(req: Request): string | undefined {
    return req.query['sessionId'] as string | undefined;
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
