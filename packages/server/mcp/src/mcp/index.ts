import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import axios from 'axios';
import { z } from 'zod';

import { createSharedConfig, TokenManager } from '../shared';
import { GitLabService } from './gitlab-service';

const config = createSharedConfig();
const tokenManager = new TokenManager(config);
const gitlabService = new GitLabService(
  {
    proxyBaseUrl: config.proxyServer.baseUrl,
    timeout: config.proxyServer.timeout,
  },
  tokenManager
);

// Helper function to poll validation status
async function pollValidationStatus(
  sessionId: string,
  timeoutMs: number = 3 * 60 * 1000
): Promise<{ success: boolean; authToken?: string; error?: string }> {
  const startTime = Date.now();
  const pollInterval = 2000; // 2 seconds

  while (Date.now() - startTime < timeoutMs) {
    try {
      const response = await axios.get(
        `${config.tokenServer.callbackUrl.replace('/auth/callback', '')}/auth/validate/status?sessionId=${sessionId}`,
        { timeout: 5000 }
      );

      const { status, authToken, error } = response.data;

      console.error('Validation status:', status, authToken, error);

      if (status === 'success') {
        return { success: true, authToken };
      } else if (status === 'failed') {
        return { success: false, error: error || 'Authentication failed' };
      } else if (status === 'expired') {
        return { success: false, error: 'Session expired' };
      }

      // Status is still 'pending', continue polling
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    } catch (error) {
      console.error('Error polling validation status:', error);
      // Continue polling on network errors
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
  }

  return { success: false, error: 'Authentication timeout (3 minutes)' };
}

const server = new McpServer(
  {
    name: 'GitLab MCP Server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {
        'start-auth-flow': {
          description:
            'Start authentication flow. NEVER call this tool before user grants permission by positively answering the question.',
        },
      },
    },
  }
);

server.tool(
  'start-auth-flow',
  {
    currentPath: z
      .string()
      .describe(
        "Current opened file's absolute path. If not file opened, use project root path"
      ),
  },
  async ({ currentPath }) => {
    try {
      // Step 1: Start validation session
      const startResponse = await axios.post(
        `${config.tokenServer.callbackUrl.replace('/auth/callback', '')}/auth/validate/start`,
        {},
        {
          params: currentPath ? { currentPath } : {},
          timeout: 10000,
        }
      );

      const { sessionId, qrCodeUrl } = startResponse.data;

      console.error(`Authentication started - Session: ${sessionId}`);
      console.error(`QR Code URL: ${qrCodeUrl}`);

      // Step 2: Poll for completion
      const result = await pollValidationStatus(sessionId);

      if (result.success) {
        console.error('Authentication completed successfully');
        return {
          content: [
            {
              type: 'text',
              text: 'Authentication flow completed successfully. You can now use GitLab tools.',
            },
          ],
        };
      } else {
        console.error(`Authentication failed: ${result.error}`);
        return {
          content: [
            {
              type: 'text',
              text: `Authentication failed: ${result.error}. Please try again.`,
            },
          ],
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      console.error('Auth flow error:', errorMessage);
      return {
        content: [
          { type: 'text', text: `Authentication error: ${errorMessage}` },
        ],
      };
    }
  }
);

// GitLab repository information tool
server.tool(
  'get-gitlab-repo-info',
  {
    projectId: z
      .string()
      .describe('GitLab project ID or path (e.g., "123" or "group/project")'),
    fields: z
      .array(z.string())
      .optional()
      .describe('Specific fields to return (optional)'),
  },
  async ({ projectId, fields }) => {
    try {
      const repoInfo = await gitlabService.getRepoInfo(projectId, fields);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(repoInfo, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                error: true,
                message: errorMessage,
                projectId,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  }
);

// List user projects tool
server.tool(
  'list-gitlab-projects',
  {
    userId: z
      .string()
      .optional()
      .describe(
        'User ID to list projects for (optional, defaults to current user)'
      ),
  },
  async ({ userId }) => {
    try {
      const projects = await gitlabService.listUserProjects(userId);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(projects, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                error: true,
                message: errorMessage,
                userId: userId || 'current user',
              },
              null,
              2
            ),
          },
        ],
      };
    }
  }
);

export async function runMcpServer(): Promise<void> {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('GitLab MCP Server running...');
    console.error(
      'Available tools: get-gitlab-repo-info, list-gitlab-projects'
    );
  } catch (error) {
    console.error(`Error starting MCP Server: ${error}`);
    process.exit(1);
  }
}
