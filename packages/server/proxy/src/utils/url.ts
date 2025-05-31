export class UrlHelper {
  /**
   * Remove /gitlab prefix from path for GitLab API forwarding
   * @param originalPath - Original request path
   * @returns Rewritten path without /gitlab prefix
   */
  static rewriteGitLabPath(originalPath: string): string {
    if (originalPath.startsWith('/gitlab')) {
      return originalPath.substring(7); // Remove '/gitlab' prefix
    }
    return originalPath;
  }

  /**
   * Check if path is a GitLab proxy path
   * @param path - Request path
   * @returns True if path starts with /gitlab
   */
  static isGitLabPath(path: string): boolean {
    return path.startsWith('/gitlab');
  }

  /**
   * Build full GitLab API URL
   * @param baseUrl - GitLab base URL
   * @param path - API path (without /gitlab prefix)
   * @returns Full GitLab API URL
   */
  static buildGitLabUrl(baseUrl: string, path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBaseUrl}${cleanPath}`;
  }

  /**
   * Extract query parameters from URL
   * @param url - Full URL with query parameters
   * @returns Query parameters object
   */
  static extractQueryParams(url: string): Record<string, string> {
    const urlObj = new URL(url, 'http://localhost');
    const params: Record<string, string> = {};

    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  }
}
