import { gitlabConfig } from '@src/config';

export interface GitLabRequestOptions {
  method: string;
  path: string;
  headers?: Record<string, string>;
  body?: string;
  query?: Record<string, string>;
}

export interface GitLabResponse {
  status: number;
  data: unknown;
  headers: Record<string, string>;
}

export class GitLabClient {
  private readonly config = gitlabConfig.getConfig();

  async makeRequest(options: GitLabRequestOptions): Promise<GitLabResponse> {
    const { method, path, headers = {}, body, query } = options;

    // Build URL with query parameters
    const url = new URL(path, this.config.baseUrl);
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    // Prepare headers with GitLab token
    const requestHeaders: Record<string, string> = {
      ...headers,
      Authorization: `Bearer ${this.config.token}`,
      'Content-Type': 'application/json',
    };

    // Remove client authorization header if present
    delete requestHeaders['authorization'];

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retryCount; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          this.config.timeout
        );

        const requestInit: RequestInit = {
          method,
          headers: requestHeaders,
          signal: controller.signal,
        };

        if (body) {
          requestInit.body = body;
        }

        const response = await fetch(url.toString(), requestInit);

        clearTimeout(timeoutId);

        // Convert response headers to plain object
        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        const data = await response.json();

        return {
          status: response.status,
          data,
          headers: responseHeaders,
        };
      } catch (error) {
        lastError = error as Error;
        console.error(`GitLab request attempt ${attempt} failed:`, error);

        if (attempt < this.config.retryCount) {
          // Exponential backoff: wait 1s, 2s, 4s
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('All retry attempts failed');
  }
}

export const gitlabClient = new GitLabClient();
