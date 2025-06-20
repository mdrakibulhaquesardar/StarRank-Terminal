
import type { Developer, DeveloperStats } from '@/types';

// More weight for recent activity and community engagement
const SCORE_WEIGHTS = {
  STARS: 2,
  FORKS: 3,
  FOLLOWERS: 1,
  WEEKLY_COMMITS: 10, // Higher weight for recent activity
  PUBLIC_REPOS: 0.5,
};

export function calculateXpScore(stats: DeveloperStats): number {
  return (
    stats.totalStars * SCORE_WEIGHTS.STARS +
    stats.totalForks * SCORE_WEIGHTS.FORKS +
    stats.totalFollowers * SCORE_WEIGHTS.FOLLOWERS +
    stats.weeklyCommits * SCORE_WEIGHTS.WEEKLY_COMMITS +
    stats.publicRepoCount * SCORE_WEIGHTS.PUBLIC_REPOS
  );
}

// This function takes developers without rank/xp, calculates them, and returns sorted developers
export function assignRanksAndXp(
  developers: Omit<Developer, 'rank' | 'xpScore'>[]
): Developer[] {
  const scoredDevelopers = developers.map(dev => ({
    ...dev,
    xpScore: calculateXpScore(dev.stats),
  }));

  // Sort by XP score in descending order
  scoredDevelopers.sort((a, b) => b.xpScore - a.xpScore);

  // Assign ranks
  return scoredDevelopers.map((dev, index) => ({
    ...dev,
    rank: index + 1,
  }));
}

    