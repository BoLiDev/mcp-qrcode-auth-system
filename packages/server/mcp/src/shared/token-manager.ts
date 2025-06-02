import { KeychainManager } from './keychain-manager';
import { Config } from './types';

/**
 * 1. jwt
 * 2. Token rotation
 */

export class TokenManager {
  private readonly keychainManager: KeychainManager;

  constructor(config: Config) {
    this.keychainManager = new KeychainManager(
      config.storage.accountName,
      config.storage.service
    );
  }

  public async getToken(): Promise<string | null> {
    try {
      const token = await this.keychainManager.getPassword();
      return token;
    } catch {
      // console.error('Failed to get token:', error);
      return null;
    }
  }

  public async saveToken(token: string): Promise<void> {
    try {
      await this.keychainManager.savePassword(token);
      console.error('Token saved successfully');
    } catch (error) {
      console.error('Failed to save token:', error);
      throw error;
    }
  }

  public async clearToken(): Promise<void> {
    try {
      await this.keychainManager.clearPassword();
      console.error('Token cleared successfully');
    } catch (error) {
      console.error('Failed to clear token:', error);
      throw error;
    }
  }
}
