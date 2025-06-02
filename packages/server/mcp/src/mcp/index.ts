import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { createSharedConfig, TokenManager, TokenService } from '../shared';
import { GitLabService } from './gitlab-service';

const config = createSharedConfig();
const tokenManager = new TokenManager(config);
const tokenService = new TokenService(config, tokenManager);
const gitlabService = new GitLabService(
  {
    proxyBaseUrl: config.proxyServer.baseUrl,
    timeout: config.proxyServer.timeout,
  },
  tokenManager
);

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
      await tokenService.startAuthFlowIfNeeded(currentPath);
      return {
        content: [
          {
            type: 'text',
            text: 'Authentication flow started. Please do not perform any further action until user next query',
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      return {
        content: [{ type: 'text', text: errorMessage }],
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
