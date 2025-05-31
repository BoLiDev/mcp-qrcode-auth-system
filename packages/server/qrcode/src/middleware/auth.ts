import { tokenService } from '@src/services';
import { printError } from '@src/utils';
import { NextFunction, Request, Response } from 'express';

interface AuthenticatedRequest extends Request {
  userId?: string;
  tokenId?: string;
}

const extractTokenFromHeader = (
  authHeader: string | undefined
): string | null => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      printError('Token authentication', 'No token provided');
      res.status(401).json({
        valid: false,
        error: 'Authentication required',
        message: 'No token provided',
      });
      return;
    }

    const validation = await tokenService.validateToken(token);

    if (!validation.valid) {
      printError(
        'Token authentication',
        `Token validation failed: ${validation.reason}`
      );
      res.status(401).json({
        valid: false,
        error: 'Invalid token',
        reason: validation.reason,
      });
      return;
    }

    // Attach user info to request (validation.userId is guaranteed to exist when valid=true)
    if (validation.userId) {
      req.userId = validation.userId;
    }
    req.tokenId = token;

    next();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    printError('Token authentication', errorMessage);

    res.status(500).json({
      valid: false,
      error: 'Authentication failed',
      message: errorMessage,
    });
  }
};

export type { AuthenticatedRequest };
