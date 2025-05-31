import {
  CreateSessionOptions,
  Session,
  SessionStatus,
  SessionValidation,
} from '@src/models';
import { generateSessionId } from '@src/utils';

const DEFAULT_EXPIRATION_MINUTES = 10;

class SessionService {
  private sessions = new Map<string, Session>();

  private calculateExpirationTime(minutes: number): number {
    return Date.now() + minutes * 60 * 1000;
  }

  private isSessionExpired(session: Session): boolean {
    return Date.now() > session.expiresAt;
  }

  private validateSessionExists(sessionId: string): SessionValidation {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return { isValid: false, reason: 'not_found' };
    }

    if (this.isSessionExpired(session)) {
      this.sessions.delete(sessionId);
      return { isValid: false, reason: 'expired' };
    }

    return { isValid: true, session };
  }

  async createSession(options: CreateSessionOptions = {}): Promise<Session> {
    const sessionId = generateSessionId();
    const expirationMinutes =
      options.expirationMinutes || DEFAULT_EXPIRATION_MINUTES;

    const session: Session = {
      id: sessionId,
      status: SessionStatus.PENDING,
      createdAt: Date.now(),
      expiresAt: this.calculateExpirationTime(expirationMinutes),
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  async getSession(sessionId: string): Promise<Session | null> {
    const validation = this.validateSessionExists(sessionId);
    return validation.session || null;
  }

  async updateSessionStatus(
    sessionId: string,
    status: SessionStatus
  ): Promise<void> {
    const validation = this.validateSessionExists(sessionId);

    if (!validation.isValid || !validation.session) {
      throw new Error(
        `Cannot update session ${sessionId}: ${validation.reason}`
      );
    }

    validation.session.status = status;
  }

  async linkToken(sessionId: string, tokenId: string): Promise<void> {
    const validation = this.validateSessionExists(sessionId);

    if (!validation.isValid || !validation.session) {
      throw new Error(
        `Cannot link token to session ${sessionId}: ${validation.reason}`
      );
    }

    validation.session.tokenId = tokenId;
  }

  async cleanExpiredSessions(): Promise<void> {
    const now = Date.now();

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(sessionId);
      }
    }
  }

  // For testing and monitoring
  getSessionCount(): number {
    return this.sessions.size;
  }
}

export const sessionService = new SessionService();
