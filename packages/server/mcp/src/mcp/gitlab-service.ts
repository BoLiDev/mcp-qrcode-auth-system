import { TokenManager, TokenService } from '../shared';
import { HttpClient } from './http-client';
import { GitLabProject, GitLabServiceConfig } from './types';

export class GitLabService {
  private readonly config: GitLabServiceConfig;
  private readonly httpClient: HttpClient;
  private readonly tokenManager: TokenManager;
  private readonly tokenService: TokenService;

  constructor(
    config: GitLabServiceConfig,
    tokenManager: TokenManager,
    tokenService: TokenService
  ) {
    this.config = config;
    this.httpClient = new HttpClient(config.timeout);
    this.tokenManager = tokenManager;
    this.tokenService = tokenService;
  }

  public async getRepoInfo(
    projectId: string,
    fields?: string[]
  ): Promise<GitLabProject> {
    const token = await this.getValidToken();
    const apiPath = this.buildApiPath(projectId);
    const url = this.buildProxyUrl(apiPath);
    const headers = this.buildAuthHeaders(token);

    try {
      const response = await this.httpClient.get<GitLabProject>(url, headers);
      return this.filterProjectFields(response.data, fields);
    } catch (error) {
      await this.handleApiError(error, projectId);
      throw new Error('Unreachable code');
    }
  }

  public async listUserProjects(userId?: string): Promise<GitLabProject[]> {
    const token = await this.getValidToken();
    const apiPath = userId ? `/users/${userId}/projects` : '/projects';
    const url = this.buildProxyUrl(apiPath);
    const headers = this.buildAuthHeaders(token);

    try {
      const response = await this.httpClient.get<GitLabProject[]>(url, headers);
      return response.data;
    } catch (error) {
      await this.handleApiError(error, userId || 'current user');
      throw new Error('Unreachable code');
    }
  }

  private async getValidToken(): Promise<string> {
    const token = await this.tokenManager.getToken();

    if (!token) {
      throw new Error(
        'No authentication token available. Please authenticate first.'
      );
    }

    return token;
  }

  private buildApiPath(projectId: string): string {
    // Transform project ID to API path
    // Support both numeric IDs and path-with-namespace format
    const encodedProjectId = encodeURIComponent(projectId);
    return `/api/v4/projects/${encodedProjectId}`;
  }

  private buildProxyUrl(apiPath: string): string {
    // Transform GitLab API path to proxy server format
    // /api/v4/projects/123 → http://localhost:3100/gitlab/api/v4/projects/123
    const proxyPath = `/gitlab${apiPath}`;
    return `${this.config.proxyBaseUrl}${proxyPath}`;
  }

  private buildAuthHeaders(token: string): Record<string, string> {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  private filterProjectFields(
    project: GitLabProject,
    fields?: string[]
  ): GitLabProject {
    if (!fields || fields.length === 0) {
      return project;
    }

    // Create a filtered object with only requested fields
    const filteredProject: Partial<GitLabProject> = {};

    for (const field of fields) {
      if (field in project) {
        (filteredProject as Record<string, unknown>)[field] =
          project[field as keyof GitLabProject];
      }
    }

    return filteredProject as GitLabProject;
  }

  private async handleApiError(
    error: unknown,
    identifier: string
  ): Promise<never> {
    if (error instanceof Error) {
      if (error.message.includes('404')) {
        throw new Error(`GitLab project not found: ${identifier}`);
      }
      if (error.message.includes('403') || error.message.includes('401')) {
        // Clear invalid token when we get authentication errors
        console.error('Authentication failed, clearing stored token...');
        await this.tokenManager.clearToken();
        await this.tokenService.startAuthFlowIfNeeded();
        throw new Error(
          `Authentication failed. Token has been cleared. Please re-authenticate.`
        );
      }
      if (error.message.includes('timeout')) {
        throw new Error(
          `Request timeout while accessing GitLab project: ${identifier}`
        );
      }

      throw new Error(`GitLab API error for ${identifier}: ${error.message}`);
    }

    throw new Error(
      `Unknown error while accessing GitLab project: ${identifier}`
    );
  }
}
