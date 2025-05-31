import { gitlabClient, GitLabRequestOptions } from '@src/services';
import { ResponseHelper, UrlHelper } from '@src/utils';
import { Request, Response } from 'express';

export class GitLabController {
  static async proxyRequest(req: Request, res: Response): Promise<void> {
    try {
      const gitlabPath = UrlHelper.rewriteGitLabPath(req.path);
      const query = UrlHelper.extractQueryParams(req.url);

      const requestOptions: Partial<GitLabRequestOptions> = {
        method: req.method,
        path: gitlabPath,
        headers: req.headers as Record<string, string>,
        query,
      };

      if (
        ['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase()) &&
        req.body
      ) {
        requestOptions.body = JSON.stringify(req.body);
      }

      const gitlabResponse = await gitlabClient.makeRequest(
        requestOptions as GitLabRequestOptions
      );

      const excludeHeaders = [
        'content-length',
        'transfer-encoding',
        'connection',
      ];
      Object.entries(gitlabResponse.headers).forEach(([key, value]) => {
        if (!excludeHeaders.includes(key.toLowerCase())) {
          res.setHeader(key, value);
        }
      });

      console.log('gitlabResponse', gitlabResponse);

      res.status(gitlabResponse.status).json(gitlabResponse.data);
    } catch (error) {
      console.error('GitLab proxy error:', error);

      if (error instanceof Error && error.name === 'AbortError') {
        res.status(504).json(ResponseHelper.error('Gateway timeout'));
      } else {
        res
          .status(502)
          .json(
            ResponseHelper.error('Bad gateway - GitLab service unavailable')
          );
      }
    }
  }
}
