
// src/app/api/users/[username]/repos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import RepositoryModel, { type IRepository } from '@/models/RepositoryModel';
import type { ProfileRepository } from '@/types';

const REPOS_LIMIT = 6; // Number of repositories to return

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  const { username } = params;
  console.log(`[API /api/users/${username}/repos] GET request received.`);

  if (!username) {
    console.error(`[API /api/users/.../repos] GitHub username is required.`);
    return NextResponse.json({ error: 'GitHub username is required' }, { status: 400 });
  }

  try {
    console.log(`[API /api/users/${username}/repos] Attempting to call dbConnect().`);
    await dbConnect();
    console.log(`[API /api/users/${username}/repos] dbConnect() call completed.`);

    const userReposFromDb: IRepository[] = await RepositoryModel.find({ ownerUsername: username })
      .sort({ stars: -1 }) // Sort by stars descending
      .limit(REPOS_LIMIT)
      .lean();

    if (!userReposFromDb || userReposFromDb.length === 0) {
      console.log(`[API /api/users/${username}/repos] No repositories found for user.`);
      return NextResponse.json([]); // Return empty array if no repos
    }
    console.log(`[API /api/users/${username}/repos] Found ${userReposFromDb.length} repositories for user.`);

    const profileRepos: ProfileRepository[] = userReposFromDb.map(repo => ({
      name: repo.name,
      fullName: repo.fullName,
      description: repo.description,
      language: repo.language,
      stars: repo.stars,
      forks: repo.forks,
      htmlUrl: repo.htmlUrl,
    }));

    return NextResponse.json(profileRepos);

  } catch (error) {
    console.error(`[API /api/users/${username}/repos] Error fetching repositories for ${username}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch repositories', details: errorMessage }, { status: 500 });
  }
}
