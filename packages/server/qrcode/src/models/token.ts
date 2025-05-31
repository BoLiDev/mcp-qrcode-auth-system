export interface Token {
  id: string;
  sessionId: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
  isRevoked: boolean;
}

export interface TokenValidation {
  valid: boolean;
  userId?: string;
  expiresAt?: number;
  reason?: 'expired' | 'revoked' | 'invalid';
}

export interface CreateTokenOptions {
  userId?: string;
  expirationDays?: number;
}
