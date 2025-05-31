import { CreateTokenOptions, Token, TokenValidation } from '@src/models';
import { generateTokenId, generateUserId } from '@src/utils';

const DEFAULT_EXPIRATION_DAYS = 7;

class TokenService {
  private tokens = new Map<string, Token>();

  private calculateExpirationTime(days: number): number {
    return Date.now() + days * 24 * 60 * 60 * 1000;
  }

  private isTokenExpired(token: Token): boolean {
    return Date.now() > token.expiresAt;
  }

  private validateTokenExists(tokenId: string): TokenValidation {
    const token = this.tokens.get(tokenId);

    if (!token) {
      return { valid: false, reason: 'invalid' };
    }

    if (token.isRevoked) {
      return { valid: false, reason: 'revoked' };
    }

    if (this.isTokenExpired(token)) {
      this.tokens.delete(tokenId);
      return { valid: false, reason: 'expired' };
    }

    return {
      valid: true,
      userId: token.userId,
      expiresAt: token.expiresAt,
    };
  }

  async generateToken(
    sessionId: string,
    options: CreateTokenOptions = {}
  ): Promise<string> {
    const tokenId = generateTokenId();
    const userId = options.userId || generateUserId();
    const expirationDays = options.expirationDays || DEFAULT_EXPIRATION_DAYS;

    const token: Token = {
      id: tokenId,
      sessionId,
      userId,
      createdAt: Date.now(),
      expiresAt: this.calculateExpirationTime(expirationDays),
      isRevoked: false,
    };

    this.tokens.set(tokenId, token);
    return tokenId; // For step 3, return simple string token
  }

  async validateToken(tokenId: string): Promise<TokenValidation> {
    return this.validateTokenExists(tokenId);
  }

  async revokeToken(tokenId: string): Promise<void> {
    const token = this.tokens.get(tokenId);
    if (token) {
      token.isRevoked = true;
    }
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    for (const token of this.tokens.values()) {
      if (token.userId === userId) {
        token.isRevoked = true;
      }
    }
  }

  async getTokenInfo(tokenId: string): Promise<Token | null> {
    return this.tokens.get(tokenId) || null;
  }

  async cleanExpiredTokens(): Promise<void> {
    const now = Date.now();

    for (const [tokenId, token] of this.tokens.entries()) {
      if (now > token.expiresAt) {
        this.tokens.delete(tokenId);
      }
    }
  }

  // For testing and monitoring
  getTokenCount(): number {
    return this.tokens.size;
  }
}

export const tokenService = new TokenService();
export default tokenService;
