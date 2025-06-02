export interface Config {
  proxyServer: {
    baseUrl: string;
    timeout: number;
  };
  tokenServer: {
    port: number;
    callbackUrl: string;
  };
  externalServices: {
    qrCodeUrl: string;
    authServiceUrl: string;
  };
  storage: {
    accountName: string;
    service: string;
  };
}

// Token validation types
export interface TokenValidationResponse {
  valid: boolean;
  userId?: string;
  expiresAt?: number;
  error?: string;
  reason?: 'invalid' | 'expired' | 'revoked';
}

export interface AuthApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
}
