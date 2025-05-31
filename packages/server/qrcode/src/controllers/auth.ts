import { AuthenticatedRequest } from '@src/middleware';
import { SessionStatus } from '@src/models';
import { sessionService, tokenService } from '@src/services';
import { printError, printScanSuccess, printTokenGenerated } from '@src/utils';
import { Request, Response } from 'express';

interface ScanRequest {
  deviceInfo?: string;
}

interface ScanResponse {
  success: boolean;
  message: string;
}

interface ValidateResponse {
  valid: boolean;
  userId?: string;
  expiresAt?: number;
  reason?: string;
}

interface RevokeResponse {
  success: boolean;
  message: string;
}

const handleScanAuthentication = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { deviceInfo }: ScanRequest = req.body || {};

    if (!sessionId) {
      printError('Scan authentication', 'Session ID is required');
      res.status(400).json({
        success: false,
        message: 'Session ID is required',
      });
      return;
    }

    // Validate session exists and is pending
    const session = await sessionService.getSession(sessionId);

    if (!session) {
      printError(
        'Scan authentication',
        `Session ${sessionId.slice(0, 8)}... not found or expired`
      );
      res.status(404).json({
        success: false,
        message: 'Session not found or expired',
      });
      return;
    }

    if (session.status !== SessionStatus.PENDING) {
      printError(
        'Scan authentication',
        `Session ${sessionId.slice(0, 8)}... is not pending (current: ${session.status})`
      );
      res.status(400).json({
        success: false,
        message: `Session is not pending. Current status: ${session.status}`,
      });
      return;
    }

    // Generate token for authenticated session
    const tokenId = await tokenService.generateToken(sessionId);

    // Update session status to authenticated
    await sessionService.updateSessionStatus(
      sessionId,
      SessionStatus.AUTHENTICATED
    );
    await sessionService.linkToken(sessionId, tokenId);

    printTokenGenerated(sessionId, deviceInfo);
    printScanSuccess(sessionId);

    const response: ScanResponse = {
      success: true,
      message: 'Authentication successful',
    };

    res.status(200).json(response);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    printError('Scan authentication', errorMessage);

    res.status(500).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

const handleTokenValidation = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // If we reach here, the token is already validated by middleware
    const { userId, tokenId } = req;

    if (!tokenId) {
      printError('Token validation', 'Token ID not found in request');
      res.status(500).json({
        valid: false,
        reason: 'internal_error',
      });
      return;
    }

    // Get additional token info
    const tokenInfo = await tokenService.getTokenInfo(tokenId);

    const response: ValidateResponse = {
      valid: true,
    };

    // Add optional fields only if they exist
    if (userId) {
      response.userId = userId;
    }
    if (tokenInfo?.expiresAt) {
      response.expiresAt = tokenInfo.expiresAt;
    }

    console.log(
      `✅ Token validation successful for user ${userId || 'unknown'}`
    );
    res.status(200).json(response);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    printError('Token validation', errorMessage);

    res.status(500).json({
      valid: false,
      reason: 'internal_error',
    });
  }
};

const handleTokenRevocation = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId, tokenId } = req;

    if (!tokenId) {
      printError('Token revocation', 'Token ID not found in request');
      res.status(500).json({
        success: false,
        message: 'Internal error',
      });
      return;
    }

    // Revoke the token
    await tokenService.revokeToken(tokenId);

    console.log(`🚫 Token revoked for user ${userId || 'unknown'}`);

    const response: RevokeResponse = {
      success: true,
      message: 'Token revoked successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    printError('Token revocation', errorMessage);

    res.status(500).json({
      success: false,
      message: 'Token revocation failed',
    });
  }
};

export {
  handleScanAuthentication,
  handleTokenRevocation,
  handleTokenValidation,
};
