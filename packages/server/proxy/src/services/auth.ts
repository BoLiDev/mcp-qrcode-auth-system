export interface TokenValidationResult {
  valid: boolean;
  userId?: string;
  expiresAt?: number;
  error?: string;
  reason?: string;
}

export class AuthService {
  private readonly authBaseUrl: string;

  constructor() {
    this.authBaseUrl = process.env['AUTH_BASE_URL'] || 'http://localhost:3000';
  }

  async validateToken(token: string): Promise<TokenValidationResult> {
    try {
      const response = await fetch(`${this.authBaseUrl}/api/user/validate`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          valid: false,
          error: 'Authentication failed',
          reason: response.status === 401 ? 'invalid' : 'unknown',
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Token validation error:', error);
      return {
        valid: false,
        error: 'Authentication service unavailable',
        reason: 'service_error',
      };
    }
  }

  extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }
}

export const authService = new AuthService();
