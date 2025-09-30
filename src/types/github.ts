/**
 * GitHub Repository Types
 */

export interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  cloneUrl: string;
  sshUrl: string;
  language: string | null;
  stargazersCount: number;
  forksCount: number;
  watchersCount: number;
  openIssuesCount: number;
  size: number;
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  pushedAt: string | null;
  topics: string[];
  license: {
    key: string;
    name: string;
    spdxId: string;
    url: string;
  } | null;
  owner: {
    login: string;
    id: number;
    avatarUrl: string;
    htmlUrl: string;
    type: string;
  };
}

export interface GitHubSearchResult {
  totalCount: number;
  incompleteResults: boolean;
  items: GitHubRepository[];
}

export interface GitHubFileContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  htmlUrl: string;
  gitUrl: string;
  downloadUrl: string | null;
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
}

export interface GitHubDirectoryContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  htmlUrl: string;
  gitUrl: string;
  downloadUrl: string | null;
  type: 'file' | 'dir';
}

export interface GitHubClient {
  searchRepositories(query: string, sort?: string, order?: string, perPage?: number, page?: number): Promise<GitHubSearchResult>;
  getRepository(owner: string, repo: string): Promise<GitHubRepository>;
  getRepositoryContents(owner: string, repo: string, path?: string, ref?: string): Promise<GitHubFileContent | GitHubDirectoryContent[]>;
  getRepositoryFile(owner: string, repo: string, path: string, ref?: string): Promise<GitHubFileContent>;
}
