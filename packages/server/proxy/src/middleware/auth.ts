import { authService } from '@src/services';
import { ResponseHelper, UrlHelper } from '@src/utils';
import { NextFunction, Request, Response } from 'express';

interface AuthenticatedRequest extends Request {
  authUser?: {
    userId?: string;
    expiresAt?: number;
  };
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Only apply auth to GitLab proxy paths
  if (!UrlHelper.isGitLabPath(req.path)) {
    return next();
  }

  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authService.extractTokenFromHeader(authHeader);

  if (!token) {
    res.status(403).json(ResponseHelper.error('Authorization header missing'));
    return;
  }

  try {
    // Validate token with auth service
    const validationResult = await authService.validateToken(token);

    if (!validationResult.valid) {
      const errorMessage = validationResult.error || 'Invalid or expired token';
      res.status(403).json(ResponseHelper.error(errorMessage));
      return;
    }

    // Store validation result in request for later use
    const authReq = req as AuthenticatedRequest;
    authReq.authUser = {};

    if (validationResult.userId) {
      authReq.authUser.userId = validationResult.userId;
    }

    if (validationResult.expiresAt) {
      authReq.authUser.expiresAt = validationResult.expiresAt;
    }

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json(ResponseHelper.error('Authentication service error'));
  }
}
