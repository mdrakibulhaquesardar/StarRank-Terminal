
// src/app/api/sync/[username]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UserModel, { type IUser } from '@/models/UserModel';
import RepositoryModel from '@/models/RepositoryModel';
import { 
  getGitHubUserProfile, 
  getGitHubUserRepos, 
  getGitHubUserEvents, 
  getRepoLanguages,
  getGitHubUserGists,
  getGitHubUserOrgs,
} from '@/services/github';
import { awardBadges } from '@/lib/badge-logic';
import type { DeveloperStats } from '@/types';
import mongoose from 'mongoose';

const USER_DATA_STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

// Scoring logic
function calculateXpScore(
  totalStars: number,
  totalForks: number,
  weeklyCommits: number,
  totalFollowers: number
): number {
  return (totalStars * 4) + (totalForks * 2) + (weeklyCommits * 3) + totalFollowers;
}

export async function performUserSync(username: string): Promise<IUser | null> {
  if (!username) {
    console.error(`[Sync Service performUserSync] GitHub username is required for sync. Received: ${username}`);
    return null;
  }

  console.log(`[Sync Service performUserSync - ${username}] Attempting to sync data for user: ${username}`);

  try {
    console.log(`[Sync Service performUserSync - ${username}] Attempting to call dbConnect().`);
    await dbConnect(); 
    console.log(`[Sync Service performUserSync - ${username}] dbConnect() call completed. Current DB: ${mongoose.connection.name}`);

    // Check for existing, fresh data
    const existingUser = await UserModel.findOne({ githubUsername: username });
    if (existingUser && existingUser.lastSyncedAt) {
      const timeSinceLastSync = new Date().getTime() - new Date(existingUser.lastSyncedAt).getTime();
      if (timeSinceLastSync < USER_DATA_STALE_THRESHOLD_MS) {
        console.log(`[Sync Service performUserSync - ${username}] User data is fresh (synced ${Math.round(timeSinceLastSync / (1000 * 60))} mins ago). Returning from DB. DB: ${existingUser.db.name}`);
        return existingUser;
      } else {
        console.log(`[Sync Service performUserSync - ${username}] User data is stale (synced ${Math.round(timeSinceLastSync / (1000 * 60 * 60))} hours ago). Proceeding with GitHub sync.`);
      }
    } else if (existingUser) {
        console.log(`[Sync Service performUserSync - ${username}] User found but lastSyncedAt is missing. Proceeding with GitHub sync.`);
    } else {
        console.log(`[Sync Service performUserSync - ${username}] User not found in DB. Proceeding with GitHub sync.`);
    }

    console.log(`[Sync Service performUserSync - ${username}] Fetching GitHub data...`);
    const ghUserPromise = getGitHubUserProfile(username);
    const ghReposPromise = getGitHubUserRepos(username);
    const ghEventsPromise = getGitHubUserEvents(username);
    const ghGistsPromise = getGitHubUserGists(username);
    const ghOrgsPromise = getGitHubUserOrgs(username);

    const [ghUser, ghRepos, ghEvents, ghGists, ghOrgs] = await Promise.all([
      ghUserPromise,
      ghReposPromise,
      ghEventsPromise,
      ghGistsPromise,
      ghOrgsPromise,
    ]);

    if (!ghUser || !ghUser.login) {
        console.error(`[Sync Service performUserSync - ${username}] Could not fetch GitHub user profile or essential data missing (user might not exist or API error). Profile data:`, JSON.stringify(ghUser, null, 2));
        return null;
    }
    console.log(`[Sync Service performUserSync - ${username}] Fetched GitHub user profile for: ${ghUser.login}. Public Repos: ${ghUser.public_repos}, Followers: ${ghUser.followers}.`);
    console.log(`[Sync Service performUserSync - ${username}] Fetched ${ghRepos.length} repos, ${ghEvents.length} events, ${ghGists.length} gists, ${ghOrgs.length} orgs.`);

    console.log(`[Sync Service performUserSync - ${username}] Processing repositories and languages...`);
    const repoLanguagesPromises = ghRepos.map(repo => 
      getRepoLanguages(repo.languages_url).catch(e => {
        console.warn(`[Sync Service performUserSync - ${username}] Failed to fetch languages for ${repo.full_name}: ${(e as Error).message}`);
        return {}; 
      })
    );
    const allRepoLanguagesArray = await Promise.all(repoLanguagesPromises);
    
    const processedRepos = ghRepos.map((repo, index) => ({
      githubRepoId: repo.id,
      ownerUsername: ghUser.login, 
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      language: repo.language,
      languages: allRepoLanguagesArray[index] || {},
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      htmlUrl: repo.html_url,
      lastSyncedAt: new Date(),
    }));

    if (processedRepos.length > 0) {
      console.log(`[Sync Service performUserSync - ${username}] Upserting ${processedRepos.length} repositories into DB: ${mongoose.connection.name}...`);
      for (const repoData of processedRepos) {
        try {
          await RepositoryModel.findOneAndUpdate(
            { githubRepoId: repoData.githubRepoId },
            repoData,
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        } catch (repoDbError: any) {
          console.error(`[Sync Service performUserSync - ${username}] Database error upserting repo ${repoData.fullName} into DB ${mongoose.connection.name}:`, repoDbError.message, repoDbError.stack);
        }
      }
      console.log(`[Sync Service performUserSync - ${username}] Repositories synced into DB: ${mongoose.connection.name}.`);
    } else {
      console.log(`[Sync Service performUserSync - ${username}] No repositories to sync.`);
    }

    console.log(`[Sync Service performUserSync - ${username}] Aggregating user stats...`);
    const totalStars = ghRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = ghRepos.reduce((sum, repo) => sum + repo.forks_count, 0);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    let weeklyCommits = 0;
    ghEvents.forEach(event => {
      if (event.type === 'PushEvent' && event.payload?.commits && event.created_at && new Date(event.created_at) > sevenDaysAgo) {
        weeklyCommits += event.payload.commits.length;
      }
    });

    const userStats: DeveloperStats & { publicGistsCount: number } = { 
      totalStars,
      totalForks,
      totalFollowers: ghUser.followers,
      weeklyCommits,
      publicRepoCount: ghUser.public_repos,
      publicGistsCount: ghGists.filter(gist => gist.public).length,
    };
    console.log(`[Sync Service performUserSync - ${username}] User stats aggregated: Stars=${totalStars}, Forks=${totalForks}, Followers=${ghUser.followers}, Commits=${weeklyCommits}, Repos=${ghUser.public_repos}, Gists=${userStats.publicGistsCount}`);

    console.log(`[Sync Service performUserSync - ${username}] Determining top programming languages...`);
    const aggregatedLanguages: Record<string, number> = {};
    allRepoLanguagesArray.forEach(repoLangs => {
      for (const lang in repoLangs) {
        aggregatedLanguages[lang] = (aggregatedLanguages[lang] || 0) + repoLangs[lang];
      }
    });
    const topLanguages = Object.entries(aggregatedLanguages)
      .sort(([,a],[,b]) => b-a)
      .slice(0, 5) 
      .map(([lang]) => lang);
    console.log(`[Sync Service performUserSync - ${username}] Top languages: ${topLanguages.join(', ')}`);

    console.log(`[Sync Service performUserSync - ${username}] Awarding badges...`);
    const awardedUserBadges = awardBadges({
      stats: userStats, 
      programmingLanguages: topLanguages,
      organizations: ghOrgs,
    });
    console.log(`[Sync Service performUserSync - ${username}] Awarded badges: ${awardedUserBadges.map(b => b.title).join(', ')}`);
    
    const xpScore = calculateXpScore(
      userStats.totalStars,
      userStats.totalForks,
      userStats.weeklyCommits,
      userStats.totalFollowers
    );
    console.log(`[Sync Service performUserSync - ${username}] Calculated XP Score: ${xpScore}`);

    const userData: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'> = {
      githubUsername: ghUser.login, 
      avatarUrl: ghUser.avatar_url,
      name: ghUser.name || ghUser.login,
      country: ghUser.location || 'N/A', 
      location: ghUser.location || 'N/A',
      bio: ghUser.bio || 'No bio available.',
      xpScore,
      stats: userStats, 
      badges: awardedUserBadges,
      programmingLanguages: topLanguages,
      organizations: ghOrgs.map(org => ({ login: org.login, avatar_url: org.avatar_url})),
      lastSyncedAt: new Date(), // Set to current time for new/updated sync
      dataAiHint: `${ghUser.name || ghUser.login} developer programming`
    };

    console.log(`[Sync Service performUserSync - ${username}] User data prepared for DB. GitHub Username for query: ${userData.githubUsername}.`);
    console.log(`[Sync Service performUserSync - ${username}] Full UserData being passed to findOneAndUpdate:`, JSON.stringify(userData, null, 2));
    
    let syncedUser;
    try {
      console.log(`[Sync Service performUserSync - ${username}] Attempting UserModel.findOneAndUpdate with githubUsername: ${userData.githubUsername} targeting DB: ${mongoose.connection.name}`);
      syncedUser = await UserModel.findOneAndUpdate(
        { githubUsername: userData.githubUsername },
        userData, 
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`[Sync Service performUserSync - ${username}] findOneAndUpdate operation completed. Result (syncedUser):`, JSON.stringify(syncedUser, null, 2));

    } catch (dbError: any) {
      console.error(`[Sync Service performUserSync - ${username}] Database error during findOneAndUpdate for ${userData.githubUsername} in DB ${mongoose.connection.name}:`, dbError.message, dbError.stack);
      return null; 
    }

    if (syncedUser) {
      console.log(`[Sync Service performUserSync - ${username}] Successfully synced and saved/updated data for ${syncedUser.githubUsername}. User ID: ${syncedUser._id}, XP: ${syncedUser.xpScore}. Saved in DB: ${syncedUser.db.name}`);
    } else {
      console.error(`[Sync Service performUserSync - ${username}] Failed to save/update user data for ${userData.githubUsername}. findOneAndUpdate returned null. This might indicate an issue with the upsert operation or schema validation in DB: ${mongoose.connection.name}. User data was:`, JSON.stringify(userData, null, 2));
      return null; 
    }
    return syncedUser;

  } catch (error: any) {
    console.error(`[Sync Service performUserSync - ${username}] CRITICAL ERROR during sync process:`, error.message, error.stack);
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  const { username } = params;
  console.log(`[API /api/sync/${username}] POST request received to sync user.`);

  if (!username) {
    console.error('[API /api/sync/] GitHub username is required in POST request.');
    return NextResponse.json({ error: 'GitHub username is required' }, { status: 400 });
  }
  
  let syncedUser = null;
  try {
    syncedUser = await performUserSync(username);
  } catch (e: any) {
    console.error(`[API /api/sync/${username}] Error during performUserSync call:`, e.message, e.stack);
    const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred during sync operation.";
    return NextResponse.json({ error: 'Failed to sync developer data due to an internal error.', details: errorMessage }, { status: 500 });
  }

  if (syncedUser) {
    console.log(`[API /api/sync/${username}] Successfully synced data for ${username} via POST request. User ID: ${syncedUser._id}. DB: ${syncedUser.db.name}`);
    return NextResponse.json({ message: `Successfully synced data for ${username}. Check DB: ${syncedUser.db.name}`, user: syncedUser }, { status: 200 });
  } else {
    // This case should ideally be rare if performUserSync throws errors or returns a user.
    // However, if performUserSync returns null without throwing an error that reaches here,
    // it implies a non-exceptional failure to sync/save.
    const errorMessage = `Failed to sync or save developer data for ${username}. User might not exist on GitHub, or an internal issue prevented data storage. Check server logs for details from 'performUserSync'. Ensure DB connection is to the correct database (expected 'starRank').`;
    console.error(`[API /api/sync/${username}] Failed to sync data for ${username} via POST request because performUserSync returned null.`);
    return NextResponse.json({ error: 'Failed to sync or save developer data. Check server logs.', details: errorMessage }, { status: 500 });
  }
}
