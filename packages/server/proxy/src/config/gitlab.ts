import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export interface GitLabConfig {
  baseUrl: string;
  token: string;
  timeout: number;
  retryCount: number;
  logLevel: string;
}

export interface ConfigStatus {
  loaded: boolean;
  baseUrl?: string;
  hasToken: boolean;
  timeout: number;
  retryCount: number;
  logLevel: string;
}

class GitLabConfigManager {
  private config: GitLabConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): GitLabConfig {
    return {
      baseUrl: process.env['GITLAB_BASE_URL'] || 'https://gitlab.com',
      token: process.env['GITLAB_TOKEN'] || '',
      timeout: parseInt(process.env['PROXY_TIMEOUT'] || '30000'),
      retryCount: parseInt(process.env['RETRY_COUNT'] || '3'),
      logLevel: process.env['LOG_LEVEL'] || 'info',
    };
  }

  getConfig(): GitLabConfig {
    return { ...this.config };
  }

  getStatus(): ConfigStatus {
    return {
      loaded: true,
      baseUrl: this.config.baseUrl,
      hasToken:
        !!this.config.token &&
        this.config.token !== 'hardcoded-token-placeholder',
      timeout: this.config.timeout,
      retryCount: this.config.retryCount,
      logLevel: this.config.logLevel,
    };
  }

  updateToken(token: string): void {
    this.config.token = token;
  }

  isConfigValid(): boolean {
    return !!(this.config.baseUrl && this.config.token);
  }
}

export const gitlabConfig = new GitLabConfigManager();
