
'use server';

import type { GitHubSearchUserItem, GitHubUserSearchResult } from '@/types';

const GITHUB_API_BASE_URL = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_ACCESS_TOKEN;

interface FetchOptions extends RequestInit {
  returnText?: boolean;
}

async function fetchGitHubAPI(endpoint: string, options: FetchOptions = {}) {
  const headers: HeadersInit = {
    ...options.headers,
    'Accept': 'application/vnd.github.v3+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  } else {
    console.warn("[GitHub Service] GITHUB_ACCESS_TOKEN is not set. API requests may be rate-limited or fail for private data.");
  }

  const url = endpoint.startsWith('http') ? endpoint : `${GITHUB_API_BASE_URL}${endpoint}`;
  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Could not retrieve error text.');
    if (response.status === 403) {
      console.error(`[GitHub Service] GitHub API Error 403 (Forbidden/Rate Limit) for ${url}. Headers: ${JSON.stringify(response.headers)}. Body: ${errorText}`);
    } else {
      console.error(`[GitHub Service] GitHub API Error: ${response.status} ${response.statusText} for ${url}. Body: ${errorText}`);
    }
    throw new Error(`GitHub API request failed: ${response.status} for ${url}. Details: ${errorText}`);
  }
  if (options.returnText) {
    return response.text();
  }
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null;
  }
  return response.json();
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  hireable: boolean | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string; id: number };
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  languages_url: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  // ... other fields as needed
}

export interface GitHubEvent {
  id: string;
  type: string;
  actor: { login: string; avatar_url: string; };
  repo: { name: string; url: string; };
  payload: {
    push_id?: number;
    size?: number;
    commits?: Array<{ sha: string; message: string; author: { name: string; email: string } }>;
  };
  public: boolean;
  created_at: string;
}

export interface GitHubGist {
  id: string;
  html_url: string;
  public: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
  files: Record<string, { filename: string; type: string; language: string; raw_url: string; size: number }>;
}

export interface GitHubOrg {
  login: string;
  id: number;
  avatar_url: string;
  description: string | null;
}

export interface GitHubContributor {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: string; // "User" or "Bot"
}

export async function getGitHubUserProfile(username: string): Promise<GitHubUser | null> {
  if (!username) throw new Error("GitHub username cannot be empty.");
  try {
    return await fetchGitHubAPI(`/users/${username}`);
  } catch (error) {
    console.error(`[GitHub Service] Failed to fetch profile for ${username}:`, (error as Error).message);
    return null; // Return null if user profile fetch fails
  }
}

export async function getGitHubUserRepos(username: string): Promise<GitHubRepo[]> {
  if (!username) throw new Error("GitHub username cannot be empty.");
  let page = 1;
  let allRepos: GitHubRepo[] = [];
  let keepFetching = true;

  while (keepFetching) {
    try {
      const reposInPage: GitHubRepo[] = await fetchGitHubAPI(`/users/${username}/repos?per_page=100&type=owner&sort=updated&page=${page}`);
      if (reposInPage && reposInPage.length > 0) {
        allRepos = allRepos.concat(reposInPage);
        page++;
        if (reposInPage.length < 100 || page > 5) { 
          keepFetching = false;
        }
      } else {
        keepFetching = false;
      }
    } catch (error) {
        console.error(`[GitHub Service] Failed to fetch repos page ${page} for ${username}:`, (error as Error).message);
        keepFetching = false; // Stop fetching if a page fails
    }
  }
  return allRepos;
}

export async function getGitHubUserEvents(username: string): Promise<GitHubEvent[]> {
  if (!username) throw new Error("GitHub username cannot be empty.");
  try {
    const events = await fetchGitHubAPI(`/users/${username}/events?per_page=100`);
    return events || [];
  } catch (error) {
    console.error(`[GitHub Service] Failed to fetch events for ${username}:`, (error as Error).message);
    return [];
  }
}

export async function getRepoLanguages(languagesUrl: string): Promise<Record<string, number>> {
  if (!languagesUrl) {
    return {};
  }
  try {
    const languages = await fetchGitHubAPI(languagesUrl);
    return languages || {};
  } catch (e) {
    console.warn(`[GitHub Service] Failed to fetch/parse languages from ${languagesUrl}:`, (e as Error).message);
    return {};
  }
}

export async function getGitHubUserGists(username: string): Promise<GitHubGist[]> {
  if (!username) throw new Error("GitHub username cannot be empty.");
   try {
    const gists = await fetchGitHubAPI(`/users/${username}/gists?per_page=100`);
    return gists || [];
  } catch (error) {
    console.error(`[GitHub Service] Failed to fetch gists for ${username}:`, (error as Error).message);
    return [];
  }
}

export async function getGitHubUserOrgs(username: string): Promise<GitHubOrg[]> {
  if (!username) throw new Error("GitHub username cannot be empty.");
  try {
    const orgs = await fetchGitHubAPI(`/users/${username}/orgs`);
    return orgs || [];
  } catch (error) {
    console.error(`[GitHub Service] Failed to fetch orgs for ${username}:`, (error as Error).message);
    return [];
  }
}


export async function searchGitHubUsers(query: string, page: number, perPage: number): Promise<GitHubUserSearchResult> {
  if (!query) throw new Error("Search query cannot be empty.");
  const endpoint = `/search/users?q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;
  return fetchGitHubAPI(endpoint);
}

export async function getRepoContributors(owner: string, repo: string): Promise<GitHubContributor[]> {
  if (!owner || !repo) throw new Error("Repository owner and name cannot be empty.");
  try {
    const contributors = await fetchGitHubAPI(`/repos/${owner}/${repo}/contributors?per_page=100`);
    return contributors || [];
  } catch (error) {
    console.error(`[GitHub Service] Failed to fetch contributors for ${owner}/${repo}:`, (error as Error).message);
    return []; // Return empty array on error
  }
}
