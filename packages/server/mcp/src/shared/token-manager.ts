import { promises as fs } from 'fs';
import { dirname } from 'path';

import { Config } from './types.js';

export class TokenManager {
  private readonly tokenPath: string;

  constructor(config: Config) {
    this.tokenPath = config.storage.tokenPath;
  }

  public async getToken(): Promise<string | null> {
    try {
      const token = await this.readTokenFromFile();
      return token;
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  }

  public async saveToken(token: string): Promise<void> {
    try {
      await this.ensureDirectoryExists();
      await this.writeTokenToFile(token);
      console.error('Token saved successfully');
    } catch (error) {
      console.error('Failed to save token:', error);
      throw error;
    }
  }

  public async clearToken(): Promise<void> {
    try {
      await this.deleteTokenFile();
      console.error('Token cleared successfully');
    } catch (error) {
      console.error('Failed to clear token:', error);
      throw error;
    }
  }

  private async readTokenFromFile(): Promise<string | null> {
    try {
      const data = await fs.readFile(this.tokenPath, 'utf-8');
      const tokenData = JSON.parse(data);
      return tokenData.token || null;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  private async writeTokenToFile(token: string): Promise<void> {
    const tokenData = {
      token,
      createdAt: new Date().toISOString(),
    };
    await fs.writeFile(this.tokenPath, JSON.stringify(tokenData, null, 2));
  }

  private async ensureDirectoryExists(): Promise<void> {
    const dir = dirname(this.tokenPath);
    await fs.mkdir(dir, { recursive: true });
  }

  private async deleteTokenFile(): Promise<void> {
    try {
      await fs.unlink(this.tokenPath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}
