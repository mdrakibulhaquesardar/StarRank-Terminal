// src/app/api/users/[username]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/models/UserModel';
import type { Developer } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  const { username } = params;
  console.log(`[API /api/users/${username}] GET request received.`);

  if (!username) {
    console.error(`[API /api/users/] GitHub username is required.`);
    return NextResponse.json({ error: 'GitHub username is required' }, { status: 400 });
  }

  try {
    console.log(`[API /api/users/${username}] Attempting to call dbConnect().`);
    await dbConnect();
    console.log(`[API /api/users/${username}] dbConnect() call completed (or used cached connection).`);

    const userFromDb = await UserModel.findOne({ githubUsername: username }).lean();

    if (!userFromDb) {
      console.warn(`[API /api/users/${username}] Developer not found in database.`);
      return NextResponse.json({ error: 'Developer not found in database. Please sync first.' }, { status: 404 });
    }
    console.log(`[API /api/users/${username}] Found developer in database: ${userFromDb.githubUsername}`);

    // Calculate global rank
    let globalRank = 0;
    try {
      // Count users with a higher XP score
      const higherRankedUsersCount = await UserModel.countDocuments({ xpScore: { $gt: userFromDb.xpScore } });
      globalRank = higherRankedUsersCount + 1;
      console.log(`[API /api/users/${username}] Calculated global rank for ${userFromDb.githubUsername}: ${globalRank} (based on ${higherRankedUsersCount} users with higher XP).`);
    } catch (rankError) {
      console.error(`[API /api/users/${username}] Error calculating global rank for ${userFromDb.githubUsername}:`, rankError);
      // If rank calculation fails, we can proceed without it or return an error/default
      // For now, we'll let it be undefined or 0 if an error occurs, client will show "N/A"
    }
    
    const developer: Developer = {
      id: userFromDb.githubUsername,
      githubUsername: userFromDb.githubUsername,
      avatarUrl: userFromDb.avatarUrl,
      name: userFromDb.name,
      country: userFromDb.country,
      location: userFromDb.location,
      bio: userFromDb.bio,
      xpScore: userFromDb.xpScore,
      rank: globalRank > 0 ? globalRank : undefined, // Assign calculated global rank, fallback to undefined if calc fails
      stats: {
        totalStars: userFromDb.stats.totalStars,
        totalForks: userFromDb.stats.totalForks,
        totalFollowers: userFromDb.stats.totalFollowers,
        weeklyCommits: userFromDb.stats.weeklyCommits,
        publicRepoCount: userFromDb.stats.publicRepoCount,
        publicGistsCount: userFromDb.stats.publicGistsCount || 0,
      },
      badges: userFromDb.badges,
      programmingLanguages: userFromDb.programmingLanguages,
      organizations: userFromDb.organizations?.map(org => ({ // Ensure orgs is an array
        login: org.login,
        avatar_url: org.avatar_url,
      })) || [],
      dataAiHint: userFromDb.dataAiHint,
    };

    return NextResponse.json(developer);

  } catch (error) {
    console.error(`[API /api/users/${username}] Error fetching user ${username}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch developer data', details: errorMessage }, { status: 500 });
  }
}
