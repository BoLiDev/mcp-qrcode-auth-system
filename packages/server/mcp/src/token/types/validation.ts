export interface ValidationSession {
  sessionId: string;
  status: 'pending' | 'success' | 'failed' | 'expired';
  createdAt: number;
  expiresAt: number;
  authToken?: string;
  error?: string;
}

export interface StartValidationResponse {
  sessionId: string;
}

export interface ValidationStatusResponse {
  status: string;
  authToken?: string;
  error?: string;
}
