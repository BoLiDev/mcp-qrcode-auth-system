import { randomBytes } from 'crypto';

import { ValidationSession } from '../types/validation.js';

export class SessionManager {
  private sessions = new Map<string, ValidationSession>();
  private readonly sessionExpirationMs = 10 * 60 * 1000; // 10 minutes

  public generateSessionId(): string {
    return randomBytes(16).toString('hex');
  }

  public createSession(): ValidationSession {
    const sessionId = this.generateSessionId();
    const now = Date.now();

    const session: ValidationSession = {
      sessionId,
      status: 'pending',
      createdAt: now,
      expiresAt: now + this.sessionExpirationMs,
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  public getSession(sessionId: string): ValidationSession | null {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return null;
    }

    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      session.status = 'expired';
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  public updateSessionStatus(
    sessionId: string,
    status: ValidationSession['status'],
    authToken?: string,
    error?: string
  ): boolean {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return false;
    }

    session.status = status;
    if (authToken) {
      session.authToken = authToken;
    }
    if (error) {
      session.error = error;
    }

    return true;
  }

  public cleanupExpiredSessions(): void {
    const now = Date.now();

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(sessionId);
      }
    }
  }

  // For testing and monitoring
  public getSessionCount(): number {
    return this.sessions.size;
  }
}
