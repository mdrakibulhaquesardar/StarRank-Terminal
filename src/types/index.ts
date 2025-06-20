
export interface DeveloperBadge {
  id: string;
  emoji: string;
  title: string;
  explanation: string;
}

export interface DeveloperStats {
  totalStars: number;
  totalForks: number;
  totalFollowers: number;
  weeklyCommits: number;
  publicRepoCount: number;
  publicGistsCount?: number; // Added for Gist Master badge
}

export interface GitHubOrganization {
  login: string;
  avatar_url: string;
}

export interface Developer {
  id: string; // Typically githubUsername
  githubUsername: string;
  avatarUrl: string;
  name: string;
  country: string;
  location?: string;
  bio?: string;
  xpScore: number;
  rank?: number; 
  stats: DeveloperStats;
  badges: DeveloperBadge[];
  programmingLanguages: string[];
  organizations?: GitHubOrganization[];
  dataAiHint?: string;
}

export interface AIInsights {
  strengths: string;
  badgeExplanations: Record<string, string>;
  improvementSuggestions: string;
}

// For GitHub API search results (used by legacy code, may not be needed directly by frontend now)
export interface GitHubSearchUserItem {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
}

export interface GitHubUserSearchResult {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubSearchUserItem[];
}

// For our paginated developer list from the backend
export interface PaginatedDevelopersResponse {
  developers: Developer[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface ProfileRepository {
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  htmlUrl: string;
}
