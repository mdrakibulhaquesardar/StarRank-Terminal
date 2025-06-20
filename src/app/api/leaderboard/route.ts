
// src/app/api/leaderboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/models/UserModel';
import type { Developer } from '@/types';
import { performUserSync } from '../sync/[username]/route';
import { searchGitHubUsers } from '@/services/github';
import mongoose from 'mongoose';

const ITEMS_PER_PAGE = 9;
const DYNAMIC_SEED_QUERY = "followers:>1000 sort:followers-desc type:user";
const DYNAMIC_SEED_COUNT = 20; // Number of users to fetch for dynamic seed
const SEED_DELAY_MS = 1500; // Delay in milliseconds between syncing each seed user

export async function GET(request: NextRequest) {
  console.log('[API /api/leaderboard] GET request received.');

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = parseInt(searchParams.get('perPage') || ITEMS_PER_PAGE.toString(), 10);

  console.log('[API /api/leaderboard] Request for page:', page, 'perPage:', perPage);

  try {
    console.log('[API /api/leaderboard] Attempting to call dbConnect().');
    await dbConnect();
    console.log(`[API /api/leaderboard] dbConnect() call completed. Current DB: ${mongoose.connection.name}`);

    let userCount = 0;
    try {
      userCount = await UserModel.countDocuments({});
      console.log(`[API /api/leaderboard] Initial user count from DB (${mongoose.connection.name}): ${userCount}`);
    } catch (countError: any) {
      console.error(`[API /api/leaderboard] Error counting documents in DB (${mongoose.connection.name}):`, countError.message, countError.stack);
      userCount = 0; 
    }

    if (userCount === 0) {
      console.log(`[API /api/leaderboard] Database '${mongoose.connection.name}' is empty. Attempting DYNAMIC SEEDING.`);
      console.log(`[API /api/leaderboard] Dynamic seed query: "${DYNAMIC_SEED_QUERY}", count: ${DYNAMIC_SEED_COUNT}`);
      let seedUsernames: string[] = [];
      try {
        const searchResult = await searchGitHubUsers(DYNAMIC_SEED_QUERY, 1, DYNAMIC_SEED_COUNT);
        console.log(`[API /api/leaderboard] GitHub search API reported total_count: ${searchResult?.total_count} for the query.`);
        if (searchResult && searchResult.items && searchResult.items.length > 0) {
          seedUsernames = searchResult.items.map(item => item.login);
          console.log(`[API /api/leaderboard] Found ${searchResult.items.length} user items from GitHub search API results (requested ${DYNAMIC_SEED_COUNT}).`);
          console.log(`[API /api/leaderboard] Usernames to process for seed:`, seedUsernames.join(', '));
        } else {
          console.warn(`[API /api/leaderboard] GitHub search for dynamic seed returned no users. Query: "${DYNAMIC_SEED_QUERY}"`);
        }
      } catch (searchError: any) {
        console.error(`[API /api/leaderboard] Error during GitHub user search for dynamic seed:`, searchError.message, searchError.stack);
      }

      if (seedUsernames.length > 0) {
        console.log(`[API /api/leaderboard - DYNAMIC SEEDING] Attempting to seed ${seedUsernames.length} users into DB: ${mongoose.connection.name}. A delay of ${SEED_DELAY_MS}ms will be applied between each user sync.`);
        
        let successfulSeedCount = 0;
        let failedSeedCount = 0;

        for (let i = 0; i < seedUsernames.length; i++) {
          const username = seedUsernames[i];
          console.log(`[API /api/leaderboard - DYNAMIC SEEDING] (${i+1}/${seedUsernames.length}) Starting sync for user: ${username} into DB: ${mongoose.connection.name}`);
          try {
            const syncResult = await performUserSync(username);
            if (syncResult) {
              console.log(`[API /api/leaderboard - DYNAMIC SEEDING] Successfully seeded user: ${username}. User ID: ${syncResult._id}. Saved in DB: ${syncResult.db.name}`);
              successfulSeedCount++;
            } else {
              console.warn(`[API /api/leaderboard - DYNAMIC SEEDING] Sync for user ${username} completed but returned no data (performUserSync returned null). User might not exist or internal sync/save issue in DB: ${mongoose.connection.name}.`);
              failedSeedCount++;
            }
          } catch (error: any) {
            console.error(`[API /api/leaderboard - DYNAMIC SEEDING] Failed to seed user ${username} due to an error:`, error.message, error.stack);
            failedSeedCount++;
          }
          if (i < seedUsernames.length - 1) { // Don't delay after the last user
            console.log(`[API /api/leaderboard - DYNAMIC SEEDING] Delaying for ${SEED_DELAY_MS}ms before next user...`);
            await new Promise(resolve => setTimeout(resolve, SEED_DELAY_MS));
          }
        }
        
        console.log(`[API /api/leaderboard] Dynamic seed process summary: Attempted: ${seedUsernames.length}, Succeeded: ${successfulSeedCount}, Failed: ${failedSeedCount}.`);
        console.log(`[API /api/leaderboard] Dynamic seed sync process attempt complete for DB: ${mongoose.connection.name}.`);
      } else {
        console.log(`[API /api/leaderboard] No users to seed from dynamic search. Database remains empty or sparsely populated if there were prior errors.`);
      }
    }

    const totalUsers = await UserModel.countDocuments({});
    console.log(`[API /api/leaderboard] Total users in DB (${mongoose.connection.name}) after potential seed: ${totalUsers}`);

    if (totalUsers === 0 && userCount === 0) { // Check if DB is still empty after attempting seed
        console.warn("[API /api/leaderboard] Database is still empty after seed attempt. This might indicate persistent issues with GitHub API or database writes.");
        // Potentially return an empty list or a specific message if no users could be seeded
    }

    const usersFromDb = await UserModel.find({})
      .sort({ xpScore: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean();

    console.log(`[API /api/leaderboard] Fetched ${usersFromDb.length} users from DB (${mongoose.connection.name}) for page ${page}.`);

    const developers: Developer[] = usersFromDb.map((user, index) => ({
      id: user.githubUsername,
      githubUsername: user.githubUsername,
      avatarUrl: user.avatarUrl,
      name: user.name,
      country: user.country,
      location: user.location,
      bio: user.bio,
      xpScore: user.xpScore,
      rank: (page - 1) * perPage + index + 1,
      stats: {
        totalStars: user.stats.totalStars,
        totalForks: user.stats.totalForks,
        totalFollowers: user.stats.totalFollowers,
        weeklyCommits: user.stats.weeklyCommits,
        publicRepoCount: user.stats.publicRepoCount,
        publicGistsCount: user.stats.publicGistsCount || 0,
      },
      badges: user.badges,
      programmingLanguages: user.programmingLanguages,
      dataAiHint: user.dataAiHint,
    }));

    return NextResponse.json({
      developers,
      totalCount: totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / perPage),
    });

  } catch (error: any) {
    console.error('[API /api/leaderboard] CRITICAL Error fetching leaderboard data:', error.message, error.stack);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch leaderboard data', details: errorMessage }, { status: 500 });
  }
}
