
// src/lib/developer-service.ts
'use server';

import type { Developer, PaginatedDevelopersResponse, ProfileRepository } from '@/types';
import type { IRepository } from '@/models/RepositoryModel'; // Keep for potential direct DB ops if needed, though API is preferred

// Helper function to get the application's base URL
function getAPIBaseURL(): string {
  const appURL = process.env.NEXT_PUBLIC_APP_URL;
  if (appURL) {
    console.log(`[DeveloperService getAPIBaseURL] Using NEXT_PUBLIC_APP_URL: ${appURL}`);
    return appURL;
  }

  // Fallback for Vercel environments if NEXT_PUBLIC_APP_URL is not set
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
     console.log(`[DeveloperService getAPIBaseURL] Using NEXT_PUBLIC_VERCEL_URL: ${process.env.NEXT_PUBLIC_VERCEL_URL}`);
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  if (process.env.VERCEL_URL) { // VERCEL_URL is just the hostname
    const url = `https://${process.env.VERCEL_URL}`;
    console.log(`[DeveloperService getAPIBaseURL] Using VERCEL_URL (constructed): ${url}`);
    return url;
  }

  // Fallback for local development, using the port from package.json dev script
  const port = 9002; 
  const localURL = `http://localhost:${port}`;
  console.log(`[DeveloperService getAPIBaseURL] Using fallback local URL: ${localURL}`);
  return localURL;
}

const API_ROUTE_PREFIX = '/api';

export async function getPaginatedDevelopers(
  page: number,
  perPage: number,
  searchQuery: string // searchQuery is currently for display/future use by backend
): Promise<PaginatedDevelopersResponse> {
  const baseURL = getAPIBaseURL();
  const fetchURL = `${baseURL}${API_ROUTE_PREFIX}/leaderboard?page=${page}&perPage=${perPage}`;
  console.log(`[DeveloperService] Fetching paginated developers from: ${fetchURL}`);

  try {
    const response = await fetch(fetchURL, { cache: 'no-store' }); // Disable caching for leaderboard for now
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch leaderboard' }));
      console.error(`[DeveloperService] API error from ${fetchURL}: ${response.status}`, errorData);
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error(`[DeveloperService] Failed to fetch paginated developers from ${fetchURL}:`, error);
    return {
      developers: [],
      totalCount: 0,
      currentPage: page,
      totalPages: 0,
    };
  }
}

export async function getDeveloperByUsername(username: string): Promise<Developer | undefined> {
  const baseURL = getAPIBaseURL();
  const fetchURL = `${baseURL}${API_ROUTE_PREFIX}/users/${username}`;
  console.log(`[DeveloperService] Fetching developer by username from: ${fetchURL}`);

  try {
    const response = await fetch(fetchURL, { cache: 'no-store' }); // Disable caching for individual profiles for now
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`[DeveloperService] Developer ${username} not found via API: ${fetchURL}`);
        return undefined;
      }
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch developer profile' }));
      console.error(`[DeveloperService] API error from ${fetchURL}: ${response.status}`, errorData);
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error(`[DeveloperService] Failed to get developer ${username} from ${fetchURL}:`, error);
    return undefined;
  }
}

export async function triggerUserSync(username: string): Promise<{ message: string; user?: any; error?: string; details?: string }> {
  const baseURL = getAPIBaseURL();
  const fetchURL = `${baseURL}${API_ROUTE_PREFIX}/sync/${username}`;
  console.log(`[DeveloperService] Triggering user sync via: ${fetchURL}`);

  try {
    const response = await fetch(fetchURL, {
      method: 'POST',
    });
    const data = await response.json();
    if (!response.ok) {
      console.error(`[DeveloperService] Sync API error from ${fetchURL}: ${response.status}`, data);
      throw new Error(data.error || data.details || `Sync API error: ${response.status}`);
    }
    return data;
  } catch (error) {
    console.error(`[DeveloperService] Failed to trigger sync for ${username} via ${fetchURL}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
    return { error: 'Failed to trigger sync', details: errorMessage };
  }
}

export async function getUserRepositories(username: string): Promise<ProfileRepository[]> {
  const baseURL = getAPIBaseURL();
  const fetchURL = `${baseURL}${API_ROUTE_PREFIX}/users/${username}/repos`;
  console.log(`[DeveloperService] Fetching repositories for user ${username} from: ${fetchURL}`);

  try {
    const response = await fetch(fetchURL, { cache: 'no-store' });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Failed to fetch repositories for ${username}` }));
      console.error(`[DeveloperService] API error fetching repos from ${fetchURL}: ${response.status}`, errorData);
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    const data = await response.json();
    return data as ProfileRepository[];
  } catch (error) {
    console.error(`[DeveloperService] Failed to get repositories for ${username} from ${fetchURL}:`, error);
    return []; // Return empty array on error
  }
}
