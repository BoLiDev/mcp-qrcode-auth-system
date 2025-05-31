export interface GitLabProject {
  id: number;
  name: string;
  path: string;
  path_with_namespace: string;
  description: string | null;
  default_branch: string;
  visibility: 'private' | 'internal' | 'public';
  web_url: string;
  ssh_url_to_repo: string;
  http_url_to_repo: string;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  star_count: number;
  forks_count: number;
  issues_enabled: boolean;
  merge_requests_enabled: boolean;
  wiki_enabled: boolean;
  snippets_enabled: boolean;
  container_registry_enabled: boolean;
  archived: boolean;
  namespace: {
    id: number;
    name: string;
    path: string;
    kind: string;
    full_path: string;
  };
  owner?: {
    id: number;
    username: string;
    name: string;
    avatar_url: string;
  };
}

export interface GitLabApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

export interface GitLabServiceConfig {
  proxyBaseUrl: string;
  timeout: number;
}
