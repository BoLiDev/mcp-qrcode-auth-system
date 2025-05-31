export enum SessionStatus {
  PENDING = 'pending',
  AUTHENTICATED = 'authenticated',
  EXPIRED = 'expired',
}

export interface Session {
  id: string;
  status: SessionStatus;
  createdAt: number;
  expiresAt: number;
  tokenId?: string;
}

export interface CreateSessionOptions {
  expirationMinutes?: number;
}

export interface SessionValidation {
  isValid: boolean;
  session?: Session;
  reason?: 'not_found' | 'expired';
}
