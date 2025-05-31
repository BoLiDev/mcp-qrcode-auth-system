import axios, { AxiosResponse } from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

import { TokenManager } from './token-manager';
import { Config, TokenValidationResponse } from './types';

const execAsync = promisify(exec);

export class TokenService {
  private readonly config: Config;
  private readonly tokenManager: TokenManager;

  constructor(config: Config, tokenManager: TokenManager) {
    this.config = config;
    this.tokenManager = tokenManager;
  }

  public async checkTokenOnStartup(): Promise<void> {
    const token = await this.tokenManager.getToken();

    if (!token) {
      console.error('No token found, starting auth flow...');
      await this.startAuthFlowIfNeeded();
      return;
    }

    console.error('Token found, validating...');
    const isValid = await this.validateToken(token);

    if (!isValid) {
      console.error(
        'Token is invalid or expired, clearing and starting auth flow...'
      );
      await this.tokenManager.clearToken();
      await this.startAuthFlowIfNeeded();
    } else {
      console.error('Token is valid, ready to use');
    }
  }

  public async validateToken(token: string): Promise<boolean> {
    try {
      const url = `${this.config.externalServices.authServiceUrl}/api/user/validate`;

      console.error(`Validating token with: ${url}`);

      const response: AxiosResponse<TokenValidationResponse> = await axios.get(
        url,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: this.config.proxyServer.timeout,
        }
      );

      const validationResult = response.data;

      if (validationResult.valid) {
        console.error(
          `Token is valid, userId: ${validationResult.userId}, expires at: ${new Date(validationResult.expiresAt || 0).toISOString()}`
        );
        return true;
      } else {
        console.error(
          `Token validation failed: ${validationResult.error} (${validationResult.reason})`
        );
        return false;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data;

        console.error(`Token validation failed with HTTP ${status}:`, data);

        // 401/403 means token is invalid/expired
        if (status === 401 || status === 403) {
          return false;
        }
      }

      console.error('Token validation error:', error);
      // On network errors, assume token might still be valid to avoid unnecessary re-auth
      return true;
    }
  }

  public async processCallback(authToken: string): Promise<void> {
    if (!authToken) {
      throw new Error('Auth token is required');
    }

    await this.tokenManager.saveToken(authToken);
    console.error('Authentication completed successfully');
  }

  public async getStoredToken(): Promise<string | null> {
    return await this.tokenManager.getToken();
  }

  public async startAuthFlowIfNeeded(): Promise<void> {
    await this.openBrowserForAuth();
  }

  private async openBrowserForAuth(): Promise<void> {
    const sessionId = `session_${Date.now()}`;
    const url = `${this.config.externalServices.qrCodeUrl}?sessionId=${sessionId}&callback=${encodeURIComponent(this.config.tokenServer.callbackUrl)}`;

    try {
      await this.openUrl(url);
      console.error(`Browser opened for authentication: ${url}`);
    } catch (error) {
      console.error('Failed to open browser:', error);
      console.error(`Please manually open: ${url}`);
    }
  }

  private async openUrl(url: string): Promise<void> {
    const platform = process.platform;
    let command: string;

    switch (platform) {
      case 'darwin':
        command = `open "${url}"`;
        break;
      case 'win32':
        command = `start "${url}"`;
        break;
      default:
        command = `xdg-open "${url}"`;
        break;
    }

    await execAsync(command);
  }
}
